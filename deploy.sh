#!/usr/bin/env bash
set -euo pipefail

echo "Fetching remote"
git fetch origin main


if [ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ]; then
    echo "Already up to date. Exiting"
    exit
fi

echo "Merging new commits"
git merge --ff-only

echo "Rebuilding and restarting containers"
docker-compose -f docker-compose.yml up --build -d

echo "Done!"
