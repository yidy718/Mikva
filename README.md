# Mikvah Locator

A modern web application for finding and submitting mikvah locations with interactive maps, bilingual support (Hebrew/English), and comprehensive admin features.

## Features

- 🗺️ **Interactive Map** with clustering using Mapbox GL JS
- 🔐 **Authentication** with Supabase Auth
- 📝 **User Submissions** with multi-step form and validation
- 👨‍💼 **Admin Dashboard** for approving/rejecting submissions
- 🌐 **Bilingual Support** (Hebrew/English) with RTL support
- 📱 **Mobile-First** responsive design
- 🎨 **Modern UI** with shadcn/ui and Tailwind CSS
- 🌙 **Dark Mode** support
- 📸 **Photo Upload** to Supabase Storage
- 🔍 **Search & Filter** functionality
- 📍 **Geolocation** and distance calculation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Authentication**: Supabase Auth
- **Maps**: Mapbox GL JS with react-map-gl
- **Clustering**: Supercluster
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Mapbox account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mikvah-locator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Enable PostGIS extension in your Supabase project:
   - Go to SQL Editor in your Supabase dashboard
   - Run: `CREATE EXTENSION IF NOT EXISTS postgis;`

3. Run the migration file:
   - Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Paste and run in the Supabase SQL Editor

4. Set up Storage:
   - The migration creates a `mikvah-photos` bucket automatically
   - Ensure public access is enabled for the bucket

### Mapbox Setup

1. Create a Mapbox account at [mapbox.com](https://mapbox.com)
2. Create a new access token with the following scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
3. Copy the token to `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
mikvah-locator/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/          # Main application pages
│   │   │   ├── map/         # Map view
│   │   │   ├── submit/      # Submission form
│   │   │   ├── admin/       # Admin dashboard
│   │   │   └── mikvah/[id]/ # Mikvah detail page
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── map/             # Map components
│   │   │   └── MapView.tsx
│   │   ├── ui/              # shadcn/ui components
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── i18n/            # Internationalization
│   │   │   ├── config.ts
│   │   │   └── locales/
│   │   ├── supabase/        # Supabase client & types
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── database.types.ts
│   │   ├── validations/     # Zod schemas
│   │   └── utils.ts
│   └── middleware.ts
├── supabase/
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Database Schema

### Tables

#### `mikvahs`
- Stores all mikvah submissions with location data
- Uses PostGIS for efficient spatial queries
- Includes bilingual name fields (Hebrew/English)
- Status field for approval workflow

#### `user_roles`
- Maps users to roles (user/admin)
- Automatically created on user signup

### Row Level Security (RLS)

- Public can view approved mikvahs
- Authenticated users can submit mikvahs (pending status)
- Users can view their own pending submissions
- Admins have full access to all mikvahs

## Admin Setup

To make a user an admin:

1. Sign up the user through the app
2. Run this SQL in Supabase SQL Editor:

```sql
UPDATE user_roles
SET role = 'admin'
WHERE user_id = 'user-uuid-here';
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## Key Features Implementation

### Map Clustering
- Uses Supercluster for efficient marker clustering
- Automatically adjusts cluster size based on zoom level
- Click clusters to zoom in and expand

### Internationalization
- Language switcher in header
- RTL support for Hebrew
- Persistent language preference in localStorage

### Photo Upload
- Upload up to 5 photos per mikvah
- Stored in Supabase Storage
- Organized by user ID folders

### Admin Workflow
- Submissions start as "pending"
- Admins can approve or reject
- Only approved mikvahs appear on public map

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the maintainers

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Maps by [Mapbox](https://mapbox.com/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
