<?php
// Protected file manager for files inside /uploads only.
// Supported actions: rename, move, delete

header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function loadEnvFile(string $path): array {
    if (!is_file($path)) {
        return [];
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        return [];
    }

    $vars = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $value = trim($value, "\"'");
        if ($key !== '') {
            $vars[$key] = $value;
        }
    }

    return $vars;
}

function getUploadsRoot(): string {
    $root = realpath(__DIR__ . '/..');
    if ($root === false) {
        respond(['success' => false, 'error' => 'Unable to resolve uploads root'], 500);
    }

    return $root . DIRECTORY_SEPARATOR . 'uploads';
}

function getRealPathInsideUploads(string $uploadsRoot, string $relativePath): string {
    $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
    if ($relativePath === '' || str_contains($relativePath, "\0")) {
        respond(['success' => false, 'error' => 'Invalid file path'], 400);
    }

    $candidate = $uploadsRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
    $candidateDir = dirname($candidate);
    if (!is_dir($candidateDir)) {
        respond(['success' => false, 'error' => 'Target directory does not exist'], 400);
    }

    $resolvedDir = realpath($candidateDir);
    $resolvedUploads = realpath($uploadsRoot);
    if ($resolvedDir === false || $resolvedUploads === false) {
        respond(['success' => false, 'error' => 'Unable to resolve paths'], 500);
    }

    $prefix = rtrim($resolvedUploads, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($resolvedDir, $prefix) !== 0 && $resolvedDir !== $resolvedUploads) {
        respond(['success' => false, 'error' => 'Path is outside uploads directory'], 403);
    }

    $resolvedCandidate = realpath($candidate);
    if ($resolvedCandidate === false) {
        respond(['success' => false, 'error' => 'File not found'], 404);
    }

    $resolvedCandidateDir = dirname($resolvedCandidate);
    if (strpos($resolvedCandidateDir, $prefix) !== 0 && $resolvedCandidateDir !== $resolvedUploads) {
        respond(['success' => false, 'error' => 'Path is outside uploads directory'], 403);
    }

    return $resolvedCandidate;
}

function sanitizeSegment(string $value): string {
    $value = trim($value);
    $value = preg_replace('/[^A-Za-z0-9._-]/', '-', $value);
    $value = trim((string) $value, '.-');

    return $value !== '' ? $value : 'file';
}

function buildUploadsWebPath(string $relativePath): string {
    $relativePath = str_replace('\\', '/', $relativePath);
    $parts = array_map('rawurlencode', array_filter(explode('/', $relativePath), 'strlen'));
    return '/uploads/' . implode('/', $parts);
}

$uploadsRoot = getUploadsRoot();
$env = loadEnvFile($uploadsRoot . DIRECTORY_SEPARATOR . '.env');
$privateKey = $env['PRIVATE_KEY'] ?? '';

if ($privateKey === '') {
    respond(['success' => false, 'error' => 'PRIVATE_KEY is missing from uploads/.env'], 500);
}

$providedKey = (string) ($_REQUEST['key'] ?? '');
if ($providedKey === '' || !hash_equals($privateKey, $providedKey)) {
    respond(['success' => false, 'error' => 'Unauthorized'], 403);
}

$action = strtolower(trim((string) ($_REQUEST['action'] ?? '')));
$source = trim((string) ($_REQUEST['file'] ?? $_REQUEST['source'] ?? ''));

if ($action === '' || $source === '') {
    respond(['success' => false, 'error' => 'action and file are required'], 400);
}

$sourcePath = getRealPathInsideUploads($uploadsRoot, $source);
$sourceDir = dirname($sourcePath);
$sourceName = basename($sourcePath);
$sourceInfo = pathinfo($sourceName);
$sourceBaseName = $sourceInfo['filename'] ?? 'file';
$sourceExt = isset($sourceInfo['extension']) ? '.' . $sourceInfo['extension'] : '';

if ($action === 'delete') {
    if (!is_file($sourcePath)) {
        respond(['success' => false, 'error' => 'File not found'], 404);
    }

    if (!unlink($sourcePath)) {
        respond(['success' => false, 'error' => 'Failed to delete file'], 500);
    }

    respond([
        'success' => true,
        'action' => 'delete',
        'file' => $source,
    ]);
}

if ($action === 'rename') {
    $newName = trim((string) ($_REQUEST['new_name'] ?? $_REQUEST['name'] ?? ''));
    if ($newName === '') {
        respond(['success' => false, 'error' => 'new_name is required for rename'], 400);
    }

    $newName = sanitizeSegment($newName);
    $newPath = $sourceDir . DIRECTORY_SEPARATOR . $newName;

    if (is_dir($newPath)) {
        respond(['success' => false, 'error' => 'A directory already exists with that name'], 400);
    }

    if (file_exists($newPath)) {
        respond(['success' => false, 'error' => 'Target file already exists'], 409);
    }

    if (!rename($sourcePath, $newPath)) {
        respond(['success' => false, 'error' => 'Failed to rename file'], 500);
    }

    $relativeNewPath = str_replace($uploadsRoot . DIRECTORY_SEPARATOR, '', $newPath);
    $relativeNewPath = str_replace(DIRECTORY_SEPARATOR, '/', $relativeNewPath);

    respond([
        'success' => true,
        'action' => 'rename',
        'file' => $source,
        'new_file' => $relativeNewPath,
        'path' => buildUploadsWebPath($relativeNewPath),
    ]);
}

if ($action === 'move') {
    $destination = trim((string) ($_REQUEST['destination'] ?? $_REQUEST['to'] ?? ''));
    if ($destination === '') {
        respond(['success' => false, 'error' => 'destination is required for move'], 400);
    }

    $destination = ltrim(str_replace('\\', '/', $destination), '/');
    $destination = preg_replace('#/+#', '/', $destination);
    $destination = trim($destination);

    if ($destination === '' || str_contains($destination, '..')) {
        respond(['success' => false, 'error' => 'Invalid destination'], 400);
    }

    $destinationDir = $uploadsRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $destination);
    if (!is_dir($destinationDir)) {
        if (!mkdir($destinationDir, 0755, true) && !is_dir($destinationDir)) {
            respond(['success' => false, 'error' => 'Failed to create destination folder'], 500);
        }
    }

    $destinationDirReal = realpath($destinationDir);
    $uploadsRootReal = realpath($uploadsRoot);
    if ($destinationDirReal === false || $uploadsRootReal === false) {
        respond(['success' => false, 'error' => 'Unable to resolve destination'], 500);
    }

    $uploadsPrefix = rtrim($uploadsRootReal, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($destinationDirReal, $uploadsPrefix) !== 0 && $destinationDirReal !== $uploadsRootReal) {
        respond(['success' => false, 'error' => 'Destination is outside uploads directory'], 403);
    }

    $targetPath = $destinationDirReal . DIRECTORY_SEPARATOR . $sourceName;
    if (file_exists($targetPath)) {
        respond(['success' => false, 'error' => 'Target file already exists in destination'], 409);
    }

    if (!rename($sourcePath, $targetPath)) {
        respond(['success' => false, 'error' => 'Failed to move file'], 500);
    }

    $relativeNewPath = str_replace($uploadsRootReal . DIRECTORY_SEPARATOR, '', $targetPath);
    $relativeNewPath = str_replace(DIRECTORY_SEPARATOR, '/', $relativeNewPath);

    respond([
        'success' => true,
        'action' => 'move',
        'file' => $source,
        'new_file' => $relativeNewPath,
        'path' => buildUploadsWebPath($relativeNewPath),
    ]);
}

respond(['success' => false, 'error' => 'Unsupported action'], 400);