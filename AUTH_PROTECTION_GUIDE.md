# 🔐 Admin Login Protection Guide

## Overview

The admin login page is now **protected with a secret access key** that must be provided via URL query parameter. This ensures only authorized personnel can discover and access the login interface.

---

## How It Works

### ✅ What Changed

1. **Login button removed** from the public header - not visible to users
2. **Auth route protected** with a secret token validation
3. **Unauthorized access redirected** to homepage

### 🔑 Accessing the Login Page

To access the login page, you must use:

```
https://landing.quimera-tech.workers.dev/auth?secret=YOUR_SECRET_KEY
```

**Without the correct secret**, attempting to visit `/auth` will redirect you to the homepage.

---

## Setup Instructions

### 1️⃣ Generate a Strong Secret Key

Create a random, strong secret key. You can use OpenSSL:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
$bytes = New-Object byte[] 32
>> [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
>> $secret = [System.Convert]::ToBase64String($bytes).Replace('/','-').Replace('+','_').TrimEnd('=')
>> $secret
```

Example output: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2️⃣ Set the Environment Variable

Add to your `.env.local` file (or `.env` in production):

```env
VITE_AUTH_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace the value with your generated secret key.

### 3️⃣ Deploy to Production

Make sure the environment variable is set in Cloudflare:

```bash
wrangler secret put VITE_AUTH_SECRET_KEY
```

Or add it via Cloudflare Dashboard:

- Go to Workers → Your Worker → Settings → Environment Variables
- Add `VITE_AUTH_SECRET_KEY` with your secret value

### 4️⃣ Access the Login Page

Use the full URL with your secret:

```
https://landing.quimera-tech.workers.dev/auth?secret=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📝 Security Notes

### ✅ Best Practices

- **Change the secret regularly** - update it periodically for security
- **Use HTTPS only** - the secret should only be transmitted over HTTPS
- **Keep it private** - never commit the actual secret to version control
- **Use strong keys** - avoid simple/predictable strings
- **Different secrets per environment** - use different keys for dev/staging/production

### ⚠️ Important

- The secret is passed in the URL, so it's only safe over HTTPS
- Consider rotating your secret if you believe it's been compromised
- The query parameter must match **exactly** (case-sensitive)

---

## 🧪 Testing Locally

### Development Mode

```bash
# 1. Set the secret in .env.local
VITE_AUTH_SECRET_KEY=your_test_secret

# 2. Run dev server
npm run dev

# 3. Access with your secret
http://localhost:5173/auth?secret=your_test_secret

# 4. Without secret (should redirect to home)
http://localhost:5173/auth  # → redirects to /
```

### Production Testing

```bash
curl "https://landing.quimera-tech.workers.dev/auth?secret=YOUR_SECRET_KEY" -I
# Should return 200 OK with login page

curl "https://landing.quimera-tech.workers.dev/auth" -I
# Should return 302 redirect to /
```

---

## 🔄 Changing Your Secret

### 1. Generate a New Secret

```bash
openssl rand -base64 32
```

### 2. Update Environment Variable

Update `.env.local` or Cloudflare secret with the new value

### 3. Rebuild & Deploy

```bash
npm run build
npx wrangler deploy --config .output/server/wrangler.json --name landing
```

### 4. Use New URL

Access the login with your new secret in the URL

---

## ❓ Troubleshooting

### ❌ "Redirected to homepage when accessing /auth"

- Check that your secret is **exactly correct** (case-sensitive)
- Verify the environment variable is set correctly
- Make sure the URL format is: `/auth?secret=YOUR_KEY` (not `/auth/?secret=...`)

### ❌ "Secret not working in production"

- Ensure you set the secret via `wrangler secret put` or Cloudflare Dashboard
- Check that the worker can access the environment variable
- Redeploy the worker after updating the secret

### ❌ "Still seeing login button in header"

- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Rebuild and redeploy the application
- Check that the Header.tsx changes were deployed

---

## 📋 File References

| File                             | Change                  | Purpose                                  |
| -------------------------------- | ----------------------- | ---------------------------------------- |
| `src/components/site/Header.tsx` | Login button removed    | Hide login from public view              |
| `src/routes/auth.tsx`            | Secret validation added | Protect auth route with token            |
| `.env.example`                   | Secret key documented   | Template for configuration               |
| `.output/server/wrangler.json`   | No changes              | Worker config (needs env var at runtime) |

---

## 🎯 Summary

✅ Login button hidden from public header  
✅ Auth page only accessible with secret key  
✅ Secret passed via URL query parameter  
✅ Unauthorized access redirected to homepage  
✅ Ready for production use

**Your admin panel is now secure and discovery-resistant!** 🔒
