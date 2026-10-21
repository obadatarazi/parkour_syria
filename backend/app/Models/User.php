<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Http\Docs\Schemas\UserSchema;
use App\Http\Traits\Filterable;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[UserSchema]
class User extends Authenticatable implements OAuthenticatable
{
    use Filterable, HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'type',
        'gender',
        'email',
        'password',
        'phone_number',
        'avatar_file_url',
        'active',
        'verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s',
        'verified_at' => 'datetime:Y-m-d H:i:s',
        'active' => 'boolean',
    ];

    protected $filterable = [
        'full_name' => 'like',
        'email' => 'like',
        'type' => '=',
        'gender' => '=',
        'active' => '=',
    ];

    protected $sorterable = ['id', 'full_name', 'email', 'created_at', 'gender'];

    protected $appends = ['gender_value', 'type_value'];

    /**
     * Emit datetimes in the application timezone (Asia/Damascus), not UTC ISO.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return Carbon::instance($date)
            ->timezone(config('app.timezone', 'Asia/Damascus'))
            ->format('Y-m-d H:i:s');
    }

    public function getGenderValueAttribute(): ?string
    {
        $gender = $this->attributes['gender'] ?? null;

        if ($gender === null) {
            return null;
        }

        return match ($gender) {
            'MALE' => __('enum.MALE'),
            'FEMALE' => __('enum.FEMALE'),
            default => $gender,
        };
    }

    public function getMyRoles()
    {
        return $this->roles->load('permissions');
    }

    public function toArray(): array
    {
        $attributes = parent::toArray();
        $camelCaseAttributes = [];

        foreach ($attributes as $key => $value) {
            $camelCaseAttributes[Str::camel($key)] = $value;
        }

        return $camelCaseAttributes;
    }

    public function getCustomGenderAttribute(): ?array
    {
        $gender = $this->attributes['gender'] ?? null;

        if ($gender === null) {
            return null;
        }

        return [
            'label' => $this->getGenderValueAttribute(),
            'value' => $gender,
        ];
    }

    public function getTypeValueAttribute(): ?string
    {
        $type = $this->attributes['type'] ?? null;

        if ($type === null) {
            return null;
        }

        return match ($type) {
            'ADMIN' => __('enum.ADMIN'),
            'CUSTOMER' => __('enum.CUSTOMER'),
            default => $type,
        };
    }

    public function getCustomTypeAttribute(): ?array
    {
        $type = $this->attributes['type'] ?? null;

        if ($type === null) {
            return null;
        }

        return [
            'label' => $this->getTypeValueAttribute(),
            'value' => $type,
        ];
    }
}
