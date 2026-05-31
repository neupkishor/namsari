# Uploader Guide

This project uses a PHP upload service for profile pictures, property images, ad images, and agency images.

The layout is:

- main app: `main_app/*`
- PHP uploader app: `main_app/uploader/*`
- uploads storage: `main_app/../uploads`

The browser sends uploads to the Next.js proxy at `/api/upload`. The Next.js server forwards the request to the PHP uploader and attaches the secret key server-side.

## Environment

Use one shared `.env` at the repo root:

```ini
PRIVATE_KEY=change-this-to-a-long-random-secret
UPLOADS_ROOT=../uploads
NEXT_PUBLIC_UPLOADER_URL=/api/upload
```

- `PRIVATE_KEY` protects upload, rename, move, and delete actions
- `UPLOADS_ROOT` points to the sibling uploads folder
- `NEXT_PUBLIC_UPLOADER_URL` is the browser-facing upload route

## Paths

- Browser upload endpoint: `/api/upload`
- PHP upload endpoint: `/uploader/upload.php`
- PHP file manager: `/uploader/file-manager.php`

## Upload Flow

1. The browser posts multipart form data to `/api/upload?type=users&file=file`
2. The Next.js route forwards the form data to `/uploader/upload.php`
3. The Next.js route adds `X-Namsari-Upload-Key` from the shared `.env`
4. The PHP uploader verifies the key and saves the file into `../uploads/{type}`

## Upload Storage

Files are stored under the external uploads root like this:

```text
../uploads/{type}/{originalName}.{randomId}.{extension}
```

Examples:

```text
../uploads/users/avatar.202605311234abcd.jpg
../uploads/properties/house.202605311235efgh.png
../uploads/ads/banner.202605311236ijkl.webp
```

The `type` value becomes the subfolder name.

## File Manager

The protected file manager supports:

- `action=rename`
- `action=move`
- `action=delete`

It requires:

- `key` - must match `PRIVATE_KEY` from the shared root `.env`
- `file` - the relative path inside `../uploads`

Examples:

```http
POST https://namsari.com/uploader/file-manager.php?action=rename&file=users/old.jpg&new_name=new.jpg&key=YOUR_PRIVATE_KEY
POST https://namsari.com/uploader/file-manager.php?action=move&file=users/old.jpg&destination=properties&key=YOUR_PRIVATE_KEY
POST https://namsari.com/uploader/file-manager.php?action=delete&file=users/old.jpg&key=YOUR_PRIVATE_KEY
```

## Local Development

1. Create the uploads folder beside the repository root:

```text
/Users/neupkishor/Code/clients/uploads
```

2. Start Next.js:

```bash
cd /Users/neupkishor/Code/clients/namsari
npm run dev
```

3. Start PHP from the project root:

```bash
cd /Users/neupkishor/Code/clients/namsari
php -S localhost:8001 -t .
```

4. Test the browser-facing upload route:

```bash
curl -v \
  -F "file=@/path/to/image.jpg" \
  "http://localhost:3000/api/upload?type=users&file=file"
```

## nginx Configuration

Use nginx to proxy Next.js and route PHP requests to PHP-FPM.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /Users/neupkishor/Code/clients/namsari;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location ^~ /uploader/ {
        try_files $uri $uri/ /uploader/upload.php?$query_string;
    }

    location ~ ^/uploader/.*\.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index upload.php;
    }

    location ^~ /uploads/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## PHP Settings

You may need to adjust:

```ini
upload_max_filesize = 25M
post_max_size = 30M
max_execution_time = 60
memory_limit = 256M
```

## Summary

- Keep the PHP app in `uploader/`
- Keep the uploads directory in `../uploads`
- Use the shared root `.env`
- Send uploads through `/api/upload`
- Protect uploader actions with `PRIVATE_KEY`
