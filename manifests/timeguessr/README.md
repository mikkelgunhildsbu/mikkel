# TimeGuessr Deployment Guide

This guide covers deploying the TimeGuessr application to OpenShift/Kubernetes using ArgoCD for GitOps.

## Architecture

The application consists of:
- **Frontend**: Nginx serving static HTML/JavaScript
- **API**: Node.js Express server
- **Scraper**: Python CronJob (runs daily at 17:00)
- **Database**: PostgreSQL (already deployed via Helm)

## Prerequisites

1. OpenShift/Kubernetes cluster
2. ArgoCD installed
3. PostgreSQL deployed (from `manifests/timeguessr/postgres/`)
4. Container registry access
5. Git repository

## Deployment Steps

### 1. Build and Push Docker Images

```bash
# Build API image
cd api/timeguessr
docker build -t YOUR_REGISTRY/timeguessr-api:latest .
docker push YOUR_REGISTRY/timeguessr-api:latest

# Build Frontend image
cd ../../frontend/timeguessr
docker build -t YOUR_REGISTRY/timeguessr-frontend:latest .
docker push YOUR_REGISTRY/timeguessr-frontend:latest

# Build Scraper image
cd ../../scripts/timeguessr
docker build -t YOUR_REGISTRY/timeguessr-scraper:latest .
docker push YOUR_REGISTRY/timeguessr-scraper:latest
```

### 2. Configure Secrets

**IMPORTANT**: Update `secret.yaml` with your actual credentials:

```bash
# Get the database password from your postgres deployment
oc get secret postgres-postgresql -o jsonpath='{.data.password}' | base64 -d

# Update secret.yaml with:
# - db-password: Your PostgreSQL password
# - timeguessr-cookie: Your TimeGuessr session cookie
```

### 3. Update Image References

Update the following files with your container registry:
- `api-deployment.yaml` - line 21
- `frontend-deployment.yaml` - line 20
- `cronjob.yaml` - line 22

### 4. Update ArgoCD Application

Edit `argocd-application.yaml`:
- Set `repoURL` to your Git repository URL

### 5. Verify Database Connection

Ensure the PostgreSQL service is accessible:
```bash
oc get svc postgres-postgresql
```

The API deployment expects:
- Service name: `postgres-postgresql`
- Port: `5432`
- Database: `mydb`
- User: `testuser`
- Password: from secret `postgres-postgresql` key `password`

### 6. Deploy with ArgoCD

```bash
# Apply the ArgoCD application
oc apply -f argocd-application.yaml

# Check ArgoCD sync status
argocd app get timeguessr
```

Or manually apply all manifests:
```bash
cd manifests/timeguessr

# Apply in order
oc apply -f secret.yaml
oc apply -f api-deployment.yaml
oc apply -f frontend-deployment.yaml
oc apply -f cronjob.yaml
oc apply -f services.yaml
oc apply -f routes.yaml
```

## Configuration Details

### Database Connection (API)
The API connects to PostgreSQL using these environment variables:
- `DB_HOST`: postgres-postgresql
- `DB_PORT`: 5432
- `DB_NAME`: mydb
- `DB_USER`: testuser
- `DB_PASSWORD`: from secret

### API URL (Scraper)
The CronJob scraper uses:
- `API_URL`: http://timeguessr-api:8080/api/submit-score

### Frontend
The frontend dynamically uses the current hostname to connect to the API on port 8080.

### CronJob Schedule
The leaderboard scraper runs:
- **Schedule**: Daily at 17:00 (5 PM)
- **Timezone**: Europe/Oslo (configure in `cronjob.yaml` line 12)

## Secrets Required

| Secret Name | Key | Used By | Description |
|-------------|-----|---------|-------------|
| `postgres-postgresql` | `password` | API | PostgreSQL user password |
| `timeguessr-secrets` | `timeguessr-cookie` | Scraper | Session cookie for TimeGuessr API |

## Accessing the Application

After deployment, get the routes:
```bash
oc get routes
```

You'll see:
- `timeguessr-frontend` - Main web interface
- `timeguessr-api` - API endpoint

## Monitoring

### Check API Health
```bash
curl https://$(oc get route timeguessr-api -o jsonpath='{.spec.host}')/api/health
```

### View Scraper Logs
```bash
# List CronJob runs
oc get jobs -l app=timeguessr-scraper

# View logs from latest job
oc logs -l app=timeguessr-scraper --tail=100
```

### Check Database Connection
```bash
# Get API pod logs
oc logs -l app=timeguessr-api --tail=50
```

## Troubleshooting

### API can't connect to database
1. Verify PostgreSQL is running: `oc get pods -l app.kubernetes.io/name=postgresql`
2. Check secret exists: `oc get secret postgres-postgresql`
3. Verify database name matches: `mydb` (not `testdb`)
4. Check API logs for connection errors

### Scraper fails
1. Verify cookie is set correctly in `timeguessr-secrets`
2. Check API is accessible from scraper: `oc exec -it <scraper-pod> -- curl http://timeguessr-api:8080/api/health`
3. View scraper logs for errors

### Frontend can't reach API
1. Check that both frontend and API routes are created
2. Verify API service is running: `oc get svc timeguessr-api`
3. Check browser console for CORS errors

## Security Notes

✅ **Properly secured**:
- Database passwords stored in Kubernetes secrets
- API requires environment variables (no hardcoded credentials)
- Scraper cookie externalized to secrets
- All Routes use TLS/HTTPS

⚠️ **Additional recommendations**:
- Use NetworkPolicies to restrict pod-to-pod communication
- Consider using a secret management solution (Vault, Sealed Secrets)
- Implement authentication for API endpoints
- Add rate limiting to prevent abuse

## GitOps Workflow

With ArgoCD configured:
1. Make changes to manifests in Git
2. Commit and push to your repository
3. ArgoCD automatically syncs changes
4. Monitor sync status: `argocd app get timeguessr`

## Updating Images

When you build new images:
1. Tag with version/commit SHA instead of `latest`
2. Update deployment manifests with new image tags
3. Commit to Git
4. ArgoCD will automatically deploy

Example:
```bash
docker build -t YOUR_REGISTRY/timeguessr-api:v1.2.3 .
docker push YOUR_REGISTRY/timeguessr-api:v1.2.3
```

Then update `api-deployment.yaml`:
```yaml
image: YOUR_REGISTRY/timeguessr-api:v1.2.3
```
