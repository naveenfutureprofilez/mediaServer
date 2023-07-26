server {
  listen 80;
  server_name localhost;

  location / {
    root /path/to/video;
    index index.html;
  }

  location /rtmp {
    rtmp_server {
      listen 1935;
      application live {
        live on;
        mime_type video/mp4;
      }
    }
  }
}