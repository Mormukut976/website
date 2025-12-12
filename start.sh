#!/bin/sh
set -e

# Railway/Railpack entrypoint for monorepo
# Run the Node backend that lives in ./backend

cd backend

# Install dependencies (no-op on subsequent runs if node_modules already exists)
if [ ! -d "node_modules" ]; then
  npm install
fi

npm start
