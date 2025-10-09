# Mikvah Locator - UI/UX Improvements TODO

> **Focus**: High-impact UI/UX improvements to enhance user experience

---

## 🚀 HIGH IMPACT - QUICK WINS (Start Here!)

### 1. ⏳ Loading States & Skeletons
- [ ] Add spinner component to map page loading
- [ ] Create skeleton loader for mikvah cards
- [ ] Add loading state to admin dashboard
- [ ] Add loading spinner to submit form submission
- [ ] Add loading state to address search/autocomplete

### 2. 🖼️ Photo Gallery Enhancement
- [ ] Install lightbox library (yet-another-react-lightbox or photoswipe)
- [ ] Implement lightbox/modal for full-size photo viewing
- [ ] Add carousel/slider navigation in lightbox
- [ ] Add photo zoom functionality
- [ ] Improve photo grid layout with hover effects
- [ ] Add image loading states (blur-up/placeholder)

### 3. 🔔 Toast Notifications System
- [ ] Install sonner or react-hot-toast
- [ ] Add success toast for mikvah submission
- [ ] Add success/error toasts for admin actions (approve/reject/delete)
- [ ] Add toast for share/copy actions
- [ ] Add toast for login/logout
- [ ] Add error toasts for API failures
- [ ] Add toast for corrections submission

### 4. 📊 Visual Progress Bar for Submit Form
- [ ] Create progress bar component
- [ ] Replace text "Step 1/4" with visual progress bar
- [ ] Add step indicators with icons
- [ ] Highlight completed vs current vs upcoming steps
- [ ] Add smooth transitions between steps
- [ ] Add step validation indicators

### 5. 📱 Mobile Header/Navigation Improvements
- [ ] Create mobile hamburger menu component
- [ ] Implement slide-out/drawer navigation for mobile
- [ ] Improve header spacing and layout on mobile breakpoints
- [ ] Make language toggle more prominent with text labels
- [ ] Add user dropdown menu instead of icon-only buttons
- [ ] Test on various mobile screen sizes

### 6. 💬 Tooltips for Icon-Only Buttons
- [ ] Install/create tooltip component (radix-ui tooltip or custom)
- [ ] Add tooltips to header icons (logout, user, language)
- [ ] Add tooltips to map view toggle buttons (Map/List)
- [ ] Add tooltips to admin action buttons
- [ ] Add tooltips to navigation controls on map
- [ ] Add tooltips to marker clusters showing count

### 7. 📍 Improved Map Marker Design
- [ ] Design/source custom mikvah icon/marker (water droplet or mikvah symbol)
- [ ] Add drop shadow to markers for better visibility
- [ ] Improve cluster design with gradients/shadows
- [ ] Add hover effects to markers (scale, color change)
- [ ] Add selected marker state styling (pulse animation)
- [ ] Differentiate marker colors by mikvah type

---

## 🎯 MEDIUM PRIORITY (After Quick Wins)

### 8. 🔍 Filtering and Sorting in List View
- [ ] Add filter panel component with collapsible sections
- [ ] Implement filter by mikvah type (men_only, separate_hours, family)
- [ ] Add distance/proximity filter (radius selector)
- [ ] Add sort options (nearest, name A-Z, newest first)
- [ ] Add search within list functionality
- [ ] Add filter chips showing active filters
- [ ] Add "Clear all filters" button
- [ ] Persist filter preferences in localStorage

### 9. ⭐ User Favorites System
- [ ] Create `favorites` table in Supabase
- [ ] Add heart/bookmark icon to mikvah cards
- [ ] Implement add/remove favorite functionality
- [ ] Create favorites page at `/favorites`
- [ ] Add favorites count badge in header
- [ ] Sync favorites across devices (logged in users)
- [ ] Add favorites filter in list view
- [ ] Add animation when favoriting

### 10. ⭐ Ratings & Reviews Feature
- [ ] Create `reviews` table in Supabase
- [ ] Add star rating component
- [ ] Implement review submission form in modal
- [ ] Display average ratings on mikvah cards
- [ ] Show reviews list in mikvah details modal
- [ ] Add review moderation for admins
- [ ] Add helpful/not helpful votes for reviews
- [ ] Add sort/filter options for reviews

### 11. ✅ Admin Bulk Actions
- [ ] Add checkbox selection to admin mikvah cards
- [ ] Create bulk action toolbar (sticky at top)
- [ ] Implement bulk approve functionality
- [ ] Implement bulk reject functionality
- [ ] Implement bulk delete with confirmation modal
- [ ] Add "Select all" / "Deselect all" functionality
- [ ] Add "Select all on page" vs "Select all items"
- [ ] Show selection count in toolbar

### 12. 🌙 Dark Mode Toggle
- [ ] Add dark mode toggle switch to header
- [ ] Implement dark mode state management (localStorage + context)
- [ ] Test all pages in dark mode for contrast
- [ ] Update map style for dark mode (mapbox://styles/mapbox/dark-v11)
- [ ] Ensure proper contrast in dark mode (WCAG AA)
- [ ] Add smooth transition between modes
- [ ] Persist dark mode preference across sessions
- [ ] Add system preference detection

---

## ✨ POLISH & REFINEMENT (Final Touches)

### 13. 🎨 Custom Icon Set
- [ ] Create/source custom mikvah-related icon set
- [ ] Replace MapPin with custom mikvah icon
- [ ] Add icons for amenities (parking, accessibility, etc.)
- [ ] Create custom map marker icon (SVG)
- [ ] Ensure consistent icon sizing throughout app
- [ ] Add icon for each mikvah type
- [ ] Consider using icon library like Heroicons or custom SVGs

### 14. 🎬 Animations & Transitions
- [ ] Add page transition animations (Framer Motion)
- [ ] Implement smooth scroll behaviors
- [ ] Add hover transitions to cards (lift effect)
- [ ] Add marker bounce animation on selection
- [ ] Add fade-in animations for loaded content
- [ ] Add slide animations for mobile menu
- [ ] Add loading skeleton shimmer effect
- [ ] Add micro-interactions (button press, toggle switch)

### 15. 🎨 Custom Color Theme
- [ ] Research mikvah-appropriate color palette (water blues)
- [ ] Update CSS variables in globals.css
- [ ] Apply water/blue calming tones as primary
- [ ] Update secondary and accent colors
- [ ] Test color contrast for accessibility (contrast ratio 4.5:1)
- [ ] Update dark mode color palette
- [ ] Add gradient options for headers/cards
- [ ] Update Mapbox map style to match theme

### 16. ♿ Accessibility Audit
- [ ] Add ARIA labels to all icon-only buttons
- [ ] Implement skip-to-content link
- [ ] Test keyboard navigation throughout entire app
- [ ] Ensure proper heading hierarchy (h1 -> h2 -> h3)
- [ ] Add visible focus states to all interactive elements
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Ensure color contrast meets WCAG AA (4.5:1)
- [ ] Add alt text to all images and photos
- [ ] Test form accessibility and error announcements
- [ ] Add landmarks (nav, main, footer) with ARIA

### 17. 📱 PWA Features
- [ ] Create manifest.json with app info and icons
- [ ] Add service worker for offline support
- [ ] Add install prompt for mobile users
- [ ] Cache static assets (CSS, JS, fonts)
- [ ] Cache map tiles for offline viewing
- [ ] Add offline fallback page
- [ ] Test PWA on iOS Safari and Android Chrome
- [ ] Add app icons in various sizes
- [ ] Test install and offline functionality

---

## 📝 ADDITIONAL ENHANCEMENTS (Backlog)

- [ ] Print-friendly view for mikvah details (CSS media queries)
- [ ] Recent searches/history persistence (localStorage)
- [ ] Enhanced share functionality (WhatsApp, Facebook, Twitter)
- [ ] Empty state illustrations using undraw or custom
- [ ] Onboarding tour for first-time users (react-joyride)
- [ ] Email notifications for admin on new submissions
- [ ] Multi-language support expansion (Spanish, French, Russian)
- [ ] Advanced search with autocomplete and suggestions
- [ ] Map clustering improvements (spiderfy on cluster click)
- [ ] Export mikvah list as PDF or CSV

---

## 🐛 BUG FIXES & TECHNICAL DEBT (Discovered)

- [ ] Fix RTL layout issues in form labels and buttons
- [ ] Optimize image loading and compression (next/image)
- [ ] Improve form validation UX with inline errors
- [ ] Add proper error boundaries to catch component errors
- [ ] Improve SEO with metadata and Open Graph tags
- [ ] Add analytics tracking (Google Analytics or Plausible)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Fix any TypeScript errors or warnings
- [ ] Improve mobile touch targets (minimum 44x44px)

---

## 📋 ORIGINAL TODO (Reference)

### Previous High Priority Items
- [ ] Add toast notification system ✅ (moved to #3)
- [ ] Implement global error boundary component
- [ ] Add loading states to all async operations ✅ (moved to #1)
- [ ] Add environment variable validation with Zod

### Testing & Quality Assurance
- [ ] Set up Jest and React Testing Library
- [ ] Add unit tests for components
- [ ] Add integration tests for API routes
- [ ] Add E2E tests with Playwright

### Performance Optimizations
- [ ] Implement Next.js Image component for photo uploads
- [ ] Add React Query for data caching
- [ ] Optimize map rendering with React.memo
- [ ] Add image compression for uploads

### Code Organization
- [ ] Break down large components (AdminPage, SubmitPage)
- [ ] Create custom hooks for common patterns
- [ ] Extract reusable form components

### Database & Backend
- [ ] Add database migrations for new features
- [ ] Implement soft delete for mikvahs
- [ ] Add audit logging
- [ ] Implement rate limiting

---

## 🎯 COMPLETED TASKS

### ✅ Core Features (Already Done)
- [x] Next.js 15 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Supabase integration
- [x] Mapbox integration
- [x] Internationalization setup
- [x] Authentication system
- [x] Interactive map with clustering
- [x] Mikvah submission form
- [x] Photo upload functionality
- [x] Admin dashboard
- [x] User role management
- [x] Bilingual support (Hebrew/English)
- [x] Address suggestion system with Mapbox Geocoding
- [x] Search functionality on map
- [x] List view for mikvahs
- [x] Mikvah details modal
- [x] Correction submission form

---

## 📅 SPRINT PLANNING

### Sprint 1 (This Week): Loading & Notifications
- [ ] Task 1: Loading States & Skeletons
- [ ] Task 3: Toast Notifications System

### Sprint 2 (Next Week): Forms & Navigation
- [ ] Task 4: Visual Progress Bar
- [ ] Task 5: Mobile Header/Navigation
- [ ] Task 6: Tooltips

### Sprint 3 (Week 3): Visual Enhancements
- [ ] Task 2: Photo Gallery Enhancement
- [ ] Task 7: Improved Map Markers

### Sprint 4 (Week 4): Features
- [ ] Task 8: Filtering and Sorting
- [ ] Task 9: User Favorites

---

**Last Updated**: 2025-10-09
**Next Review**: After completing High Impact items

## 🎯 Completed Tasks

### ✅ Project Setup
- [x] Next.js 15 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Supabase integration
- [x] Mapbox integration
- [x] Internationalization setup
- [x] Authentication system
- [x] Database schema
- [x] Basic UI components

### ✅ Core Features
- [x] Interactive map with clustering
- [x] Mikvah submission form
- [x] Photo upload functionality
- [x] Admin dashboard
- [x] User role management
- [x] Bilingual support (Hebrew/English)
- [x] RLS security policies
- [x] Route protection middleware

### ✅ Recent Improvements
- [x] Address suggestion system with Mapbox Geocoding
- [x] Search functionality on map
- [x] Enhanced location selection in submission form
- [x] Improved user experience with autocomplete

## 📝 Notes

### Development Priorities
1. **Week 1**: Focus on error handling and user experience
2. **Week 2**: Add testing and performance optimizations
3. **Month 1**: Implement accessibility and UI improvements
4. **Month 2+**: Add advanced features and mobile support

### Technical Debt
- Large components need refactoring
- Missing comprehensive test coverage
- Performance optimizations needed
- Accessibility improvements required

### Resources Needed
- Testing framework setup
- Performance monitoring tools
- Accessibility testing tools
- Mobile development environment
- CI/CD pipeline setup

---

**Last Updated**: [Current Date]
**Next Review**: [Next Week]
