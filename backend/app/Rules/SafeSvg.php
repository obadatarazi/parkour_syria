<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * An SVG is a document, not a picture: it can carry scripts, event handlers and external
 * references, and the storage serves it as-is from the API's own origin. One that carries any of
 * them is refused rather than cleaned up. Any other file type passes untouched, `mimes:` rules it.
 */
class SafeSvg implements ValidationRule
{
    /**
     * @var list<string>
     */
    private const FORBIDDEN_PATTERNS = [
        '/<\s*script/i',
        '/<\s*foreignObject/i',
        '/<\s*(iframe|embed|object)\b/i',
        '/<!ENTITY/i',
        '/\son[a-z]+\s*=/i',
        '/(javascript|vbscript)\s*:/i',
        '/data\s*:\s*text\/html/i',
        '/<\s*set\b[^>]*attributeName\s*=\s*["\']?(href|xlink:href)/i',
        '/<\s*animate\b[^>]*attributeName\s*=\s*["\']?(href|xlink:href)/i',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $this->isSvg($value)) {
            return;
        }

        $content = @file_get_contents($value->getRealPath());

        if ($content === false || ! preg_match('/<svg[\s>]/i', $content)) {
            $fail(__('validation.safe_svg'));

            return;
        }

        foreach (self::FORBIDDEN_PATTERNS as $pattern) {
            if (preg_match($pattern, $content)) {
                $fail(__('validation.safe_svg'));

                return;
            }
        }
    }

    private function isSvg(UploadedFile $file): bool
    {
        return $file->guessExtension() === 'svg'
            || strtolower($file->getClientOriginalExtension()) === 'svg';
    }
}
