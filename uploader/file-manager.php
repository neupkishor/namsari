<?php
require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
phpAppSendCorsHeaders();

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function phpAppFileManagerRespond(array $payload, int $status = 200): void {
    phpAppSendJson($payload, $status);
}

function phpAppFileManagerRequirePostMethod(): void {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($method !== 'POST') {
        phpAppError('Invalid method for request', 405);
    }
}

function phpAppFileManagerNormalizePublicFilePath(string $relativePath): string {
    $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
    return '/' . $relativePath;
}

$uploadsRoot = '';
phpAppFileManagerRequirePostMethod();
try {
    $uploadsRoot = phpAppGetUploadsRoot();
} catch (RuntimeException $exception) {
    phpAppError($exception->getMessage(), 500);
}

if ($uploadsRoot === '') {
    phpAppError('Unable to resolve uploads root', 500);
}

$authenticatedUser = phpAppRequireAuthenticatedUser();

$privateKey = phpAppGetPrivateKey();
if ($privateKey === '') {
    phpAppError('PRIVATE_KEY is missing from the shared .env file', 500);
}

$providedKey = phpAppGetRequestKey();
if ($providedKey === '' || !hash_equals($privateKey, $providedKey)) {
    phpAppError('Unauthorized', 403);
}

$action = strtolower(trim((string) ($_REQUEST['action'] ?? '')));
$source = trim((string) ($_REQUEST['file'] ?? $_REQUEST['source'] ?? ''));

if ($action === '' || $source === '') {
    phpAppError('action and file are required', 400);
}

if (!$authenticatedUser['isAdmin']) {
    phpAppError('Unauthorized', 403);
}

$sourcePath = phpAppEnsurePathInsideUploads($uploadsRoot, $source);
$sourceDir = dirname($sourcePath);
$sourceName = basename($sourcePath);
$sourcePublicPath = phpAppFileManagerNormalizePublicFilePath($source);

if ($action === 'delete') {
    if (!is_file($sourcePath)) {
        phpAppError('File not found', 404);
    }

    if (!unlink($sourcePath)) {
        phpAppError('Failed to delete file', 500);
    }

    phpAppFileManagerRespond([
        'success' => true,
        'action' => 'delete',
        'file' => $sourcePublicPath,
    ]);
}

if ($action === 'rename') {
    $newName = trim((string) ($_REQUEST['new_name'] ?? $_REQUEST['name'] ?? ''));
    if ($newName === '') {
        phpAppError('new_name is required for rename', 400);
    }

    $newName = phpAppSanitizeSegment($newName);
    $newPath = $sourceDir . DIRECTORY_SEPARATOR . $newName;

    if (file_exists($newPath)) {
        phpAppError('Target file already exists', 409);
    }

    if (!rename($sourcePath, $newPath)) {
        phpAppError('Failed to rename file', 500);
    }

    $relativeNewPath = str_replace($uploadsRoot . DIRECTORY_SEPARATOR, '', $newPath);
    $relativeNewPath = str_replace(DIRECTORY_SEPARATOR, '/', $relativeNewPath);
    $relativeNewPath = phpAppFileManagerNormalizePublicFilePath($relativeNewPath);

    phpAppFileManagerRespond([
        'success' => true,
        'action' => 'rename',
        'file' => $sourcePublicPath,
        'new_file' => $relativeNewPath,
    ]);
}

if ($action === 'move') {
    $destination = trim((string) ($_REQUEST['destination'] ?? $_REQUEST['to'] ?? ''));
    if ($destination === '') {
        phpAppError('destination is required for move', 400);
    }

    $destination = ltrim(str_replace('\\', '/', $destination), '/');
    $destination = preg_replace('#/+#', '/', $destination);
    $destination = trim((string) $destination);

    if ($destination === '' || str_contains($destination, '..')) {
        phpAppError('Invalid destination', 400);
    }

    $destinationDir = $uploadsRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $destination);
    if (!is_dir($destinationDir) && !mkdir($destinationDir, 0755, true) && !is_dir($destinationDir)) {
        phpAppError('Failed to create destination folder', 500);
    }

    $destinationDirReal = realpath($destinationDir);
    $uploadsRootReal = realpath($uploadsRoot);
    if ($destinationDirReal === false || $uploadsRootReal === false) {
        phpAppError('Unable to resolve destination', 500);
    }

    $uploadsPrefix = rtrim($uploadsRootReal, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($destinationDirReal, $uploadsPrefix) !== 0 && $destinationDirReal !== $uploadsRootReal) {
        phpAppError('Destination is outside uploads directory', 403);
    }

    $targetPath = $destinationDirReal . DIRECTORY_SEPARATOR . $sourceName;
    if (file_exists($targetPath)) {
        phpAppError('Target file already exists in destination', 409);
    }

    if (!rename($sourcePath, $targetPath)) {
        phpAppError('Failed to move file', 500);
    }

    $relativeNewPath = str_replace($uploadsRootReal . DIRECTORY_SEPARATOR, '', $targetPath);
    $relativeNewPath = str_replace(DIRECTORY_SEPARATOR, '/', $relativeNewPath);
    $relativeNewPath = phpAppFileManagerNormalizePublicFilePath($relativeNewPath);

    phpAppFileManagerRespond([
        'success' => true,
        'action' => 'move',
        'file' => $sourcePublicPath,
        'new_file' => $relativeNewPath,
    ]);
}

phpAppError('Unsupported action', 400);
