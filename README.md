# Next.js SaaS Starter - Website Analysis Platform

This is a comprehensive SaaS starter template for building a website analysis platform using **Next.js** with support for authentication, Stripe integration for payments, and a complete dashboard for analyzing websites.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- **Website Analysis**: Submit URLs for comprehensive website analysis
- **Report Generation**: Automated crawl jobs and detailed reports
- **Team Management**: Multi-user teams with role-based access control
- **Subscription Management**: Stripe integration with customer portal
- **Usage Tracking**: Quota management and usage analytics
- **Modern UI**: Beautiful dashboard with real-time updates
- **API-First**: RESTful APIs for all functionality

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [Postgres](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/) for subscriptions
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) with Tailwind CSS
- **Authentication**: Custom JWT-based auth system
- **Background Jobs**: Simulated crawl worker system

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Supabase account (optional, for storage)

### Installation

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
npm install
```

### Environment Setup

Create a `.env.local` file with the following variables:

```env
# Database
POSTGRES_URL=postgres://username:password@localhost:5432/database_name

# Auth
AUTH_SECRET=your_auth_secret_here_minimum_32_characters

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Supabase Configuration (optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Base URL
BASE_URL=http://localhost:3000
```

### Database Setup

Run the database migrations and seed the database:

```bash
npm run db:migrate
npm run db:seed
```

This creates a default user and team:
- **Email**: `test@test.com`
- **Password**: `admin123`

### Stripe Setup

1. Install and login to Stripe CLI:
```bash
stripe login
```

2. Start webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Copy the webhook secret to your `.env.local`

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Website Analysis

1. **Submit URL**: Use the dashboard form to submit a website URL for analysis
2. **Processing**: The system creates a crawl job and processes it in the background
3. **View Reports**: Check the Reports page to see analysis results
4. **Detailed View**: Click on any report to see comprehensive analysis data

### Team Management

- **Invite Members**: Team owners can invite new members
- **Role Management**: Assign owner or member roles
- **Activity Tracking**: Monitor team activity and usage

### Subscription Management

- **Plan Selection**: Choose between Base and Plus plans
- **Billing Portal**: Manage subscriptions through Stripe Customer Portal
- **Usage Limits**: Automatic quota enforcement based on plan

## API Endpoints

### Analysis
- `POST /api/analyze` - Submit URL for analysis
- `GET /api/reports` - List reports
- `GET /api/reports/[id]` - Get specific report

### Team Management
- `GET /api/user` - Get current user
- `GET /api/team` - Get team information

### Background Processing
- `POST /api/worker` - Trigger crawl worker (development)

## Database Schema

The application includes the following main tables:

- **users** - User accounts and authentication
- **teams** - Team/organization data with Stripe integration
- **team_members** - User-team relationships
- **sites** - Websites to be analyzed
- **crawl_jobs** - Background processing jobs
- **reports** - Analysis results and data
- **usage_events** - Usage tracking and quotas
- **activity_logs** - User activity tracking

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:setup     # Interactive database setup
npm run db:generate  # Generate new migrations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Drizzle Studio
```

### Background Jobs

The application includes a simulated crawl worker system:

- Jobs are created when URLs are submitted for analysis
- Worker processes jobs in the background
- Reports are generated automatically
- Error handling and retry logic included

### Testing the Worker

To manually trigger the crawl worker:

```bash
curl -X POST http://localhost:3000/api/worker
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- Database connection string
- Stripe keys (use live keys for production)
- Auth secret
- Base URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Next.js, Drizzle, and Stripe**

## 🚀 **Starta din publicerade MVP på Vercel**

### **1. Öppna din app**
Gå till din Vercel URL (t.ex. `https://your-app.vercel.app`)

### **2. Logga in med test-kontot**
- **Email**: `test@test.com`
- **Password**: `admin123`

### **3. Testa funktionaliteten**

#### **A) Skicka in en URL för analys**
1. Gå till dashboard
2. Använd URL-formuläret
3. Skicka in en webbplats (t.ex. `https://google.com`)

#### **B) Trigga background worker**
Eftersom din app är live, behöver du trigga worker-processen. Du kan göra detta genom:

```bash
curl -X POST https://your-app.vercel.app/api/worker
```

Eller skapa en enkel knapp i dashboard för att trigga worker.

#### **C) Kolla reports**
Gå till `/reports` för att se analysresultaten.

## 🔧 **Konfiguration som behövs på Vercel**

### **Miljövariabler i Vercel Dashboard**
Gå till din Vercel projekt-inställningar och sätt följande miljövariabler:

```env
<code_block_to_apply_changes_from>
```

## 🎯 **Snabb test-checklista**

1. ✅ **Öppna appen** på din Vercel URL
2. ✅ **Logga in** med `test@test.com` / `admin123`
3. ✅ **Gå till dashboard** - ser du URL-formuläret?
4. ✅ **Skicka in en URL** - får du bekräftelse?
5. ✅ **Trigga worker** - kör curl-kommandot
6. ✅ **Kolla reports** - ser du resultaten?

## 🚨 **Vanliga problem och lösningar**

### **Problem: "Database connection failed"**
- Kontrollera att `POSTGRES_URL` är korrekt i Vercel
- Använd en produktions-databas (Neon, Supabase, etc.)

### **Problem: "Unauthorized"**
- Kontrollera att `AUTH_SECRET` är satt
- Generera en ny: `openssl rand -base64 32`

### **Problem: Worker fungerar inte**
- Kontrollera att databasen är tillgänglig
- Kolla Vercel logs för felmeddelanden

##  **För att övervaka din app**

1. **Vercel Dashboard**: Kolla logs och performance
2. **Databas**: Övervaka anslutningar och queries
3. **Stripe Dashboard**: Kolla webhook events (om du använder betalningar)

##  **Nästa steg efter att appen fungerar**

1. **Sätt upp riktig databas** (Neon, Supabase, etc.)
2. **Konfigurera Stripe** för betalningar
3. **Sätt upp cron job** för worker (Vercel Cron)
4. **Lägg till analytics** (Vercel Analytics)
5. **Optimera performance**

**Vilken del behöver du hjälp med först?** Jag kan hjälpa dig med specifik konfiguration eller felsökning! 🚀

## 🚀 **Nästa steg för att få allt att fungera:**

### **1. Skapa .env.local fil**
Skapa en `.env.local` fil i root-mappen med följande innehåll:

```env
<code_block_to_apply_changes_from>
```

### **2. Kör databas migrations**
```bash
npm run db:migrate
```

### **3. Starta appen**
```bash
npm run dev
```

### **4. Testa funktionaliteten**

1. **Logga in**: Gå till `http://localhost:3000` och logga in med:
   - Email: `test@test.com`
   - Password: `admin123`

2. **Testa URL submission**: 
   - Gå till dashboard
   - Skicka in en URL (t.ex. `https://google.com`)

3. **Trigga worker**: Öppna en ny terminal och kör:
   ```bash
   curl -X POST http://localhost:3000/api/worker
   ```

4. **Kolla reports**: Gå till `/reports` för att se resultaten

## 🔧 **Vad du behöver konfigurera:**

### **Stripe Setup (valfritt för testning)**
Om du vill testa betalningar:
1. Gå till [Stripe Dashboard](https://dashboard.stripe.com/)
2. Hämta test API keys
3. Sätt upp webhook: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### **Supabase Setup (valfritt)**
Om du vill använda Supabase för storage:
1. Skapa projekt på [supabase.com](https://supabase.com)
2. Hämta URL och API keys
3. Sätt upp storage buckets

##  **Vad som fungerar nu:**

✅ **Komplett SaaS MVP** med:
- URL submission och analysis
- Background job processing
- Report generation
- Team management
- Usage tracking
- Modern UI/UX
- API endpoints

## 🎯 **För att testa hela flödet:**

1. **Starta appen**: `npm run dev`
2. **Logga in**: `test@test.com` / `admin123`
3. **Skicka URL**: Använd formuläret på dashboard
4. **Processa jobb**: `curl -X POST http://localhost:3000/api/worker`
5. **Visa resultat**: Kolla `/reports` sidan

## ❓ **Behöver du hjälp med:**

1. **Databas setup** - Har du PostgreSQL igång?
2. **Stripe konfiguration** - Vill du sätta upp betalningar?
3. **Supabase integration** - Behöver du storage?
4. **Deployment** - Vill du deploya till Vercel?

**Vilken del vill du börja med?** Jag kan hjälpa dig med specifika konfigurationer eller felsökning! 🚀
