<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Events\PaymentSuccessEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Configure Midtrans
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Create payment for order
     */
    public function createPayment(Request $request, $orderId)
    {
        $order = Order::with(['items.menu', 'table'])->findOrFail($orderId);

        // Validate order can be paid
        if ($order->isPaid()) {
            throw ValidationException::withMessages([
                'order' => ['Order sudah dibayar.'],
            ]);
        }

        if ($order->status === 'Dibatalkan') {
            throw ValidationException::withMessages([
                'order' => ['Order sudah dibatalkan.'],
            ]);
        }

        $validated = $request->validate([
            'payment_type' => 'required|in:qris,gopay,bca_va',
        ]);

        // Prepare Midtrans transaction data
        $transactionDetails = [
            'order_id' => $order->tracking_code . '-' . time(),
            'gross_amount' => (int) $order->total,
        ];

        $itemDetails = $order->items->map(function ($item) {
            return [
                'id' => $item->menu_id,
                'price' => (int) $item->price,
                'quantity' => $item->quantity,
                'name' => $item->menu->name,
            ];
        })->toArray();

        $customerDetails = [
            'first_name' => $order->customer_name,
            'email' => 'customer@esbar.com', // Default email
        ];

        $enabledPayments = [$validated['payment_type']];

        $transactionData = [
            'transaction_details' => $transactionDetails,
            'item_details' => $itemDetails,
            'customer_details' => $customerDetails,
            'enabled_payments' => $enabledPayments,
        ];

        try {
            // Create Snap transaction
            $snapToken = Snap::getSnapToken($transactionData);
            
            // Get payment URL
            $paymentUrl = "https://app.sandbox.midtrans.com/snap/v2/vtweb/" . $snapToken;

            // Update order with payment info
            $order->payment_transaction_id = $transactionDetails['order_id'];
            $order->payment_type = $validated['payment_type'];
            $order->payment_expires_at = now()->addMinutes(15); // 15 minutes expiry
            
            // For QRIS, store the QR URL
            if ($validated['payment_type'] === 'qris') {
                $order->payment_qr_url = $paymentUrl;
            }
            
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil dibuat',
                'data' => [
                    'order_id' => $order->id,
                    'tracking_code' => $order->tracking_code,
                    'payment_url' => $paymentUrl,
                    'snap_token' => $snapToken,
                    'payment_type' => $validated['payment_type'],
                    'amount' => $order->total,
                    'expires_at' => $order->payment_expires_at,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans payment error: ' . $e->getMessage());
            
            throw ValidationException::withMessages([
                'payment' => ['Gagal membuat pembayaran. Silakan coba lagi.'],
            ]);
        }
    }

    /**
     * Webhook handler for payment notifications
     */
    public function webhook(Request $request)
    {
        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;
            $orderId = $notification->order_id;

            Log::info('Midtrans webhook received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
            ]);

            // Extract tracking code from order_id (format: ESB-XXXXX-timestamp)
            $trackingCode = explode('-', $orderId);
            array_pop($trackingCode); // Remove timestamp
            $trackingCode = implode('-', $trackingCode);

            $order = Order::where('tracking_code', $trackingCode)->first();

            if (!$order) {
                Log::error('Order not found for webhook', ['tracking_code' => $trackingCode]);
                return response()->json(['message' => 'Order not found'], 404);
            }

            // Verify signature
            $serverKey = config('services.midtrans.server_key');
            $hashedSignature = hash('sha512', $orderId . $notification->status_code . $notification->gross_amount . $serverKey);
            
            if ($hashedSignature !== $notification->signature_key) {
                Log::error('Invalid signature', ['order_id' => $orderId]);
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            // Handle payment status
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'accept') {
                    $this->setOrderAsPaid($order);
                }
            } elseif ($transactionStatus == 'settlement') {
                $this->setOrderAsPaid($order);
            } elseif ($transactionStatus == 'pending') {
                // Do nothing, order is already in pending status
            } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                // Set order as cancelled if payment failed
                if ($order->status === 'Menunggu Pembayaran') {
                    $order->status = 'Dibatalkan';
                    $order->save();
                }
            }

            return response()->json(['message' => 'Webhook processed successfully']);

        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus($orderId)
    {
        $order = Order::findOrFail($orderId);

        if (!$order->payment_transaction_id) {
            throw ValidationException::withMessages([
                'payment' => ['Payment belum dibuat untuk order ini.'],
            ]);
        }

        try {
            $status = \Midtrans\Transaction::status($order->payment_transaction_id);
            
            // Ensure status is an object
            if (is_array($status)) {
                $status = (object) $status;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'tracking_code' => $order->tracking_code,
                    'transaction_status' => $status->transaction_status,
                    'payment_type' => $status->payment_type,
                    'is_paid' => $order->isPaid(),
                    'paid_at' => $order->paid_at,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Check payment status error: ' . $e->getMessage());
            
            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'is_paid' => $order->isPaid(),
                    'message' => 'Unable to fetch payment status from Midtrans',
                ],
            ]);
        }
    }

    /**
     * Set order as paid
     */
    private function setOrderAsPaid($order)
    {
        if (!$order->isPaid()) {
            $order->paid_at = now();
            $order->status = 'Sedang Disiapkan';
            $order->save();

            Log::info('Order marked as paid', ['order_id' => $order->id]);

            // Broadcast payment success event
            event(new PaymentSuccessEvent($order));
        }
    }
}

