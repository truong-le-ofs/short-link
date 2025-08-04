# URL Shortener Frontend

A modern URL shortener built with Next.js 14, TypeScript, Supabase, and shadcn/ui.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your Supabase project URL and API key in `.env.local`.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database & Auth**: Supabase
- **State Management**: @tanstack/react-query
- **Form Handling**: react-hook-form + zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication routes (grouped)
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/      # Dashboard page
│   ├── links/          # Links management
│   ├── analytics/      # Analytics dashboard
│   ├── [code]/         # Dynamic route for link resolution  
│   └── api/            # API routes
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and constants
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    └── supabase/      # Supabase client configurations
```

## 🔧 Development Workflow

### Phase 1: Project Setup & Architecture ✅
- [x] Next.js 14 + TypeScript + Tailwind setup
- [x] Supabase integration
- [x] shadcn/ui components
- [x] Authentication middleware
- [x] Type definitions
- [x] Folder structure

### Next Phases
- **Phase 2**: Core Architecture (routing, schemas)
- **Phase 3**: UI/UX Foundation (layouts, themes)
- **Phase 4**: Authentication System
- **Phase 5**: Link Management Features
- **Phase 6**: Analytics Dashboard
- **Phase 7**: API Integration & Optimization
- **Phase 8**: Testing & Deployment

## 🌟 Features

- **User Authentication**: Secure login/register with Supabase Auth
- **Link Management**: Create, edit, delete short links
- **Custom Short Codes**: Personalized short URLs
- **Password Protection**: Secure links with passwords
- **Expiration Dates**: Time-limited links
- **Click Limits**: Maximum click restrictions
- **Analytics Dashboard**: Comprehensive link analytics
- **Real-time Updates**: Live data with Supabase subscriptions
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support

## 📝 Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_APP_URL`: Your application URL (for production)

## 🚀 Deployment

This project is configured for Docker Compose deployment:

### Development
```bash
npm run dev
```

### Production with Docker
```bash
# Build and run with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d

# With nginx reverse proxy (production profile)
docker-compose --profile production up -d
```

### Manual Docker Build
```bash
# Build the Docker image
docker build -t url-shortener-fe .

# Run the container
docker run -p 3000:3000 --env-file .env.local url-shortener-fe
```

### Docker Environment Variables
Make sure to set these in your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## 🤝 Development Guidelines

- Use TypeScript strict mode
- Follow the established folder structure
- Use shadcn/ui components for UI
- Implement proper error handling
- Add loading states for async operations

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
