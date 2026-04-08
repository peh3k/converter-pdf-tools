#!/bin/bash
# Script to set up Turso database for production
# Prerequisites: Install Turso CLI - https://docs.turso.tech/cli/installation

set -e

echo "=== Turso Database Setup ==="
echo ""

# Check if turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "Turso CLI not found. Install it with:"
    echo "  curl -sSfL https://get.tur.so/install.sh | bash"
    exit 1
fi

# Create database
DB_NAME="${1:-pdf-converter}"
echo "Creating database: $DB_NAME"
turso db create "$DB_NAME"

# Get the URL
DB_URL=$(turso db show "$DB_NAME" --url)
echo "Database URL: $DB_URL"

# Create auth token
AUTH_TOKEN=$(turso db tokens create "$DB_NAME")
echo "Auth Token: $AUTH_TOKEN"

# Apply schema
echo ""
echo "Applying schema..."
turso db shell "$DB_NAME" < prisma/migrations/20260408154636_init/migration.sql

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Add these to your Vercel Environment Variables:"
echo ""
echo "TURSO_DATABASE_URL=$DB_URL"
echo "TURSO_AUTH_TOKEN=$AUTH_TOKEN"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app"
