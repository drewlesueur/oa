#upstream app_cluster_1 {
#        server 127.0.0.1:8001;
#}


server {
        #listen 0.0.0.0:80;
        listen 0.0.0.0:80;
        server_name office.the.tl;
        #access_log /var/log/nginx/nodetest.log;

        location / {
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header Host $http_host;
          proxy_set_header X-NginX-Proxy true;
          
          proxy_pass http://127.0.0.1:8001;

          #proxy_pass http://app_cluster_1/;
          proxy_redirect off;
        }
}

