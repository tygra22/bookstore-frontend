#!/bin/sh

# Replace environment variables in JavaScript files
echo "Replacing environment variables..."
api_url="${API_URL:-localhost:8080}"

echo "API URL being used: https://${api_url}/api"

# Replace the API_URL_PLACEHOLDER with the actual value in the runtime config
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|\${API_URL_PLACEHOLDER}|https://${api_url}/api|g" {} \;

echo "Starting Nginx..."
exec "$@"
