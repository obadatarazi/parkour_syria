<?php

namespace App\Services;

use GdImage;
use Throwable;

/**
 * Resizes and re-encodes uploaded photos with GD, which shared PHP hosting ships by default.
 * Anything it cannot handle safely is left alone, an upload never fails because of it.
 */
class ImageOptimizer
{
    /** Above this many pixels GD would need more memory than shared hosting usually allows. */
    private const MAX_SOURCE_PIXELS = 40_000_000;

    /**
     * @return array{contents: string, extension: string}|null null when the file should be stored as sent
     */
    public function optimize(string $path, string $extension): ?array
    {
        if (!config('uploads.optimize_images') || !extension_loaded('gd')) {
            return null;
        }

        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            return null;
        }

        try {
            return $this->reencode($path, $extension);
        } catch (Throwable) {
            return null;
        }
    }

    private function reencode(string $path, string $extension): ?array
    {
        $info = @getimagesize($path);
        if ($info === false || $info[0] * $info[1] > self::MAX_SOURCE_PIXELS) {
            return null;
        }

        $image = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
            default => false,
        };
        if (!$image instanceof GdImage) {
            return null;
        }

        // Palette PNGs report colour indexes from imagecolorat(), the alpha check needs real pixels.
        imagepalettetotruecolor($image);

        if ($info[2] === IMAGETYPE_JPEG) {
            $image = $this->applyExifOrientation($image, $path);
        }

        $resized = $this->resize($image);
        $hasAlpha = $info[2] !== IMAGETYPE_JPEG && $this->hasTransparency($resized ?? $image);
        [$contents, $outputExtension] = $this->encode($resized ?? $image, $hasAlpha);

        // Re-encoding an already small, well compressed file can make it bigger: keep the original then.
        $originalSize = filesize($path) ?: PHP_INT_MAX;
        if ($contents === null || ($resized === null && strlen($contents) >= $originalSize)) {
            return null;
        }

        return ['contents' => $contents, 'extension' => $outputExtension];
    }

    /** A copy scaled down to the configured longest edge, or null when it already fits. */
    private function resize(GdImage $image): ?GdImage
    {
        $maxDimension = max(1, (int) config('uploads.max_image_dimension', 1920));
        $width = imagesx($image);
        $height = imagesy($image);
        $scale = $maxDimension / max($width, $height);

        if ($scale >= 1) {
            return null;
        }

        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagefill($resized, 0, 0, imagecolorallocatealpha($resized, 0, 0, 0, 127));
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        return $resized;
    }

    /** @return array{0: string|null, 1: string} */
    private function encode(GdImage $image, bool $hasAlpha): array
    {
        $quality = min(100, max(0, (int) config('uploads.image_quality', 80)));

        if (config('uploads.prefer_webp') && function_exists('imagewebp')) {
            imagesavealpha($image, true);

            return [$this->capture(fn () => imagewebp($image, null, $quality)), 'webp'];
        }

        if ($hasAlpha) {
            imagesavealpha($image, true);

            return [$this->capture(fn () => imagepng($image, null, 9)), 'png'];
        }

        imageinterlace($image, true);

        return [$this->capture(fn () => imagejpeg($image, null, $quality)), 'jpg'];
    }

    private function capture(callable $write): ?string
    {
        ob_start();
        $ok = $write();
        $contents = ob_get_clean();

        return $ok && is_string($contents) && $contents !== '' ? $contents : null;
    }

    /** Phone photos are often stored sideways with an EXIF flag; GD drops the flag, so apply it. */
    private function applyExifOrientation(GdImage $image, string $path): GdImage
    {
        if (!function_exists('exif_read_data')) {
            return $image;
        }

        $orientation = (int) (@exif_read_data($path)['Orientation'] ?? 1);
        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };

        return $rotated instanceof GdImage ? $rotated : $image;
    }

    /** Samples a grid of pixels rather than all of them, enough to tell a transparent PNG from an opaque one. */
    private function hasTransparency(GdImage $image): bool
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $stepX = max(1, intdiv($width, 64));
        $stepY = max(1, intdiv($height, 64));

        for ($y = 0; $y < $height; $y += $stepY) {
            for ($x = 0; $x < $width; $x += $stepX) {
                if (((imagecolorat($image, $x, $y) >> 24) & 0x7F) > 0) {
                    return true;
                }
            }
        }

        return false;
    }
}
