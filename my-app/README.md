# Counter App - OpenShift Deployment

A simple counter application with a Node.js API backend and HTML/JavaScript frontend, designed to run on OpenShift.

## Architecture

- **Frontend**: Nginx serving static HTML/CSS/JavaScript
- **API**: Node.js/Express REST API
- Both containers run as non-root users (OpenShift compatible)

## Local Development

### API
```bash
cd api
npm install
npm start
```
API runs on http://localhost:8080

### Frontend
Simply open `frontend/index.html` in a browser, or serve it with any web server.

## Building Container Images

### Build API Image
```bash
cd api
podman build -t counter-api:latest .
# OR
docker build -t counter-api:latest .
```

### Build Frontend Image
```bash
cd frontend
podman build -t counter-frontend:latest .
# OR
docker build -t counter-frontend:latest .
```

## Deploy to OpenShift

### Option 1: Using Local Images (for testing)

1. **Build and push images to OpenShift internal registry:**
```bash
# Login to OpenShift
oc login

# Create the namespace
oc create namespace counter-app

# Get the internal registry URL
REGISTRY=$(oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}')

# Login to the registry
podman login -u $(oc whoami) -p $(oc whoami -t) $REGISTRY

# Tag and push API image
podman tag counter-api:latest $REGISTRY/counter-app/counter-api:latest
podman push $REGISTRY/counter-app/counter-api:latest

# Tag and push Frontend image
podman tag counter-frontend:latest $REGISTRY/counter-app/counter-frontend:latest
podman push $REGISTRY/counter-app/counter-frontend:latest

# Update deployment.yaml to use the full image paths, then apply
oc apply -f deployment.yaml
```

### Option 2: Using OpenShift BuildConfig (Recommended)

```bash
# Login to OpenShift
oc login

# Create the namespace
oc new-project counter-app

# Create build for API
oc new-build --name=counter-api --binary --strategy=docker
oc start-build counter-api --from-dir=./api --follow

# Create build for Frontend
oc new-build --name=counter-frontend --binary --strategy=docker
oc start-build counter-frontend --from-dir=./frontend --follow

# Deploy the application
oc apply -f deployment.yaml
```

### Option 3: Quick Deploy with Source-to-Image

```bash
oc new-project counter-app

# Deploy API
oc new-app nodejs~https://github.com/<your-repo>.git --context-dir=my-app/api --name=counter-api

# Deploy Frontend
oc new-app nginx~https://github.com/<your-repo>.git --context-dir=my-app/frontend --name=counter-frontend

# Create route
oc expose svc/counter-frontend
```

## Verify Deployment

```bash
# Check if pods are running
oc get pods -n counter-app

# Check services
oc get svc -n counter-app

# Get the route URL
oc get route counter-app -n counter-app

# Follow logs
oc logs -f deployment/counter-api -n counter-app
oc logs -f deployment/counter-frontend -n counter-app
```

## Access the Application

After deployment, get your application URL:
```bash
oc get route counter-app -n counter-app -o jsonpath='{.spec.host}'
```

Visit the URL in your browser to use the counter app!

## API Endpoints

- `GET /api/counter` - Get current counter value
- `POST /api/counter/increment` - Increment counter
- `POST /api/counter/decrement` - Decrement counter
- `POST /api/counter/reset` - Reset counter to 0
- `GET /health` - Health check endpoint

## Troubleshooting

### Pods not starting
```bash
oc describe pod <pod-name> -n counter-app
oc logs <pod-name> -n counter-app
```

### Permission errors
Make sure images run as non-root (already configured in Dockerfiles)

### Can't access the app
```bash
# Check route
oc get route -n counter-app

# Check if services are properly configured
oc get svc -n counter-app
oc get endpoints -n counter-app
```

## Clean Up

```bash
oc delete project counter-app
```
