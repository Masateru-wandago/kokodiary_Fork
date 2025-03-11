#!/bin/sh
set -e

# Start the backend service in the background
echo "Starting backend service..."
node backend/dist/index.js &

# Start the frontend service
echo "Starting frontend service..."
exec node frontend/server.js
