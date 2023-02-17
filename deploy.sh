#!/usr/bin/env bash
set -euo pipefail

git fetch --quiet -- origin main

if [ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ]; then
    exit
fi

echo "Found new commits. Merging"
git merge --ff-only

echo "Rebuilding and restarting containers"
docker-compose -f docker-compose.yml build --build-arg COMMIT_HASH=$(git rev-parse --short HEAD)
docker-compose -f docker-compose.yml up -d

echo "Done!"
