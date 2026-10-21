<?php

namespace App\Command;

use App\Services\SeoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Puts a build of the website (the SPA's `npm run build` output) where Laravel serves it: the
 * assets into public/, so the web server hands them out directly, and index.html out of public/,
 * so every page url reaches WebsiteController and gets its SEO data written in.
 */
class InstallWebsiteCommand extends Command
{
    protected $signature = 'website:install {dist=../dist : The website build folder}';

    protected $description = 'Copy the website build into public/ and its index.html where WebsiteController reads it';

    public function handle(): int
    {
        $dist = rtrim($this->argument('dist'), '/');
        $dist = str_starts_with($dist, '/') ? $dist : base_path($dist);

        if (! is_file("{$dist}/index.html")) {
            $this->error("No index.html in {$dist}. Build the website first (npm run build).");

            return self::FAILURE;
        }

        $target = (string) config('site.website.index_path');
        File::ensureDirectoryExists(dirname($target));
        File::copy("{$dist}/index.html", $target);

        // A site built for a folder (vite `base`, e.g. /parkour/) asks for /parkour/assets/...
        $folder = trim((string) config('site.website.base_path'), '/');
        $publicRoot = public_path($folder);

        $copied = 0;
        foreach (File::allFiles($dist) as $file) {
            $relative = $file->getRelativePathname();
            if ($relative === 'index.html') {
                continue;
            }

            $destination = $publicRoot.'/'.$relative;
            File::ensureDirectoryExists(dirname($destination));
            File::copy($file->getPathname(), $destination);
            $copied++;
        }

        SeoService::flushCache();

        $this->info("Website installed: index.html to {$target}, {$copied} files to {$publicRoot}.");

        return self::SUCCESS;
    }
}
