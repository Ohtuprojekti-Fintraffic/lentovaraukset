#!/usr/bin/env bash
set -euo pipefail

git fetch --quiet -- origin main

if [ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ]; then
    exit
fi

echo "Found new commits. Merging"
git merge --ff-only

echo "Stopping existing containers and removing images and volumes"
docker-compose -f docker-compose.yml down
docker image rm lentovaraukset_backend lentovaraukset_frontend
docker volume rm lentovaraukset_data

echo "Rebuilding and restarting containers"
docker-compose -f docker-compose.yml build --build-arg COMMIT_HASH=$(git rev-parse --short HEAD)
docker-compose -f docker-compose.yml up -d

echo "Done!"
