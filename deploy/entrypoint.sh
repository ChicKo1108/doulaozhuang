#!/bin/sh
set -eu

echo "Applying database migrations..."
node node_modules/prisma/build/index.js migrate deploy --schema apps/api/prisma/schema.prisma

echo "Starting doulaozhuang API..."
exec node apps/api/dist/main.js
