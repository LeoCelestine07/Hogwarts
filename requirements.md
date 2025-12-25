# Hogwarts Music Studio - Requirements & Architecture

## Original Problem Statement
Build a full-stack, multi-page modern web application for a professional audio post-production studio using a vibrant yet professional Liquid Glass / Glassmorphism UI. Features include glassmorphic navigation, services with pricing, projects portfolio, booking system without login, admin dashboard with OTP verification, email notifications, and AI chatbot.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Email**: Resend API
- **AI Chatbot**: OpenAI GPT-5.2 via Emergent LLM Key

## Completed Features

### 1. Multi-Page Website
- Home (with logo, services, featured projects, CTA)
- Services (all 6 services with glass widgets)
- Projects (5 featured projects with bento grid)
- About (founder info with IMDb link)
- Booking (3-step form without login)
- Login/Register (optional user accounts)
- Admin Dashboard (protected)

### 2. Design System
- Teal/Cyan/Orange color theme (no purple/pink)
- Hogwarts logo in navbar and footer
- Lightning bolt decorations
- Glassmorphic cards and navigation
- Responsive design

### 3. Booking System
- 3-step form (Personal Info → Service Selection → Date/Time)
- No login required
- Email confirmation to user
- Email notification to admin
- Calendar date picker
- Time slot selection

### 4. Admin Dashboard (Role-Based)
- **Super Admin** (leocelestine.s@gmail.com only):
  - Full website control
  - Services management with pricing
  - Projects management
  - Site settings (background theme, colors)
  - Admin team management
  - Access approval for other admins
  
- **Regular Admin** (with full access granted):
  - Services management
  - Projects management
  - Site settings
  
- **Basic Admin** (default):
  - Bookings management only

### 5. Image Upload
- Upload from device (phone/computer)
- Or use URL
- Supports JPG/PNG (max 5MB)
- Used for services and projects

### 6. Services Management
- Add/Edit/Delete services
- Fixed pricing (e.g., ₹299/hr) or Project-based
- Custom icons
- Image upload
- Currently: Dubbing (₹299/hr), Vocal Recording, Mixing, Mastering, SFX & Foley, Music Production

### 7. Site Customization
- Background type: Gradient, Solid, Texture, Image
- Brand colors: Primary, Secondary, Accent
- Color picker with presets

### 8. AI Chatbot
- OpenAI GPT-5.2 powered
- Context-aware (knows services, contact info)
- Floating widget on all pages

## API Endpoints

### Public
- `GET /api/services` - List services
- `GET /api/projects` - List projects
- `GET /api/settings/site` - Get site settings
- `POST /api/bookings` - Create booking
- `POST /api/chat` - AI chatbot

### User Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/bookings/user`

### Admin Auth
- `POST /api/admin/request-otp`
- `POST /api/admin/verify-otp`
- `POST /api/admin/login`

### Admin (Protected)
- `GET /api/bookings`
- `PUT /api/bookings/{id}/status`
- `DELETE /api/bookings/{id}`
- `GET /api/admin/stats`

### Full Access Admin
- `POST /api/services`
- `PUT /api/services/{id}`
- `DELETE /api/services/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `PUT /api/settings/site`
- `POST /api/upload/image`

### Super Admin Only
- `GET /api/admin/list`
- `PUT /api/admin/{id}/access`
- `DELETE /api/admin/{id}`

## Next Action Items
1. Complete admin setup by checking email for OTP verification
2. Add actual project images via admin dashboard
3. Consider adding audio sample player for services
4. Add testimonials section
5. Implement booking calendar sync
6. Add portfolio showcase reel

## Environment Variables
```
# Backend
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
RESEND_API_KEY=re_8Lo8JjqN_LnRqN86ubY4rrZkYYSyLc4Kf
ADMIN_EMAIL=leocelestine.s@gmail.com
ADMIN_PHONE=9600130807
JWT_SECRET=hogwarts_music_studio_secret_key_2024
EMERGENT_LLM_KEY=sk-emergent-...

# Frontend
REACT_APP_BACKEND_URL=https://...
```
