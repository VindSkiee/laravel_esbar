<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')->constrained('tables')->onDelete('cascade');
            $table->string('customer_name');
            $table->timestamp('payment_expires_at')->nullable();
            $table->string('payment_transaction_id')->nullable();
            $table->text('payment_qr_url')->nullable();
            $table->enum('payment_type', ['qris', 'gopay', 'bca_va'])->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->enum('status', ['Menunggu Pembayaran', 'Sedang Disiapkan', 'Selesai', 'Dibatalkan'])->default('Menunggu Pembayaran');
            $table->decimal('total', 10, 2);
            $table->string('tracking_code')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
