#!/bin/bash

set -e

REPO="gtsteffaniak/filebrowser"
INSTALL_PATH="/home/ubuntu/uploads/filebrowser"

echo "Installing FileBrowser Quantum..."

ARCH=$(uname -m)

case "$ARCH" in
    x86_64)
        ASSET_ARCH="amd64"
        ;;
    aarch64|arm64)
        ASSET_ARCH="arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

echo "Architecture: $ASSET_ARCH"

sudo apt-get update
sudo apt-get install -y curl jq tar

LATEST_RELEASE=$(curl -fsSL \
    "https://api.github.com/repos/$REPO/releases" \
    | jq -r '
        map(select(.prerelease == false))
        | map(select(.tag_name | contains("stable")))
        | first
        | .tag_name
    ')

if [ -z "$LATEST_RELEASE" ] || [ "$LATEST_RELEASE" = "null" ]; then
    echo "Could not determine latest stable release."
    exit 1
fi

echo "Latest stable release: $LATEST_RELEASE"

DOWNLOAD_URL=$(curl -fsSL \
    "https://api.github.com/repos/$REPO/releases/tags/$LATEST_RELEASE" \
    | jq -r --arg ARCH "$ASSET_ARCH" '
        .assets[]
        | select(.name | test("linux-" + $ARCH))
        | .browser_download_url
    ' \
    | head -n 1)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "Could not find Linux $ASSET_ARCH release binary."
    exit 1
fi

echo "Downloading:"
echo "$DOWNLOAD_URL"

TMP_DIR=$(mktemp -d)

curl -fL "$DOWNLOAD_URL" -o "$TMP_DIR/download"

FILE_TYPE=$(file -b "$TMP_DIR/download")

if echo "$FILE_TYPE" | grep -qi "gzip"; then

    mv "$TMP_DIR/download" "$TMP_DIR/filebrowser.tar.gz"

    tar -xzf "$TMP_DIR/filebrowser.tar.gz" -C "$TMP_DIR"

    BINARY=$(find "$TMP_DIR" \
        -type f \
        -name "*filebrowser*" \
        ! -name "*.tar.gz" \
        | head -n 1)

else

    BINARY="$TMP_DIR/download"

fi

if [ ! -f "$BINARY" ]; then
    echo "FileBrowser binary could not be found."
    rm -rf "$TMP_DIR"
    exit 1
fi

chmod +x "$INSTALL_PATH"

sudo mv "$BINARY" "$INSTALL_PATH"
sudo chmod +x "$INSTALL_PATH"

rm -rf "$TMP_DIR"

echo ""
echo "FileBrowser installed:"
cd "$INSTALL_PATH" && ./filebrowser version

echo ""
echo "Installation complete."
echo "Run configuration using:"
echo ""
echo "npm run setup"