#!/bin/sh
set -e

echo "Running migrations..."
pnpm db:migrate

echo "Starting production server..."
exec node dist/main.js