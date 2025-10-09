# Mikvah Locator - Setup & Development Guide

## Project Overview

**Mikvah Locator** is a Next.js application for finding and submitting mikvah locations worldwide with interactive maps, bilingual support (Hebrew/English), and comprehensive admin features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Mapbox account

### 1. Clone and Install
```bash
git clone <repository-url>
cd Mikva
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Enable PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;`
3. Run migration: `supabase/migrations/20240101000000_initial_schema.sql`
4. Fix RLS policies using scripts in `scripts/` directory

### 4. Mapbox Setup
1. Create account at [mapbox.com](https://mapbox.com)
2. Generate access token
3. Add to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── map/              # Map components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configs
│   ├── i18n/            # Internationalization
│   ├── supabase/        # Supabase client configs
│   └── validations/     # Zod schemas
└── middleware.ts         # Route protection
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:reset        # Reset database (if configured)
npm run db:seed         # Seed database (if configured)
```

## 🔧 Key Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Backend (PostgreSQL + Auth + Storage)
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Hook Form + Zod** - Form handling
- **Mapbox GL JS** - Interactive maps
- **i18next** - Internationalization

## 🗄️ Database Schema

### Tables
- **mikvahs** - Mikvah locations with PostGIS spatial data
- **user_roles** - User permissions (user/admin)

### Key Features
- PostGIS for spatial queries
- Row Level Security (RLS) policies
- Automatic user role creation
- Photo storage in Supabase Storage

## 🌐 Internationalization

Supports Hebrew (RTL) and English with:
- Language detection and persistence
- RTL layout support
- Complete translation coverage
- Worldwide address search in multiple languages

## 🗺️ Map Features

- Interactive Mapbox GL JS maps
- Marker clustering with Supercluster
- Location selection for submissions
- Geolocation support
- Worldwide address search and suggestions
- Global map coverage

## 🔐 Authentication & Security

- Supabase Auth for user management
- RLS policies for data protection
- Middleware for route protection
- Admin role checking

## 📱 Features

### User Features
- Browse mikvahs worldwide on interactive map
- Submit new mikvah locations anywhere
- Upload photos (max 5)
- Bilingual interface
- Mobile-responsive design
- Worldwide address search

### Admin Features
- Review pending submissions
- Approve/reject mikvahs
- Edit approved mikvahs
- Manage user roles
- User management dashboard

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Configure environment variables
4. Update Supabase Auth URLs
5. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🐛 Troubleshooting

### Common Issues
1. **Map not loading**: Check Mapbox token
2. **Database errors**: Verify RLS policies
3. **Auth issues**: Check Supabase configuration
4. **Build errors**: Clear `.next` folder and reinstall

### Debug Mode
```bash
DEBUG=* npm run dev  # Enable debug logging
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details
