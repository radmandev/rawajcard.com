<?php
// Link-preview bots (WhatsApp, Facebook, X, Telegram, …) never run JS, so on /c/:slug they'd only
// see the app-wide tags baked into index.html — i.e. the Rawajcard logo. public/.htaccess routes
// those bots here instead. We look the card up through the same public RPC the SPA uses and swap
// the seo:start…seo:end block for the card's own title/description, using the card's uploaded
// company logo as the preview image (no image at all when it has none). The page still boots the
// normal SPA bundle, and any failure falls back to the untouched shell.
//
// card-og-config.php is written into dist/ at build time by scripts/generate-snapshots.mjs.

const SITE_URL = 'https://rawajcard.com';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$shell = @file_get_contents(__DIR__ . '/index.html');
if ($shell === false) {
    http_response_code(500);
    exit;
}

function e($s) {
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function fetch_card(array $config, $slug) {
    $url = rtrim($config['url'], '/') . '/rest/v1/rpc/get_public_card_by_slug';
    $headers = [
        'Content-Type: application/json',
        'apikey: ' . $config['key'],
        'Authorization: Bearer ' . $config['key'],
    ];
    $body = json_encode(['p_slug' => $slug]);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 5,
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    } else {
        // Without ignore_errors, any non-2xx response makes this return false
        $res = @file_get_contents($url, false, stream_context_create(['http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => 5,
        ]]));
        $status = $res === false ? 0 : 200;
    }

    if ($res === false || $status !== 200) return null;
    $rows = json_decode($res, true);
    return is_array($rows) && isset($rows[0]) && is_array($rows[0]) ? $rows[0] : null;
}

// Mirrors the <Seo> props in src/pages/PublicCard.jsx. Bots have no saved language, so an 'auto'
// card resolves to Arabic, the same default LanguageProvider uses.
function build_head_block(array $card, $slug) {
    $lang = $card['default_language'] ?? ($card['design']['default_language'] ?? 'auto');
    $isRTL = $lang !== 'en';
    $pick = function ($field) use ($card, $isRTL) {
        $ar = $card[$field . '_ar'] ?? '';
        return ($isRTL && $ar) ? $ar : ($card[$field] ?? '');
    };

    $name = $pick('name');
    $subtitle = implode($isRTL ? ' - ' : ' at ', array_filter([$pick('title'), $pick('company')]));
    $title = implode(' | ', array_filter([$name, $subtitle])) . ' | Rawajcard';

    $description = trim(preg_replace('/\s+/u', ' ', (string) $pick('bio')));
    if ($description === '') {
        $description = $isRTL
            ? "تواصل مع {$name} عبر بطاقة رواج كارد الرقمية."
            : "Connect with {$name}'s digital business card on Rawajcard.";
    }

    $url = SITE_URL . '/c/' . rawurlencode($slug);
    $logo = trim((string) ($card['company_logo'] ?? ''));
    $hasLogo = (bool) preg_match('#^https?://#i', $logo);

    $lines = [
        '<!-- seo:start — replaced per-card by card-og.php -->',
        '<title>' . e($title) . '</title>',
        '<meta name="description" content="' . e($description) . '" />',
        '<link rel="canonical" href="' . e($url) . '" />',
        '<meta property="og:type" content="profile" />',
        '<meta property="og:site_name" content="Rawajcard" />',
        '<meta property="og:title" content="' . e($title) . '" />',
        '<meta property="og:description" content="' . e($description) . '" />',
        '<meta property="og:url" content="' . e($url) . '" />',
    ];
    if ($hasLogo) $lines[] = '<meta property="og:image" content="' . e($logo) . '" />';
    $lines[] = '<meta name="twitter:card" content="summary" />';
    $lines[] = '<meta name="twitter:title" content="' . e($title) . '" />';
    $lines[] = '<meta name="twitter:description" content="' . e($description) . '" />';
    if ($hasLogo) $lines[] = '<meta name="twitter:image" content="' . e($logo) . '" />';
    $lines[] = '<!-- seo:end -->';

    return implode("\n    ", $lines);
}

$config = @include __DIR__ . '/card-og-config.php';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';

if (is_array($config) && !empty($config['url']) && !empty($config['key'])
    && preg_match('#^/c/([^/]+)/?$#', $path, $m)) {
    $slug = rawurldecode($m[1]);
    $card = fetch_card($config, $slug);
    if ($card) {
        $block = build_head_block($card, $slug);
        $html = preg_replace_callback('#<!-- seo:start.*?<!-- seo:end -->#s', function () use ($block) {
            return $block;
        }, $shell, 1);
        if ($html !== null) $shell = $html;
    }
}

echo $shell;
