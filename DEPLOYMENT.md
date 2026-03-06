# 🚀 Deployment Guide - Vercel

## Prerequisites

- ✅ Supabase database setup complete
- ✅ All environment variables configured
- ✅ Application tested locally

---

## Step 1: Prepare for Deployment

### 1.1 Create GitHub Repository (if not done)

```bash
cd /app
git init
git add .
git commit -m "Initial commit - Smart City AQI Monitoring System"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Log In to Vercel

1. Go to: https://vercel.com
2. Sign up or log in with GitHub

### 2.2 Import Project

1. Click **"Add New"** → **"Project"**
2. Select your GitHub repository
3. Click **"Import"**

### 2.3 Configure Project

**Framework Preset:** Next.js (Auto-detected)  
**Root Directory:** `./` (keep default)  
**Build Command:** `next build` (default)  
**Output Directory:** `.next` (default)

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mxxxbeuremwtebvenjem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHhiZXVyZW13dGVidmVuamVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Nzk1MTIsImV4cCI6MjA4ODM1NTUxMn0.HUmLFOPpnUWe1_STcrRClx3fathqc9lGjssvRfFo71E
GEMINI_API_KEY=AIzaSyD-UAWIfWk5MKroLRlY8be1QP6NL-qtCk4
```

**Important:** Make sure to select **Production**, **Preview**, and **Development** for all variables.

### 2.5 Deploy

Click **"Deploy"**

⏳ Wait for deployment (usually 2-3 minutes)

---

## Step 3: Post-Deployment Setup

### 3.1 Test Your Deployed App

Once deployed, Vercel will provide a URL like:
```
https://your-app-name.vercel.app
```

Test these pages:
- ✅ Home: `https://your-app-name.vercel.app`
- ✅ Citizen: `https://your-app-name.vercel.app/citizen`
- ✅ Admin: `https://your-app-name.vercel.app/admin`

### 3.2 Update ESP32 Configuration

In your ESP32 code, update the API endpoint:

```cpp
const char* serverUrl = "https://your-app-name.vercel.app/api/sensor";
```

### 3.3 Configure Supabase CORS (if needed)

If you face CORS issues, add your Vercel domain in Supabase:

1. Go to: Supabase Dashboard → Settings → API
2. Add your Vercel URL to allowed origins

---

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain in Vercel

1. Go to your project in Vercel
2. Navigate to **Settings** → **Domains**
3. Add your custom domain (e.g., `aqi.smartcity.com`)
4. Follow DNS configuration instructions

### 4.2 Update DNS Records

Add these records to your domain provider:

**For Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For Subdomain:**
```
Type: CNAME
Name: aqi (or your subdomain)
Value: cname.vercel-dns.com
```

---

## Step 5: Production Checklist

### Security

- [ ] Enable RLS policies in Supabase
- [ ] Set up API rate limiting (if needed)
- [ ] Add authentication for admin panel (future enhancement)
- [ ] Review and rotate API keys regularly

### Performance

- [ ] Enable Vercel Analytics (optional)
- [ ] Monitor Supabase usage and quotas
- [ ] Set up database backups in Supabase
- [ ] Enable caching for static assets

### Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure Vercel deployment notifications
- [ ] Monitor Gemini API usage and quotas
- [ ] Set up uptime monitoring

---

## Step 6: Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:

- **Production:** When you push to `main` branch
- **Preview:** When you create pull requests

To update your app:
```bash
git add .
git commit -m "Update: description"
git push origin main
```

Vercel will automatically build and deploy! 🎉

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

---

## Troubleshooting Deployment

### Build Fails

**Issue:** Next.js build errors  
**Solution:** 
- Check build logs in Vercel
- Test locally: `yarn build`
- Fix any TypeScript or linting errors

### Environment Variables Not Working

**Issue:** API calls fail in production  
**Solution:**
- Verify all env vars are added in Vercel
- Make sure they're enabled for Production
- Redeploy after adding variables

### Supabase Connection Issues

**Issue:** Database queries fail  
**Solution:**
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Review RLS policies

### Gemini API Errors

**Issue:** AI advisory not working  
**Solution:**
- Verify API key is valid
- Check API quota limits
- Review Gemini API dashboard

---

## Scaling Considerations

### Database

- **Free Tier:** 500 MB database, 2 GB bandwidth
- **Upgrade:** Consider Supabase Pro for production
- **Optimize:** Use proper indexes (already configured)

### API Limits

- **Gemini Free Tier:** 60 requests/minute
- **Consider:** Rate limiting on frontend
- **Alternative:** Cache AI responses

### Vercel

- **Free Tier:** 100 GB bandwidth
- **Upgrade:** Pro plan for higher limits
- **CDN:** Automatic global distribution

---

## 🎯 Success Metrics

After deployment, monitor:

- ✅ API response times
- ✅ Database query performance
- ✅ User engagement (dashboards)
- ✅ Sensor data ingestion rate
- ✅ AI advisory generation success rate

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Gemini API:** https://ai.google.dev/docs

---

**🎉 Your Smart City AQI Monitoring System is now live and accessible globally!**
