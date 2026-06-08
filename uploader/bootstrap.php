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

function phpAppGetAuthSecret(): string {
    $env = phpAppLoadEnvFile(phpAppGetAppEnvPath());
    $authSecret = trim((string) ($env['AUTH_SECRET'] ?? ''));

    return $authSecret !== '' ? $authSecret : trim((string) ($env['NEXTAUTH_SECRET'] ?? ''));
}

function phpAppGetRequestKey(): string {
    $header = (string) ($_SERVER['HTTP_X_NAMSARI_UPLOAD_KEY'] ?? '');
    if ($header !== '') {
        return trim($header);
    }

    return trim((string) ($_REQUEST['key'] ?? ''));
}

function phpAppBase64UrlDecode(string $value): string|false {
    $remainder = strlen($value) % 4;
    if ($remainder > 0) {
        $value .= str_repeat('=', 4 - $remainder);
    }

    return base64_decode(strtr($value, '-_', '+/'), true);
}

function phpAppBase64UrlEncode(string $value): string {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function phpAppVerifyUploadToken(string $token, string $secret): array {
    $parts = explode('.', $token);
    if (count($parts) !== 2 || $parts[0] === '' || $parts[1] === '') {
        phpAppError('Upload token is malformed', 403);
    }

    [$encodedPayload, $signature] = $parts;
    $expectedSignature = phpAppBase64UrlEncode(hash_hmac('sha256', $encodedPayload, $secret, true));
    if (!hash_equals($expectedSignature, $signature)) {
        phpAppError('Upload token signature is invalid', 403);
    }

    $decodedPayload = phpAppBase64UrlDecode($encodedPayload);
    if ($decodedPayload === false) {
        phpAppError('Upload token payload is invalid', 403);
    }

    $payload = json_decode($decodedPayload, true);
    if (!is_array($payload)) {
        phpAppError('Upload token payload is invalid', 403);
    }

    $now = time();
    if (($payload['aud'] ?? '') !== 'namsari-upload' || !isset($payload['exp']) || (int) $payload['exp'] < $now) {
        phpAppError('Upload token is expired or invalid', 403);
    }

    return $payload;
}

function phpAppDecodeJsonObject(string $value, string $errorMessage): array {
    $decoded = json_decode($value, true);
    if (!is_array($decoded)) {
        phpAppError($errorMessage, 403);
    }

    return $decoded;
}

function phpAppGetAuthTokenFromRequest(): string {
    $cookieToken = trim((string) ($_COOKIE['auth'] ?? ''));
    if ($cookieToken !== '') {
        return $cookieToken;
    }

    $authorization = trim((string) ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
    if (preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches) === 1) {
        return trim($matches[1]);
    }

    return '';
}

function phpAppVerifyAuthJwt(string $token): array {
    $secret = phpAppGetAuthSecret();
    if ($secret === '') {
        phpAppError('AUTH_SECRET or NEXTAUTH_SECRET is missing from the shared .env file', 500);
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3 || $parts[0] === '' || $parts[1] === '' || $parts[2] === '') {
        phpAppError('Auth token is malformed', 403);
    }

    [$encodedHeader, $encodedPayload, $signature] = $parts;
    $headerJson = phpAppBase64UrlDecode($encodedHeader);
    $payloadJson = phpAppBase64UrlDecode($encodedPayload);
    if ($headerJson === false || $payloadJson === false) {
        phpAppError('Auth token is invalid', 403);
    }

    $header = phpAppDecodeJsonObject($headerJson, 'Auth token header is invalid');
    $payload = phpAppDecodeJsonObject($payloadJson, 'Auth token payload is invalid');
    $algorithm = (string) ($header['alg'] ?? '');
    if ($algorithm !== 'HS256') {
        phpAppError('Unsupported auth token algorithm', 403);
    }

    $signedPayload = $encodedHeader . '.' . $encodedPayload;
    $expectedSignature = phpAppBase64UrlEncode(hash_hmac('sha256', $signedPayload, $secret, true));
    if (!hash_equals($expectedSignature, $signature)) {
        phpAppError('Auth token signature is invalid', 403);
    }

    $now = time();
    if (isset($payload['exp']) && (int) $payload['exp'] < $now) {
        phpAppError('Auth token is expired', 403);
    }

    $user = $payload['user'] ?? null;
    if (!is_array($user) && isset($payload['id'])) {
        $user = [
            'id' => $payload['id'],
            'type' => $payload['type'] ?? 'user',
            'role' => $payload['role'] ?? null,
            'operatingId' => $payload['operatingId'] ?? null,
        ];
    }

    if (!is_array($user) || !isset($user['id'])) {
        phpAppError('Auth token user is missing', 403);
    }

    $userType = strtolower((string) ($user['type'] ?? 'user'));
    $roleValue = $user['role'] ?? '';
    if (is_array($roleValue)) {
        $roleValue = $roleValue['role'] ?? $roleValue['name'] ?? '';
    }
    $role = strtolower((string) $roleValue);

    $user['type'] = $userType;
    $user['roleName'] = $role;
    $user['isAdmin'] = $userType === 'admin' || str_contains($role, 'admin');
    $user['isAgency'] = $userType === 'agency';
    $user['isAgent'] = in_array($userType, ['agent', 'agency_agent'], true);
    $user['isOwner'] = $userType === 'owner' || str_contains($role, 'owner');
    $user['isAdvertiser'] = $userType === 'advertiser';

    return [
        'payload' => $payload,
        'user' => $user,
    ];
}

function phpAppRequireAuthenticatedUser(): array {
    $token = phpAppGetAuthTokenFromRequest();
    if ($token === '') {
        phpAppError('Unauthorized', 403);
    }

    $auth = phpAppVerifyAuthJwt($token);
    return $auth['user'];
}

function phpAppRequireUploadPermission(array $user, string $type): void {
    if ($user['isAdmin']) {
        return;
    }

    if ($type === 'ads' && !$user['isAdvertiser']) {
        phpAppError('Unauthorized for ad uploads', 403);
    }

    if ($type === 'agencies' && !$user['isAgency'] && !$user['isOwner']) {
        phpAppError('Unauthorized for agency uploads', 403);
    }

    if ($type === 'files') {
        phpAppError('Unauthorized for file-manager uploads', 403);
    }
}

function phpAppCorsOrigin(): string {
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return '';
    }

    $env = phpAppLoadEnvFile(phpAppGetAppEnvPath());
    $allowedOrigins = array_filter(array_map('trim', explode(',', (string) ($env['UPLOAD_ALLOWED_ORIGINS'] ?? ''))));
    if (empty($allowedOrigins) || in_array($origin, $allowedOrigins, true)) {
        return $origin;
    }

    return '';
}

function phpAppSendCorsHeaders(): void {
    $origin = phpAppCorsOrigin();
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
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
