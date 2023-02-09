#!/usr/bin/env bash
set -euo pipefail

git fetch origin main


if [ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ]; then
    exit
fi

echo "Found new commits. Merging"
git merge --ff-only

echo "Rebuilding and restarting containers"
docker-compose -f docker-compose.yml up --build -d

echo "Done!"
