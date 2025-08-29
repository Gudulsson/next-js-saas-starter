# Supabase Auth Setup Guide

## Översikt

Detta projekt använder Supabase Auth för användarhantering istället för custom JWT-lösningen. Här är en komplett guide för att sätta upp Supabase Auth.

## Steg 1: Supabase Projekt Setup

### 1.1 Skapa Supabase Projekt
1. Gå till [supabase.com](https://supabase.com)
2. Klicka "New Project"
3. Välj din organisation
4. Ge projektet ett namn (t.ex. "next-js-saas")
5. Välj en region nära dig
6. Klicka "Create new project"

### 1.2 Hämta API-nycklar
1. I Supabase Dashboard, gå till "Settings" → "API"
2. Kopiera:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Konfigurera Auth Settings
1. Gå till "Authentication" → "Settings"
2. Under "Site URL", lägg till:
   - `http://localhost:3000` (för utveckling)
   - `https://your-domain.com` (för produktion)
3. Under "Redirect URLs", lägg till:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## Steg 2: Environment Variables

Skapa `.env.local` med följande variabler:

```env
# Database
POSTGRES_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Auth
AUTH_SECRET="your_auth_secret_key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# App
BASE_URL="http://localhost:3000"
```

## Steg 3: Google OAuth Setup (Valfritt)

### 3.1 Skapa Google OAuth App
1. Gå till [Google Cloud Console](https://console.cloud.google.com/)
2. Skapa ett nytt projekt eller välj befintligt
3. Gå till "APIs & Services" → "Credentials"
4. Klicka "Create Credentials" → "OAuth 2.0 Client IDs"
5. Välj "Web application"
6. Lägg till authorized redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### 3.2 Konfigurera i Supabase
1. I Supabase Dashboard, gå till "Authentication" → "Providers"
2. Aktivera Google
3. Lägg till:
   - **Client ID**: Din Google OAuth Client ID
   - **Client Secret**: Din Google OAuth Client Secret

## Steg 4: Database Schema

Kör migrations för att sätta upp databasen:

```bash
npm run db:generate
npm run db:migrate
```

## Steg 5: Testa Auth Flow

### 5.1 Starta utvecklingsservern
```bash
npm run dev
```

### 5.2 Testa Sign Up
1. Gå till `http://localhost:3000/sign-up`
2. Skapa ett konto
3. Verifiera att användaren skapas i både Supabase och din databas

### 5.3 Testa Sign In
1. Gå till `http://localhost:3000/sign-in`
2. Logga in med ditt konto
3. Verifiera att du kommer till dashboard

## Steg 6: Produktionssetup

### 6.1 Vercel Environment Variables
Lägg till alla environment variables i Vercel Dashboard:
1. Gå till ditt Vercel-projekt
2. Settings → Environment Variables
3. Lägg till alla variabler från `.env.local`

### 6.2 Supabase Production Settings
1. I Supabase Dashboard, gå till "Authentication" → "Settings"
2. Uppdatera Site URL och Redirect URLs för din produktionsdomän
3. Aktivera "Enable email confirmations" om du vill ha email-verifiering

## Komponenter

### SupabaseAuth
- Hanterar sign-in/sign-up formulär
- Stöder email/password och Google OAuth
- Automatisk redirect efter autentisering

### AuthContext
- Hanterar användarstate genom hela appen
- Automatisk session-hantering
- Sync med databas

### UserProfile
- Visar användarinformation
- Hanterar sign out
- Dropdown menu med användaralternativ

### ProtectedRoute
- Skyddar sidor som kräver autentisering
- Automatisk redirect till sign-in om inte autentiserad

## API Routes

### `/api/auth/sync`
- Synkar Supabase användardata med din databas
- Skapar automatiskt team för nya användare

### `/api/auth/signout`
- Hanterar sign out
- Rensar session cookies

### `/auth/callback`
- Hanterar OAuth redirects
- Skapar session tokens
- Redirectar till rätt sida

## Felsökning

### Vanliga problem:

1. **"Invalid API Key"**
   - Kontrollera att alla Supabase API-nycklar är korrekta
   - Verifiera att environment variables är satta

2. **"Redirect URI mismatch"**
   - Kontrollera redirect URLs i Supabase Auth settings
   - Se till att de matchar din app URL

3. **"Database connection failed"**
   - Verifiera POSTGRES_URL
   - Kontrollera att databasen är tillgänglig

4. **"User not found in database"**
   - Kontrollera att `/api/auth/sync` fungerar
   - Verifiera att migrations har körts

## Nästa steg

1. Implementera email-verifiering
2. Lägg till fler OAuth providers (GitHub, Discord, etc.)
3. Implementera password reset
4. Lägg till användarroller och permissions
5. Implementera team invitations via email
