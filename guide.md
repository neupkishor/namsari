# Uploader Guide

This project uses a PHP upload service for media such as profile pictures, property images, ad images, and agency images.

The design is:

- main app: `main_app/*`
- PHP uploader app: `main_app/uploader_php_app/*`
- uploads storage: `main_app/../uploads`

The uploads directory lives one level outside the main repository.

Browser uploads go to the Next.js proxy:

```text
/api/upload
```

The Next.js server forwards the upload to the PHP uploader and adds the private key header.

## Environment Files

Shared `.env` at the repo root:

```ini
PRIVATE_KEY=change-this-to-a-long-random-secret
UPLOADS_ROOT=../../uploads
NEXT_PUBLIC_UPLOADER_URL=/api/upload
```

The main app uses `NEXT_PUBLIC_UPLOADER_URL` for browser uploads.
The Next.js upload route reads `PRIVATE_KEY` and forwards it to the PHP uploader in a server-side request.
The PHP uploader uses the same `PRIVATE_KEY` to protect upload, rename, move, and delete actions.
The `UPLOADS_ROOT` path points to the sibling uploads folder outside the repository.

## Requirements

- PHP 8.0+ recommended
- A web server that can execute PHP, such as nginx + PHP-FPM or Apache + PHP-FPM
- Writable uploads directory outside the repository, for example `/Users/neupkishor/Code/clients/uploads`
- The main app must POST multipart form data to the uploader endpoint

## Folder Structure

Files are stored under the external uploads root like this:

```text
/uploads/{type}/{originalName}.{randomId}.{extension}
```

Examples:

```text
/uploads/users/avatar.202605311234abcd.jpg
/uploads/properties/house.202605311235efgh.png
/uploads/ads/banner.202605311236ijkl.webp
```

The `type` value becomes the subfolder name.

## Request Contract

The browser sends multipart form data to `/api/upload`, and the server forwards it to PHP.

The upload request still includes:

- `type` - folder name such as `users`, `properties`, `ads`, or `agencies`
- `file` - the multipart file field name by default

Example request:

```http
POST /api/upload?type=users&file=file
Content-Type: multipart/form-data
```

If `file` is omitted, the PHP service defaults to `file`.

## Response Contract

Success response:

```json
{
  "success": true,
  "path": "/uploads/users/avatar.202605311234abcd.jpg",
  "name": "avatar.202605311234abcd.jpg",
  "id": "202605311234abcd",
  "size": 245678,
  "mime": "image/jpeg"
}
```

Failure response:

```json
{
  "success": false,
  "error": "Failed to move uploaded file"
}
```

## File Manager

The protected file manager lives at:

```text
https://namsari.com/uploader_php_app/file-manager.php
```

It supports:

- `action=rename`
- `action=move`
- `action=delete`

It requires:

- `key` - must match `PRIVATE_KEY` from the shared root `.env`
- `file` - the relative path inside `/uploads`

Examples:

```http
POST https://namsari.com/uploader_php_app/file-manager.php?action=rename&file=users/old.jpg&new_name=new.jpg&key=YOUR_PRIVATE_KEY
POST https://namsari.com/uploader_php_app/file-manager.php?action=move&file=users/old.jpg&destination=properties&key=YOUR_PRIVATE_KEY
POST https://namsari.com/uploader_php_app/file-manager.php?action=delete&file=users/old.jpg&key=YOUR_PRIVATE_KEY
```

## How the ID Works

The uploaded filename includes a 16 character ID that combines timestamp data and random bytes.

This helps avoid collisions and keeps file names unique.

## Local Development Setup

### 1. Create the external uploads folder

The uploads directory should live beside the repository:

```text
/Users/neupkishor/Code/clients/uploads
```

Make sure it exists and PHP can write to it.

### 2. Start the Next.js app and PHP server

For quick local testing, you can run the Next.js app and a PHP server side by side.

Start Next.js:

```bash
cd /Users/neupkishor/Code/clients/namsari
npm run dev
```

Start PHP from the project root so it can read the shared `.env` and write to the sibling uploads folder:

```bash
cd /Users/neupkishor/Code/clients/namsari
php -S localhost:8001 -t .
```

The upload proxy will be available at:

```text
http://localhost:3000/api/upload
```

### 3. Test with curl

```bash
curl -v \
  -F "file=@/path/to/image.jpg" \
  "http://localhost:3000/api/upload?type=users&file=file"
```

If the upload works, the response should include a `path` value under `/uploads/...`.

## nginx Configuration

If you want nginx to serve the Next.js app and also execute PHP uploads, use a split setup:

- Next.js runs on one port, for example `3000`
- PHP-FPM handles the uploader app
- nginx proxies requests to the correct backend

### Example nginx server block

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /Users/neupkishor/Code/clients/namsari;
    index index.php;

    client_max_body_size 25m;

    # Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # PHP uploader
    location ^~ /uploader_php_app/ {
        try_files $uri $uri/ /uploader_php_app/upload.php?$query_string;
    }

    location ~ ^/uploader_php_app/.*\.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index upload.php;
    }

    # Optional: serve uploaded files directly
    location ^~ /uploads/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## PHP-FPM Notes

The PHP-FPM pool must allow the web server user to write to the sibling uploads directory.

Useful checks:

```bash
sudo chown -R www-data:www-data /Users/neupkishor/Code/clients/uploads
sudo chmod -R 755 /Users/neupkishor/Code/clients/uploads
```

If your system uses a different web server user, replace `www-data` accordingly.

## Production Notes

- Keep `uploads/` outside the public root only if you proxy files through nginx.
- If files are served directly from `/uploads`, make sure the directory is writable and safe to expose.
- If you need access control, generate signed URLs or move uploads to object storage.

## Recommended Allowed Types

The current PHP script accepts any uploaded file extension and moves it to disk. In production, consider adding validation for:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

You may also want to enforce a max file size.

## Frontend Usage

The frontend should POST to the shared upload proxy like this:

```ts
const res = await fetch('/api/upload?type=properties&file=file', {
  method: 'POST',
  body: formData,
});
```

Then store the returned `path` value or convert it to a full URL if needed.

Example:

```ts
const data = await res.json();
const fileUrl = data.path ? `${window.location.origin}${data.path}` : data.url;
```

## Troubleshooting

### 404 on `/api/upload`

- Next.js is not running
- the upload route file is missing
- the server-side proxy cannot reach the PHP uploader

### 404 on `/uploader_php_app/upload.php`

- nginx is not routing `/uploader_php_app/` to PHP-FPM
- the PHP file is not in the expected path
- the app is being served by Next.js alone without PHP enabled

### Upload fails with permission errors

- `uploads/` is not writable by the PHP process
- file ownership or permissions are wrong

### File uploads work locally but not in production

- `client_max_body_size` is too small in nginx
- PHP `upload_max_filesize` or `post_max_size` are too small
- the production server does not have the same path layout

## Optional PHP ini Settings

You may need to adjust PHP settings:

```ini
upload_max_filesize = 25M
post_max_size = 30M
max_execution_time = 60
memory_limit = 256M
```

## Summary

- Use `/api/upload` as the browser-facing upload endpoint.
- Store private access control in the shared root `.env`.
- Keep the uploads directory outside the main repository.
- Send multipart form data with `type` and `file`.
- Configure nginx/PHP-FPM so PHP executes correctly.
- Make sure the external `uploads/` directory is writable and served safely.
