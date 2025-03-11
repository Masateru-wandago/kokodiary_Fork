# Deployment Guide for KokoDiary

This guide explains how to deploy KokoDiary using Docker and GitHub Actions.

## GitHub Actions Workflow

KokoDiary uses GitHub Actions to automatically build and push Docker images to GitHub Container Registry (ghcr.io) when changes are pushed to the main branch.

### Workflow Details

The workflow is defined in `.github/workflows/docker-build-push.yml` and does the following:

1. Builds and pushes three Docker images:
   - Frontend image: `ghcr.io/[owner]/[repo]-frontend`
   - Backend image: `ghcr.io/[owner]/[repo]-backend`
   - Combined image: `ghcr.io/[owner]/[repo]`

2. Tags the images with:
   - Semantic version tags (if a release is created)
   - Short SHA of the commit
   - Branch name
   - PR number (for pull requests)
   - `latest` tag for the most recent build on the main branch

### Prerequisites

To use the GitHub Actions workflow, you need:

1. A GitHub repository with the KokoDiary code
2. Permissions to create and push packages to the GitHub Container Registry

### Setting Up GitHub Actions

The workflow uses the `GITHUB_TOKEN` secret which is automatically provided by GitHub Actions. No additional secrets need to be configured.

## Manual Deployment

You can also build and deploy the Docker images manually:

### Building the Docker Images

```bash
# Build the frontend image
docker build -t ghcr.io/[owner]/[repo]-frontend -f frontend/Dockerfile .

# Build the backend image
docker build -t ghcr.io/[owner]/[repo]-backend -f backend/Dockerfile .

# Build the combined image
docker build -t ghcr.io/[owner]/[repo] .
```

### Pushing the Docker Images

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u [username] --password-stdin

# Push the images
docker push ghcr.io/[owner]/[repo]-frontend
docker push ghcr.io/[owner]/[repo]-backend
docker push ghcr.io/[owner]/[repo]
```

## Deployment with Docker Compose

You can deploy the application using Docker Compose:

```bash
# Pull the images
docker-compose pull

# Start the services
docker-compose up -d
```

## Environment Variables

The following environment variables need to be set for the application to work properly:

### Frontend
- `NEXT_PUBLIC_API_URL`: URL of the backend API

### Backend
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment (production, development)

## Accessing the Application

After deployment, the application can be accessed at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB Express (database admin): http://localhost:8081
