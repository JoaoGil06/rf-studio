#!/bin/sh
set -e

echo "Running migrations..."
pnpm db:migrate

echo "Seeding base data..."
node dist/seed.js

echo "Starting production server..."
exec node dist/main.js