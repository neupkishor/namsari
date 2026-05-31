<?php
require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
phpAppSendCorsHeaders();

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uploadsRoot = '';
phpAppRequirePostMethod();
try {
    $uploadsRoot = phpAppGetUploadsRoot();
} catch (RuntimeException $exception) {
    phpAppError($exception->getMessage(), 500);
}

if ($uploadsRoot === '') {
    phpAppError('Unable to resolve uploads root', 500);
}

$type = isset($_REQUEST['type']) && is_string($_REQUEST['type']) ? $_REQUEST['type'] : 'users';
$type = preg_replace('/[^A-Za-z0-9_-]/', '', $type);
if ($type === '') {
    $type = 'users';
}

$authenticatedUser = phpAppRequireAuthenticatedUser();
phpAppRequireUploadPermission($authenticatedUser, $type);

$fileField = isset($_REQUEST['file']) && is_string($_REQUEST['file']) && $_REQUEST['file'] !== '' ? $_REQUEST['file'] : 'file';
if (!isset($_FILES[$fileField])) {
    phpAppError('No file uploaded with field name: ' . $fileField, 400);
}

$file = $_FILES[$fileField];
if (!isset($file['error']) || is_array($file['error'])) {
    phpAppError('Invalid file upload', 400);
}

switch ($file['error']) {
    case UPLOAD_ERR_OK:
        break;
    case UPLOAD_ERR_NO_FILE:
        phpAppError('No file sent', 400);
    case UPLOAD_ERR_INI_SIZE:
    case UPLOAD_ERR_FORM_SIZE:
        phpAppError('Exceeded filesize limit', 400);
    default:
        phpAppError('Unknown upload error', 500);
}

if (!is_uploaded_file($file['tmp_name'])) {
    phpAppError('Possible file upload attack', 400);
}

$providedSignature = isset($_POST['upload_signature']) && is_string($_POST['upload_signature']) ? $_POST['upload_signature'] : '';
$providedSize = isset($_POST['upload_size']) ? (int) $_POST['upload_size'] : 0;
$providedName = isset($_POST['upload_name']) && is_string($_POST['upload_name']) ? $_POST['upload_name'] : '';

if ($providedName !== (string) $file['name']) {
    phpAppError('Upload name does not match request metadata', 403);
}

if ($providedSize !== (int) $file['size']) {
    phpAppError('Upload size does not match request metadata', 403);
}

$actualSignature = hash_file('sha256', $file['tmp_name']);
if (!is_string($actualSignature) || $providedSignature !== $actualSignature) {
    phpAppError('Upload signature does not match file contents', 403);
}

$originalName = $file['name'];
$size = isset($file['size']) ? (int) $file['size'] : null;
$pathInfo = pathinfo($originalName);
$baseName = isset($pathInfo['filename']) ? $pathInfo['filename'] : 'file';
$baseName = preg_replace('/[^A-Za-z0-9_-]/', '-', $baseName);
$baseName = substr($baseName, 0, 100);
$ext = isset($pathInfo['extension']) ? strtolower(preg_replace('/[^A-Za-z0-9]/', '', $pathInfo['extension'])) : '';
$id = phpAppGenerateId16();

$targetDir = $uploadsRoot . DIRECTORY_SEPARATOR . $type;
if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
    phpAppError('Failed to create type directory', 500);
}

$targetFilename = $baseName . '.' . $id . ($ext !== '' ? '.' . $ext : '');
$targetPath = $targetDir . DIRECTORY_SEPARATOR . $targetFilename;

$attempt = 0;
while (file_exists($targetPath) && $attempt < 5) {
    $id = phpAppGenerateId16();
    $targetFilename = $baseName . '.' . $id . ($ext !== '' ? '.' . $ext : '');
    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $targetFilename;
    $attempt++;
}

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    phpAppError('Failed to move uploaded file', 500);
}

@chmod($targetPath, 0644);
$mime = function_exists('mime_content_type') ? mime_content_type($targetPath) : 'application/octet-stream';
$relativePath = phpAppNormalizePublicFilePath($type . '/' . $targetFilename);

phpAppSendJson([
    'success' => true,
    'file' => $relativePath,
    'name' => $targetFilename,
    'id' => $id,
    'size' => $size,
    'mime' => $mime,
]);
