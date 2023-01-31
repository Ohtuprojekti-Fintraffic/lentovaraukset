set -euxo pipefail

echo "Pulling changes from git..."
git pull

echo "Building and starting Docker container"
docker-compose -f docker-compose.yml up --build -d

echo "Done!"
