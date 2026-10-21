<?php

return [
    /*
     * Uploaded photos are resized and re-encoded so pages stay light on weak networks
     * (scope section 6). SVG and GIF are stored as sent: one is a document, the other may be animated.
     */
    'optimize_images' => env('UPLOADS_OPTIMIZE_IMAGES', true),

    // Longest edge, in pixels, after resizing. Smaller images are never enlarged.
    'max_image_dimension' => (int) env('UPLOADS_MAX_IMAGE_DIMENSION', 1920),

    // 0-100 for WebP and JPEG output.
    'image_quality' => (int) env('UPLOADS_IMAGE_QUALITY', 80),

    // WebP is used when the server's GD build can write it, otherwise JPEG (or PNG for transparent images).
    'prefer_webp' => env('UPLOADS_PREFER_WEBP', true),
];
