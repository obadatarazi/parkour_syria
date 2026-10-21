<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileSystemService
{
    /**
     * Get the relative path for the upload.
     *
     * @param string $entityPath
     * @return string
     */
    public function getUploadRelativePath(string $entityPath): string
    {
        $dateTime = now();

        return "uploads/{$entityPath}/{$dateTime->format('M-Y')}/";
    }

    /**
     * Upload a file to the specified entity path.
     *
     * @param UploadedFile $uploadedFile
     * @param string $entityPath
     * @return array
     */
    public function uploadFile(UploadedFile $uploadedFile, string $entityPath): array
    {
        $fileName = (string) Str::uuid();
        $extension = $this->resolveUploadExtension($uploadedFile);
        $fileSize = $uploadedFile->getSize();
        $relativePath = $this->getUploadRelativePath($entityPath);

        if ($extension !== '') {
            $fileName = "{$fileName}.{$extension}";
        }

        Storage::disk('public')->makeDirectory($relativePath);

        $filePath = '/storage' . '/' . $relativePath . $fileName;
        Storage::disk('public')->putFileAs($relativePath, $uploadedFile, $fileName);
        return [
            "fileName" => $fileName,
            "fileSize" => $fileSize,
            "fileUrl" => $filePath,
        ];
    }

    /**
     * Prefer a real image/video extension over an empty or generic `.bin` name
     * (CSV import often downloads media from extension-less URLs).
     */
    protected function resolveUploadExtension(UploadedFile $uploadedFile): string
    {
        $client = strtolower((string) preg_replace(
            '/[^a-zA-Z0-9]/',
            '',
            (string) $uploadedFile->getClientOriginalExtension()
        ));

        if ($client !== '' && $client !== 'bin') {
            return $client === 'jpeg' ? 'jpg' : $client;
        }

        $guessed = $uploadedFile->guessExtension();
        if (is_string($guessed) && $guessed !== '') {
            $guessed = strtolower($guessed);
            if ($guessed !== 'bin') {
                return $guessed === 'jpeg' ? 'jpg' : $guessed;
            }
        }

        $fromBytes = $this->extensionFromFileContents($uploadedFile->getRealPath() ?: null);
        if ($fromBytes !== null) {
            return $fromBytes;
        }

        return $client;
    }

    protected function extensionFromFileContents(?string $path): ?string
    {
        if ($path === null || $path === '' || !is_file($path)) {
            return null;
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            return null;
        }

        $header = fread($handle, 16);
        fclose($handle);

        if (!is_string($header) || $header === '') {
            return null;
        }

        return $this->extensionFromMagicBytes($header);
    }

    protected function extensionFromMagicBytes(string $header): ?string
    {
        if (str_starts_with($header, "\xFF\xD8\xFF")) {
            return 'jpg';
        }
        if (str_starts_with($header, "\x89PNG\r\n\x1A\n")) {
            return 'png';
        }
        if (str_starts_with($header, 'GIF87a') || str_starts_with($header, 'GIF89a')) {
            return 'gif';
        }
        if (strlen($header) >= 12 && str_starts_with($header, 'RIFF') && substr($header, 8, 4) === 'WEBP') {
            return 'webp';
        }

        return null;
    }

    /**
     * Remove a file from storage.
     *
     * @param string $filePath
     * @return void
     */
    public function removeFile(string $filePath): void
    {
        // Seeded and pasted images are full urls to somewhere else, there is nothing of ours to remove.
        if (empty($filePath) || preg_match('#^https?://#i', $filePath)) {
            return;
        }

        // Stored as the public url (`/storage/uploads/...`), the disk wants the path under its root.
        Storage::disk('public')->delete(Str::after($filePath, '/storage/'));
    }
}
