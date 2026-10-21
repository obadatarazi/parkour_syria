<?php
namespace App\Models;

use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BaseModel extends Model
{
    /**
     * Emit datetimes in the application timezone (Asia/Damascus), not UTC ISO.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return Carbon::instance($date)
            ->timezone(config('app.timezone', 'Asia/Damascus'))
            ->format('Y-m-d H:i:s');
    }
    /**
     * Get an attribute from the model.
     *
     * @param  string  $key
     * @return mixed
     */
    public function getAttribute($key)
    {
        // Convert the key from camelCase to snake_case
        $key = Str::snake($key);
        return parent::getAttribute($key);
    }

    /**
     * Set a given attribute on the model.
     *
     * @param  string  $key
     * @param  mixed   $value
     * @return void
     */
    public function setAttribute($key, $value)
    {
        // Convert the key from camelCase to snake_case
        $key = Str::snake($key);
        parent::setAttribute($key, $value);
    }

    /**
     * Convert the model's attributes to an array.
     *
     * @return array
     */
    public function attributesToArray()
    {
        $attributes = parent::attributesToArray();

        return $this->convertToCamelCase($attributes);
    }

    /**
     * Convert the model instance to JSON.
     *
     * @param  int  $options
     * @return string
     */
    public function toJson($options = 0)
    {
        $array = $this->jsonSerialize();
        $camelCaseArray = $this->convertToCamelCase($array);

        return json_encode($camelCaseArray, $options);
    }

    /**
     * Convert array keys to camelCase.
     *
     * @param  array  $array
     * @return array
     */
    protected function convertToCamelCase(array $array)
    {
        $camelCaseArray = [];
        foreach ($array as $key => $value) {
            $camelCaseKey = Str::camel($key);
            $camelCaseArray[$camelCaseKey] = $value;
        }
        return $camelCaseArray;
    }

    public function getCustomTranslationsAttribute()
    {
        if($this->translations) {
            $data = [];
            foreach ($this->translations as $translation) {
                $data[$translation->locale] = $translation;
                unset($translation->locale);
            }
            return $data;
        }
    }
}
