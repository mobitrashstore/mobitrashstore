<?php
/**
 * Mobi Trash Store - Pathao API Proxy
 * Resolves CORS issues on Production (cPanel) by routing API calls server-side.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$url = isset($_GET['url']) ? $_GET['url'] : null;

if (!$url) {
    echo "NO_URL_PROVIDED";
    exit;
}

// Security: Only allow Pathao API domains
if (strpos($url, 'https://api-hermes.pathao.com') !== 0) {
    http_response_code(403);
    echo "FORBIDDEN_DOMAIN";
    exit;
}

// Get Request Headers (Forwarding Authorization)
$headers = getallheaders();
$forwardHeaders = [];
if (isset($headers['Authorization'])) $forwardHeaders[] = 'Authorization: ' . $headers['Authorization'];
if (isset($headers['Content-Type'])) $forwardHeaders[] = 'Content-Type: ' . $headers['Content-Type'];
$forwardHeaders[] = 'Accept: application/json';

// Get Request Body
$input = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For compatibility with some local dev environments

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(["error" => "cURL failed: " . $error]);
} else {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo $result;
}
