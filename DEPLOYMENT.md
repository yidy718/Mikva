# Deploying to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com with your GitHub)

## Step 1: Push to GitHub

1. Initialize git and commit your code:
```bash
git init
git add .
git commit -m "Initial commit: Mikvah Locator app"
```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `mikvah-locator`
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/mikvah-locator.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository (`mikvah-locator`)
3. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Add Environment Variables** (IMPORTANT):
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qsmcdszairalyekxsktv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbWNkc3phaXJhbHlla3hza3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTQwOTYsImV4cCI6MjA3NTUzMDA5Nn0.xJPKB7kmCdt-N69lu4a8jayJAivzfbl3nPyFrjnoWg0
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbWNkc3phaXJhbHlla3hza3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk1NDA5NiwiZXhwIjoyMDc1NTMwMDk2fQ._HOi6vImqMzlR8H757b4r1Igh-ynpQmbzgtLLJbZrp4
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieWlkeSIsImEiOiJjbWdpdGRtYXgwM21rMmlva2RwOXRnbDRzIn0.mOgVBDT82y9DdalyMs1-qw
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   Note: Update `NEXT_PUBLIC_APP_URL` after deployment with your actual Vercel URL

5. Click **Deploy**

## Step 3: Post-Deployment Setup

1. After deployment, Vercel will give you a URL like: `https://mikvah-locator-xxx.vercel.app`

2. Update the `NEXT_PUBLIC_APP_URL` environment variable:
   - Go to your Vercel project settings
   - Click "Environment Variables"
   - Update `NEXT_PUBLIC_APP_URL` with your actual URL
   - Redeploy

3. Update Supabase Auth Settings:
   - Go to https://supabase.com/dashboard/project/qsmcdszairalyekxsktv/auth/url-configuration
   - Add your Vercel URL to **Redirect URLs**:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**`
   - Add to **Site URL**: `https://your-app.vercel.app`

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Try logging in
3. Submit a test mikvah
4. Check admin dashboard

## Troubleshooting

### Build Errors
- Check the Vercel build logs
- Make sure all environment variables are set
- Ensure `package.json` has all dependencies

### Authentication Issues
- Verify Supabase redirect URLs are correct
- Check that environment variables are set in Vercel
- Make sure `NEXT_PUBLIC_APP_URL` matches your actual Vercel URL

### Map Not Loading
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- Check browser console for errors

## Automatic Deployments

Vercel automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```

Your site will automatically update in 1-2 minutes!
