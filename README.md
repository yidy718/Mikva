# Mikvah Locator

A modern web application for finding and submitting mikvah locations with interactive maps, bilingual support (Hebrew/English), and comprehensive admin features.

## Features

### Core Functionality
- Interactive map with marker clustering using Mapbox GL JS
- User authentication and authorization with Supabase
- Multi-step submission form with validation
- Admin dashboard for managing submissions and users
- Bilingual interface (Hebrew/English) with RTL support
- Mobile-first responsive design
- Dark mode support
- Photo upload and management
- Search and filter capabilities
- Geolocation and distance calculation

### User Features
- Browse mikvahs on interactive map
- View detailed information for each mikvah
- Submit new mikvah locations
- Upload up to 5 photos per submission
- Get directions via Google Maps
- Share mikvah information

### Admin Features
- Review and approve/reject submissions
- Edit approved mikvah information
- Delete mikvahs
- Manage user roles
- View submission statistics

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI components)
- React Hook Form with Zod validation
- i18next for internationalization

### Backend
- Supabase (PostgreSQL with PostGIS)
- Supabase Auth for authentication
- Supabase Storage for photos
- Row Level Security (RLS) policies

### Maps & Location
- Mapbox GL JS
- react-map-gl
- Supercluster for marker clustering

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account
- Mapbox account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yidy718/Mikva.git
cd Mikva
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Enable PostGIS extension:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Run the migration file located at `supabase/migrations/20240101000000_initial_schema.sql`

4. Fix RLS policies (if needed) by running the SQL scripts in the `scripts/` directory

### Mapbox Setup

1. Create an account at [mapbox.com](https://mapbox.com)
2. Create a new access token
3. Add the token to your `.env.local` file

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Creating an Admin User

After registering your first user, run this SQL in Supabase:
```sql
UPDATE user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

## Project Structure

```
Mikva/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/              # Main application
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── map/             # Map view
│   │   │   ├── mikvah/[id]/    # Mikvah detail page
│   │   │   └── submit/          # Submission form
│   │   ├── api/
│   │   │   └── admin/users/     # Admin API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── map/                 # Map components
│   │   │   └── MapView.tsx
│   │   ├── ui/                  # shadcn/ui components
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── i18n/                # Internationalization
│   │   │   ├── config.ts
│   │   │   └── locales/
│   │   ├── supabase/            # Supabase configuration
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── database.types.ts
│   │   ├── validations/         # Zod schemas
│   │   └── utils.ts
│   └── middleware.ts
├── supabase/
│   └── migrations/              # Database migrations
├── scripts/                     # SQL helper scripts
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Database Schema

### Tables

#### mikvahs
- Stores all mikvah submissions
- Uses PostGIS for spatial queries
- Includes bilingual fields (Hebrew/English)
- Status field for approval workflow
- Photo URLs array

#### user_roles
- Maps users to roles (user/admin)
- Automatically created on user signup

### Row Level Security

- Public users can view approved mikvahs
- Authenticated users can submit mikvahs (pending status)
- Users can view and edit their own pending submissions
- Admins have full access to all mikvahs and user management

## API Routes

### /api/admin/users
- GET: List all users with roles (admin only)
- Uses service role key for elevated permissions

## Deployment

### Vercel Deployment

1. Push your code to GitHub

2. Import the repository in Vercel

3. Configure environment variables in Vercel dashboard

4. Update Supabase Auth URLs with your Vercel domain

5. Deploy

See `DEPLOYMENT.md` for detailed instructions.

## Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `postcss.config.js` - PostCSS configuration

## Key Features Implementation

### Map Clustering
Uses Supercluster for efficient marker clustering. Clusters automatically adjust based on zoom level. Click clusters to zoom in and expand.

### Internationalization
Complete English and Hebrew translations with RTL support. Language preference persists in localStorage. Toggle language using the globe icon in the header.

### Photo Upload
Upload up to 5 photos per mikvah. Photos are stored in Supabase Storage and organized by user ID folders. Public URLs are stored in the database.

### Admin Workflow
New submissions start with "pending" status. Admins can approve, reject, edit, or delete mikvahs. Only approved mikvahs appear on the public map.

### Authentication
Protected routes using middleware. Admin-only pages check user roles. Email/password authentication with optional email confirmation.

## Security

- Environment variables for sensitive keys
- Row Level Security policies on database
- Service role key only used server-side
- Protected API routes
- CSRF protection via Supabase
- Secure password hashing

## Performance

- Dynamic imports for map components (avoid SSR issues)
- Image optimization with Next.js Image
- Lazy loading of components
- Debounced cluster updates
- Efficient spatial queries with PostGIS

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- WebGL support required for maps

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation in docs/

## Acknowledgments

Built with:
- Next.js by Vercel
- Supabase for backend infrastructure
- Mapbox for mapping capabilities
- shadcn/ui for UI components
- Radix UI for accessible components

## Roadmap

Future enhancements:
- Advanced search filters
- User reviews and ratings
- Mobile app (React Native)
- Email notifications
- API for third-party integrations
- Analytics dashboard
- Multi-language support (beyond Hebrew/English)
