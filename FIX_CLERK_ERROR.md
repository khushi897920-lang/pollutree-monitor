# 🔧 FIX: Clerk Sign-Up Error

## Error:
```
Error: Invalid Server Actions request.
x-forwarded-host header does not match origin header
```

## Root Cause:
Clerk needs to whitelist your production domain in the Clerk dashboard.

---

## ✅ Solution: Add Domain to Clerk Dashboard

### Step 1: Go to Clerk Dashboard
https://dashboard.clerk.com

### Step 2: Select Your Project
Click on "Smart City AQI" project (or whatever you named it)

### Step 3: Navigate to Domains Section
- Click on **"Domains"** in the left sidebar
- Or go to: Settings → Domains

### Step 4: Add Your Domains

Add these domains to the **Production** section:

```
pollutree-monitor.preview.emergentagent.com
pollutree-monitor.cluster-0.preview.emergentcf.cloud
```

**How to add:**
1. Click **"Add Domain"** button
2. Enter domain name
3. Click **"Add"**
4. Repeat for second domain

### Step 5: Save and Wait
- Click **"Save"** or **"Apply"**
- Wait 1-2 minutes for changes to propagate

---

## 🧪 Test After Adding Domains

1. **Refresh your app**: https://pollutree-monitor.preview.emergentagent.com
2. **Try Sign Up** again
3. **Create account** with email and password
4. **Should work!** ✅

---

## Alternative: Use Clerk Hosted Pages (Quick Fix)

If adding domains doesn't work immediately, use Clerk's hosted sign-in pages:

### Update Clerk Settings:
1. Go to Clerk Dashboard → **User & Authentication** → **Email, Phone, Username**
2. Scroll to **"Application"** section
3. Set:
   - **Sign-in mode**: "Redirect"
   - **Sign-in URL**: Use Clerk's hosted page (default)

This will redirect users to Clerk's domain for authentication (no Server Actions needed).

---

## 🔍 Verify Domain Configuration

Check if domains are properly configured:

```bash
curl -I https://pollutree-monitor.preview.emergentagent.com/sign-up
```

Look for headers:
- `x-forwarded-host`
- `origin`

Both should match after Clerk configuration.

---

## 📝 Current Configuration

**Already Applied:**
✅ `CLERK_TRUST_HOST=true` in .env
✅ Server Actions allowed origins in next.config.js
✅ Middleware configured correctly

**Missing:**
❌ Production domains in Clerk Dashboard (YOU NEED TO ADD)

---

## 🆘 If Still Not Working

**Option 1: Contact Clerk Support**
- Email: support@clerk.com
- Explain: "Production domain not working with Server Actions"

**Option 2: Use Development Mode Locally**
- Works fine on `localhost:3000`
- Can test auth flow locally

**Option 3: Deploy to Vercel**
- Vercel has better integration with Clerk
- Automatically handles domain configuration

---

## 🎯 Summary

**What to do NOW:**
1. Go to https://dashboard.clerk.com
2. Navigate to **Domains** section
3. Add both domains:
   - `pollutree-monitor.preview.emergentagent.com`
   - `pollutree-monitor.cluster-0.preview.emergentcf.cloud`
4. Save and wait 1-2 minutes
5. Refresh app and try sign up again

**It should work after this!** 🚀
