<?php
// Proxies /sitemap.xml requests to the live sitemap generator (edge function),
// so search engines always receive an up-to-date sitemap from this domain.

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$sitemapUrl = 'https://tbuyrfpzmwghiwapixym.supabase.co/functions/v1/sitemap';

$xml = false;

if (function_exists('curl_init')) {
    $ch = curl_init($sitemapUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['Accept: application/xml'],
    ]);
    $xml = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($status !== 200) $xml = false;
} else {
    $ctx = stream_context_create(['http' => ['timeout' => 20]]);
    $xml = @file_get_contents($sitemapUrl, false, $ctx);
}

if ($xml === false) {
    // Fallback: minimal static sitemap if the generator is unreachable
    http_response_code(200);
    $base = 'https://www.compawnest.com';
    $pages = ['/', '/shop', '/blog', '/about', '/contact', '/faq', '/return-policy', '/privacy-policy', '/terms-of-service'];
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($pages as $p) {
        $xml .= "  <url><loc>{$base}{$p}</loc></url>\n";
    }
    $xml .= '</urlset>';
}

echo $xml;
