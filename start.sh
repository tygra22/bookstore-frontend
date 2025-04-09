#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Bookstore Frontend Setup..."

# Use nvm to set the correct Node.js version
echo "🔄 Setting up Node.js environment..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Check if .nvmrc exists and use it
if [ -f .nvmrc ]; then
    echo "🔄 Using Node.js version specified in .nvmrc..."
    nvm use
else
    echo "⚠️ No .nvmrc file found. Using default Node.js version."
    # You can specify a default version here if needed
    # nvm use 16
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "🔄 Installing dependencies..."
    npm install
fi

# Start the frontend development server
echo "🚀 Starting frontend development server..."
npm start

echo "✅ Setup complete!"
