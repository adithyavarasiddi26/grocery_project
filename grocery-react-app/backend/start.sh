#!/bin/sh
echo "Running database setup..."
node setup-db.js
echo "Starting server..."
node index.js
