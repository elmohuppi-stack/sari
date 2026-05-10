FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY data /usr/share/nginx/html/data
COPY nginx.conf /etc/nginx/conf.d/default.conf
