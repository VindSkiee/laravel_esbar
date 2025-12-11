<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class Admin extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'username',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
    ];

    // Override getAuthPassword untuk authentication
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // Helper method untuk hash password
    public static function hashPassword($password)
    {
        return Hash::make($password);
    }

    // Verify password
    public function verifyPassword($password)
    {
        return Hash::check($password, $this->password_hash);
    }
}
