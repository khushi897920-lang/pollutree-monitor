# Role-Based Access Control (RBAC) Implementation Guide

## Problem: 
Currently, any logged-in user can access admin panel. We need:
- **Admin Users**: Full access to admin dashboard, mitigation controls
- **Citizen Users**: Public dashboard access only

---

## ✅ Solution: Implement Roles Using Clerk Metadata

### Step 1: Add Role to User Metadata in Clerk

**Method 1: Via Clerk Dashboard (Manual)**

1. Go to: https://dashboard.clerk.com
2. Navigate to **Users** section
3. Select a user you want to make admin
4. Scroll to **"Public metadata"** section
5. Click **"Edit"**
6. Add this JSON:
```json
{
  "role": "admin"
}
```
7. Click **"Save"**

**Method 2: Via API (Automated - Recommended)**

We'll create an admin setup API that you can call once:

```javascript
// Call this endpoint to make a user admin
POST /api/admin/setup
{
  "email": "admin@example.com"
}
```

---

### Step 2: Update Middleware to Check Roles

The middleware will check if user has "admin" role before allowing access to /admin routes.

---

### Step 3: Update Admin Dashboard

Admin dashboard will check user role and show appropriate message if not authorized.

---

## 🎯 Role Types

| Role | Access |
|------|--------|
| **admin** | Full admin panel, mitigation controls, all wards |
| **citizen** (default) | Public dashboard, chatbot, view-only |
| **ward_admin** (optional) | Specific ward management only |

---

## 🔧 How It Works After Implementation

1. **User signs up** → Automatically gets "citizen" role
2. **You manually promote** → Change metadata to "admin"
3. **Admin tries to access /admin** → Middleware checks role → Allows
4. **Citizen tries to access /admin** → Middleware checks role → Redirects to /citizen

---

## 📝 First Admin Setup

**To make yourself admin:**

1. Sign up normally
2. Go to Clerk Dashboard → Users
3. Find your user
4. Add metadata: `{"role": "admin"}`
5. Refresh app → You'll have admin access!

---

## 🚀 Future Enhancements

- **Super Admin**: Can create other admins
- **Ward Admin**: Manages specific wards only
- **Viewer**: Read-only admin access
- **API Keys**: For ESP32 sensors with ward-specific access

---

This will be implemented in the next update!
