#!/bin/sh
set -e

echo "Running migrations..."
pnpm db:migrate

echo "Running seeders..."
pnpm db:seed

echo "Starting dev server..."
exec pnpm run dev:watch
