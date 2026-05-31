<?php

function phpAppLoadEnvFile(string $path): array {
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

function phpAppNormalizePath(string $path): string {
    $path = str_replace('\\', '/', $path);
    $isAbsolute = str_starts_with($path, '/');
    $segments = explode('/', $path);
    $stack = [];

    foreach ($segments as $segment) {
        if ($segment === '' || $segment === '.') {
            continue;
        }

        if ($segment === '..') {
            array_pop($stack);
            continue;
        }

        $stack[] = $segment;
    }

    $normalized = implode('/', $stack);
    return $isAbsolute ? '/' . $normalized : $normalized;
}

function phpAppResolvePath(string $baseDir, string $path): string {
    if ($path === '') {
        return '';
    }

    if (str_starts_with($path, '/') || preg_match('/^[A-Za-z]:[\\\/]/', $path) === 1) {
        return phpAppNormalizePath($path);
    }

    return phpAppNormalizePath($baseDir . DIRECTORY_SEPARATOR . $path);
}

function phpAppGetAppEnvPath(): string {
    $parentEnv = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
    if (is_file($parentEnv)) {
        return $parentEnv;
    }

    return __DIR__ . DIRECTORY_SEPARATOR . '.env';
}

function phpAppGetUploadsRoot(): string {
    $env = phpAppLoadEnvFile(phpAppGetAppEnvPath());
    $configured = trim((string) ($env['UPLOADS_ROOT'] ?? '../uploads'));

    $resolved = phpAppResolvePath(__DIR__, $configured);
    if ($resolved === '') {
        throw new RuntimeException('Unable to resolve uploads root');
    }

    $parent = dirname($resolved);
    if (!is_dir($parent)) {
        throw new RuntimeException('Uploads parent directory does not exist: ' . $parent);
    }

    if (!is_dir($resolved) && !mkdir($resolved, 0755, true) && !is_dir($resolved)) {
        throw new RuntimeException('Failed to create uploads root: ' . $resolved);
    }

    $realRoot = realpath($resolved);
    if ($realRoot === false) {
        throw new RuntimeException('Failed to resolve uploads root: ' . $resolved);
    }

    return $realRoot;
}

function phpAppGetPrivateKey(): string {
    $env = phpAppLoadEnvFile(phpAppGetAppEnvPath());
    return trim((string) ($env['PRIVATE_KEY'] ?? ''));
}

function phpAppGetRequestKey(): string {
    $header = (string) ($_SERVER['HTTP_X_NAMSARI_UPLOAD_KEY'] ?? '');
    if ($header !== '') {
        return trim($header);
    }

    return trim((string) ($_REQUEST['key'] ?? ''));
}

function phpAppBuildUploadsWebPath(string $relativePath): string {
    $relativePath = str_replace('\\', '/', $relativePath);
    $parts = array_map('rawurlencode', array_filter(explode('/', $relativePath), 'strlen'));
    return '/uploads/' . implode('/', $parts);
}

function phpAppSendJson(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function phpAppError(string $message, int $status = 400): void {
    phpAppSendJson(['success' => false, 'error' => $message], $status);
}

function phpAppRequirePostMethod(): void {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($method !== 'POST') {
        phpAppError('Invalid method for request', 405);
    }
}

function phpAppNormalizePublicFilePath(string $relativePath): string {
    $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
    return '/' . $relativePath;
}

function phpAppEnsurePathInsideUploads(string $uploadsRoot, string $relativePath): string {
    $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
    if ($relativePath === '' || str_contains($relativePath, "\0") || str_contains($relativePath, '..')) {
        phpAppError('Invalid file path', 400);
    }

    $candidate = $uploadsRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
    $candidateDir = dirname($candidate);
    if (!is_dir($candidateDir)) {
        phpAppError('Target directory does not exist', 400);
    }

    $resolvedDir = realpath($candidateDir);
    $resolvedUploads = realpath($uploadsRoot);
    if ($resolvedDir === false || $resolvedUploads === false) {
        phpAppError('Unable to resolve paths', 500);
    }

    $prefix = rtrim($resolvedUploads, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($resolvedDir, $prefix) !== 0 && $resolvedDir !== $resolvedUploads) {
        phpAppError('Path is outside uploads directory', 403);
    }

    $resolvedCandidate = realpath($candidate);
    if ($resolvedCandidate === false) {
        phpAppError('File not found', 404);
    }

    return $resolvedCandidate;
}

function phpAppSanitizeSegment(string $value): string {
    $value = trim($value);
    $value = preg_replace('/[^A-Za-z0-9._-]/', '-', $value);
    $value = trim((string) $value, '.-');

    return $value !== '' ? $value : 'file';
}

function phpAppGenerateId16(): string {
    $ts = dechex(time());
    try {
        $rand = bin2hex(random_bytes(8));
    } catch (Exception $e) {
        $rand = bin2hex(openssl_random_pseudo_bytes(8));
    }

    $combined = $ts . $rand;
    if (strlen($combined) < 16) {
        $combined = str_pad($combined, 16, '0');
    }

    return substr($combined, 0, 16);
}