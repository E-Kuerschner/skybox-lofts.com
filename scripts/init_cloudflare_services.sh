#!/bin/bash

# Script to set up Cloudflare R2 bucket and D1 database
# This script creates:
# - R2 bucket named "documents"
# - D1 database named "app"

set -e  # Exit on any error

echo "Setting up Cloudflare services..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI is not installed or not in PATH"
    echo "Please install wrangler first: npm install -g wrangler"
    exit 1
fi

# Check if wrangler is authenticated
# Try to run a simple wrangler command that requires authentication
if ! wrangler whoami &> /dev/null; then
    echo "Error: wrangler is not authenticated with Cloudflare"
    echo "Please authenticate first by running: wrangler login"
    exit 1
fi

echo " wrangler is installed and authenticated"

# Create R2 bucket "documents"
echo "Creating R2 bucket 'documents'..."
if wrangler r2 bucket create documents; then
    echo " R2 bucket 'documents' created successfully"
else
    echo "  R2 bucket 'documents' may already exist or creation failed"
fi

# Create D1 database "app"
echo "Creating D1 database 'app'..."
if wrangler d1 create app; then
    echo " D1 database 'app' created successfully"
else
    echo "  D1 database 'app' may already exist or creation failed"
fi

echo "Cloudflare services setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your wrangler.toml file with the database ID from the output above"
echo "2. Configure your application to use the new R2 bucket and D1 database"