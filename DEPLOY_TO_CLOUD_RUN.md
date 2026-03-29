# Deploying NestJS Backend to Google Cloud Run & Connecting to Vercel Frontend

## 1. Enable Cloud Run API

```sh
gcloud services enable run.googleapis.com
```

---

## 2. Update Your Backend to Use Cloud Run Port

Edit `backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
```

---

## 3. Deploy to Cloud Run

From your backend directory (where your Dockerfile is):

```sh
gcloud run deploy my-spotify-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
- Confirm the region and allow unauthenticated access when prompted.

---

## 4. (Optional) Set Environment Variables

If you need secrets (like Spotify credentials):

```sh
gcloud run services update my-spotify-backend \
  --update-env-vars SPOTIFY_CLIENT_ID=xxx,SPOTIFY_CLIENT_SECRET=yyy
```

---

## 5. Connect Your Frontend (Vercel)

- After deployment, you’ll get a public URL (e.g., `https://my-spotify-backend-xxxx.a.run.app`).
- In your Vercel dashboard, set the environment variable:
  - `NEXT_PUBLIC_API_URL=https://my-spotify-backend-xxxx.a.run.app`
- Redeploy your frontend if needed.

---

## 6. Test Everything

- Your Vercel frontend should now call your Google Cloud Run backend.
- Test your app end-to-end!

---

## 7. Fix Cloud Run IAM Permissions Error

If you see a deployment error like:

```
PERMISSION_DENIED: Build failed because the default service account is missing required IAM permissions.
```

**Grant the required IAM roles:**

```sh
gcloud projects add-iam-policy-binding my-spotify-wrapped-6299 \
  --member="serviceAccount:1003343772874-compute@developer.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding my-spotify-wrapped-6299 \
  --member="serviceAccount:1003343772874-compute@developer.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding my-spotify-wrapped-6299 \
  --member="serviceAccount:1003343772874-compute@developer.gserviceaccount.com" \
  --role="roles/storage.admin"
```

---

## 8. Retry the Deployment

After running the above commands, try your deployment again:

```sh
gcloud run deploy my-spotify-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

**Need help?**
- Let me know if you want a ready-to-use Dockerfile, main.ts, or have any errors!
