<?php
/**
 * PHP Image Proxy for Supabase Storage
 * Serves Supabase-hosted images through your own domain.
 * URL format: /uploads/{filename}
 * This script fetches the image from Supabase storage and serves it
 * with proper caching headers.
 */

// --- Configuration ---
$SUPABASE_URL = 'https://tbuyrfpzmwghiwapixym.supabase.co';
$BUCKET_NAME  = 'site-images';

// --- Get requested file ---
$requestUri = $_SERVER['REQUEST_URI'];
$filePath = preg_replace('#^/uploads/#', '', parse_url($requestUri, PHP_URL_PATH));

if (empty($filePath) || $filePath === $requestUri) {
    http_response_code(404);
    exit('File not found');
}

// Sanitize: only allow safe characters
if (!preg_match('/^[a-zA-Z0-9_\-\.\/]+$/', $filePath)) {
    http_response_code(400);
    exit('Invalid file path');
}

// --- Build Supabase storage URL ---
$remoteUrl = "{$SUPABASE_URL}/storage/v1/object/public/{$BUCKET_NAME}/{$filePath}";

// --- Check local cache first ---
$cacheDir = __DIR__ . '/.image-cache';
$cachePath = $cacheDir . '/' . md5($filePath);
$cacheMetaPath = $cachePath . '.meta';
$cacheMaxAge = 86400 * 7; // 7 days

if (file_exists($cachePath) && file_exists($cacheMetaPath) && (time() - filemtime($cachePath)) < $cacheMaxAge) {
    $meta = json_decode(file_get_contents($cacheMetaPath), true);
    header('Content-Type: ' . ($meta['content_type'] ?? 'image/jpeg'));
    header('Cache-Control: public, max-age=31536000');
    header('X-Cache: HIT');
    readfile($cachePath);
    exit;
}

// --- Fetch from Supabase ---
$ch = curl_init($remoteUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HEADER         => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpCode !== 200 || $response === false) {
    http_response_code(404);
    exit('Image not found');
}

$body = substr($response, $headerSize);

// --- Cache locally ---
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}
file_put_contents($cachePath, $body);
file_put_contents($cacheMetaPath, json_encode(['content_type' => $contentType]));

// --- Serve ---
header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=31536000');
header('X-Cache: MISS');
echo $body;
