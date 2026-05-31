<?php
// Simple uploader service
// Usage: POST multipart/form-data with file field name indicated by ?file=fieldname (default 'file')
// and a query param ?type=users (folder name).
// Response: JSON { success: bool, path: string, name: string, id: string }

header('Content-Type: application/json; charset=utf-8');

function jsonError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// Upload root (one level up from this script)
$uploadRoot = realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($uploadRoot)) {
    if (!mkdir($uploadRoot, 0755, true)) {
        jsonError('Failed to create uploads directory', 500);
    }
}

$type = isset($_REQUEST['type']) && is_string($_REQUEST['type']) ? $_REQUEST['type'] : 'users';
// sanitize type to safe folder name
$type = preg_replace('/[^A-Za-z0-9_-]/', '', $type);
if ($type === '') $type = 'users';

$fileField = isset($_REQUEST['file']) && is_string($_REQUEST['file']) && $_REQUEST['file'] !== '' ? $_REQUEST['file'] : 'file';

if (!isset($_FILES[$fileField])) {
    jsonError('No file uploaded with field name: ' . $fileField, 400);
}

$file = $_FILES[$fileField];

if (!isset($file['error']) || is_array($file['error'])) {
    jsonError('Invalid file upload', 400);
}

switch ($file['error']) {
    case UPLOAD_ERR_OK:
        break;
    case UPLOAD_ERR_NO_FILE:
        jsonError('No file sent', 400);
        break;
    case UPLOAD_ERR_INI_SIZE:
    case UPLOAD_ERR_FORM_SIZE:
        jsonError('Exceeded filesize limit', 400);
        break;
    default:
        jsonError('Unknown errors', 500);
}

if (!is_uploaded_file($file['tmp_name'])) {
    jsonError('Possible file upload attack', 400);
}

// Helpers
function generateId16() {
    // include timestamp (hex) and random bytes, return 16-char hex string
    $ts = dechex(time());
    try {
        $rand = bin2hex(random_bytes(8));
    } catch (Exception $e) {
        $rand = bin2hex(openssl_random_pseudo_bytes(8));
    }
    $combined = $ts . $rand;
    // ensure at least 16 chars
    if (strlen($combined) < 16) $combined = str_pad($combined, 16, '0');
    return substr($combined, 0, 16);
}

$originalName = $file['name'];
$size = isset($file['size']) ? (int)$file['size'] : null;

$pathInfo = pathinfo($originalName);
$baseName = isset($pathInfo['filename']) ? $pathInfo['filename'] : 'file';
// sanitize base name
$baseName = preg_replace('/[^A-Za-z0-9_-]/', '-', $baseName);
$baseName = substr($baseName, 0, 100);
$ext = isset($pathInfo['extension']) ? strtolower(preg_replace('/[^A-Za-z0-9]/', '', $pathInfo['extension'])) : '';

$id = generateId16();

$targetDir = $uploadRoot . DIRECTORY_SEPARATOR . $type;
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        jsonError('Failed to create type directory', 500);
    }
}

$targetFilename = $baseName . '.' . $id . ($ext !== '' ? '.' . $ext : '');
$targetPath = $targetDir . DIRECTORY_SEPARATOR . $targetFilename;

// Avoid collisions by retrying a few times (very unlikely)
$attempt = 0;
while (file_exists($targetPath) && $attempt < 5) {
    $id = generateId16();
    $targetFilename = $baseName . '.' . $id . ($ext !== '' ? '.' . $ext : '');
    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $targetFilename;
    $attempt++;
}

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    jsonError('Failed to move uploaded file', 500);
}

@chmod($targetPath, 0644);

$mime = function_exists('mime_content_type') ? mime_content_type($targetPath) : 'application/octet-stream';

// Provide a relative web-friendly path starting from /uploads
$relativePath = '/uploads/' . rawurlencode($type) . '/' . rawurlencode($targetFilename);

echo json_encode([
    'success' => true,
    'path' => $relativePath,
    'name' => $targetFilename,
    'id' => $id,
    'size' => $size,
    'mime' => $mime,
]);

exit;
