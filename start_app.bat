@echo off
echo Starting Greenverse AI Marketing Backend Server...
start cmd /k "cd server && node server.js"

echo Starting Greenverse AI Marketing Frontend...
start cmd /k "npm run dev"

echo Both Frontend and Backend have been started in separate windows!
