# Uploader Guide

This project uses a small PHP upload service for all file uploads such as:

- profile pictures
- property images
- ad images
- agency images
- any other future media uploads

The uploader is designed to save files locally under a typed folder structure and return a web path that the main application can store in the database.

Production endpoint:

```text
https://namsari.com/uploader/upload.php
```

## Requirements

- PHP 8.0+ recommended
- A web server that can execute PHP, such as:
  - nginx + PHP-FPM
  - Apache + mod_php or PHP-FPM
  - PHP built-in server for local development
- Writable `uploads/` directory at the project root
- The main app must POST multipart form data to the uploader

## Folder Structure

The uploader saves files under:

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

The main application should send:

- `type` - folder name such as `users`, `properties`, `ads`, `agencies`
- `file` - the multipart file field name by default

Example request:

```http
POST https://namsari.com/uploader/upload.php?type=users&file=file
Content-Type: multipart/form-data
```

The file field must match the `file` query value. If `file` is omitted, the PHP service defaults to `file`.

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

## How the ID Works

The uploaded filename includes a 16 character ID that combines:

- timestamp information
- random bytes

This helps avoid collisions and makes the name easier to trace later.

## Local Development Setup

### 1. Ensure the folders exist

The repository should contain:

- `uploader/upload.php`
- `uploads/`

If `uploads/` is missing, create it and make sure PHP can write to it.

### 2. Start a PHP server

For quick local testing, you can use PHP's built-in server from the project root:

```bash
cd /Users/neupkishor/Code/clients/namsari
php -S localhost:8001 -t .
```

This makes the uploader available at:

```text
http://localhost:8001/uploader/upload.php
```

### 3. Test with curl

```bash
curl -v \
  -F "file=@/path/to/image.jpg" \
  "http://localhost:8001/uploader/upload.php?type=users&file=file"
```

If the upload works, the response should include a `path` value under `/uploads/...`.

## nginx Configuration

If you want nginx to serve the Next.js app and also execute PHP uploads, use a split setup:

- Next.js runs on one port, for example `3000`
- PHP-FPM handles `upload.php`
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
    location ^~ /uploader/ {
        try_files $uri $uri/ /uploader/upload.php?$query_string;
    }

    location ~ ^/uploader/.*\.php$ {
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

Your PHP-FPM pool must allow the web server user to write to the `uploads/` directory.

Useful checks:

```bash
sudo chown -R www-data:www-data /Users/neupkishor/Code/clients/namsari/uploads
sudo chmod -R 755 /Users/neupkishor/Code/clients/namsari/uploads
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

The frontend should POST to the uploader like this:

```ts
const res = await fetch('https://namsari.com/uploader/upload.php?type=properties&file=file', {
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

### 404 on `/uploader/upload.php`

- nginx is not routing `/uploader/` to PHP-FPM
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

- Use `uploader/upload.php` as the upload endpoint.
- Send multipart form data with `type` and `file`.
- Save uploads under `/uploads/{type}/...`.
- Configure nginx/PHP-FPM so PHP executes correctly.
- Make sure `uploads/` is writable and served safely.
