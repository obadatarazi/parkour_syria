<?php

namespace Tests\Unit\Http\Rules;

use App\Http\Rules\NoLineBreaksRule;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class NoLineBreaksRuleTest extends TestCase
{
    public function test_email_with_line_breaks_is_rejected(): void
    {
        foreach (["user@example.com\r\nBcc: victim@example.com", "user@example.com\nBcc: x@y.z", "user@exa\rmple.com"] as $email) {
            $validator = Validator::make(['email' => $email], ['email' => ['email', new NoLineBreaksRule()]]);

            $this->assertTrue($validator->fails(), json_encode($email));
        }
    }

    public function test_plain_email_passes(): void
    {
        $validator = Validator::make(['email' => 'user@example.com'], ['email' => ['email', new NoLineBreaksRule()]]);

        $this->assertFalse($validator->fails());
    }
}
