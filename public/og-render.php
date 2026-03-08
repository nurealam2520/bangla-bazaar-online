<?php
/**
 * Facebook/Social Media Crawler OG Tag Renderer
 * 
 * This script detects social media crawlers and serves proper OG meta tags
 * for SPA routes. Place this in public_html alongside index.html.
 * 
 * .htaccess will route crawler requests here before serving index.html.
 */

$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$request_uri = strtok($request_uri, '?'); // Remove query params
$base_url = 'https://compawnest.com';

// Default OG data
$og = [
    'title' => 'Pawnest — Premium Dog & Cat Products',
    'description' => 'Shop premium dog & cat food, toys, beds & accessories at Pawnest. Fast & secure shipping to USA, Canada, Australia & New Zealand.',
    'image' => $base_url . '/og-image.png',
    'url' => $base_url . $request_uri,
    'type' => 'website',
];

// Supabase config
$supabase_url = 'https://tbuyrfpzmwghiwapixym.supabase.co';
$supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidXlyZnB6bXdnaGl3YXBpeHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTQ5MjMsImV4cCI6MjA4Nzg5MDkyM30.YfgkgFuFWXSaaa7LEF4thPm3ppGkD-qHSeGvBkRwMSE';

/**
 * Fetch data from Supabase
 */
function supabase_get($url, $key, $endpoint) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url . '/rest/v1/' . $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $key,
            'Authorization: Bearer ' . $key,
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT => 5,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Route-specific OG tags
if (preg_match('#^/product/([a-zA-Z0-9-]+)#', $request_uri, $matches)) {
    // Product page
    $product_id = $matches[1];
    $data = supabase_get($supabase_url, $supabase_key, 'products?id=eq.' . urlencode($product_id) . '&is_active=eq.true&limit=1');
    if (!empty($data[0])) {
        $p = $data[0];
        $og['title'] = $p['name'] . ' — Pawnest';
        $og['description'] = substr($p['description'], 0, 160);
        $og['image'] = $p['image'] ?: $og['image'];
        $og['type'] = 'product';
    }
} elseif (preg_match('#^/blog/([a-zA-Z0-9-]+)#', $request_uri, $matches)) {
    // Blog post
    $slug = $matches[1];
    $data = supabase_get($supabase_url, $supabase_key, 'blog_posts?slug=eq.' . urlencode($slug) . '&is_published=eq.true&limit=1');
    if (!empty($data[0])) {
        $p = $data[0];
        $og['title'] = $p['title'] . ' — Pawnest Blog';
        $og['description'] = $p['excerpt'] ?: substr(strip_tags($p['content']), 0, 160);
        $og['image'] = $p['cover_image'] ?: $og['image'];
        $og['type'] = 'article';
    }
} elseif ($request_uri === '/shop' || $request_uri === '/shop/') {
    $og['title'] = 'Shop All Products — Pawnest';
    $og['description'] = 'Browse our complete collection of premium dog & cat products. Food, toys, beds, accessories & more.';
} elseif ($request_uri === '/about' || $request_uri === '/about/') {
    $og['title'] = 'About Pawnest — Our Story';
    $og['description'] = 'Learn about Pawnest and our mission to provide premium products for your beloved pets.';
} elseif ($request_uri === '/contact' || $request_uri === '/contact/') {
    $og['title'] = 'Contact Pawnest — Get in Touch';
    $og['description'] = 'Have questions? Contact our friendly support team. We\'re here to help with orders, products & more.';
} elseif ($request_uri === '/blog' || $request_uri === '/blog/') {
    $og['title'] = 'Pet Care Blog — Pawnest';
    $og['description'] = 'Expert pet care tips, guides & advice for dog and cat owners. Stay informed with Pawnest Blog.';
} elseif (preg_match('#^/category/(dogs|cats)#', $request_uri, $matches)) {
    $cat = ucfirst($matches[1]);
    $og['title'] = $cat . ' Products — Pawnest';
    $og['description'] = "Shop premium {$matches[1]} products. Food, toys, beds & accessories for your {$matches[1]}.";
}

// Output HTML with OG tags
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($og['title']) ?></title>
    <meta name="description" content="<?= htmlspecialchars($og['description']) ?>">
    <link rel="canonical" href="<?= htmlspecialchars($og['url']) ?>">

    <meta property="og:title" content="<?= htmlspecialchars($og['title']) ?>">
    <meta property="og:description" content="<?= htmlspecialchars($og['description']) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($og['image']) ?>">
    <meta property="og:url" content="<?= htmlspecialchars($og['url']) ?>">
    <meta property="og:type" content="<?= htmlspecialchars($og['type']) ?>">
    <meta property="og:site_name" content="Pawnest">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= htmlspecialchars($og['title']) ?>">
    <meta name="twitter:description" content="<?= htmlspecialchars($og['description']) ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($og['image']) ?>">

    <script>window.location.href = "<?= htmlspecialchars($og['url']) ?>";</script>
</head>
<body>
    <p>Redirecting to <a href="<?= htmlspecialchars($og['url']) ?>"><?= htmlspecialchars($og['title']) ?></a>...</p>
</body>
</html>