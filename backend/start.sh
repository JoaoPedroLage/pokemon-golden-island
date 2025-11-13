#!/bin/sh

echo "Starting application..."

# Wait a bit for database to be ready
sleep 2

# Apply migrations
echo "Applying database migrations..."
npx prisma migrate deploy

# Check if migrations were successful
if [ $? -eq 0 ]; then
  echo "Migrations applied successfully"
else
  echo "Migration failed, but continuing..."
fi

# Start the application
echo "Starting NestJS application..."
npm run start:prod

