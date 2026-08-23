1. Downloda the latest version of the filebrowser.xs
https://github.com/gtsteffaniak/filebrowser/releases


2. Do this to make it executable.
chmod +x filebrowser-linux-amd64


3. Create directory and Move it to an appropriate location.
mkdir -p /home/ubuntu/uploader && sudo mv filebrowser-linux-amd64 /home/ubuntu/uploader/filebrowser-linux-amd64


4. Verify with the filebrowser version.
/home/ubuntu/uploader/filebrowser-linux-amd64 version


5. Create the configuration for the filebrowser.
sudo mkdir -p /etc/filebrowser
cd /etc/filebrowser


6. Run the setup for the filebrowser setup.
sudo /home/ubuntu/uploader/filebrowser-linux-amd64 setup

