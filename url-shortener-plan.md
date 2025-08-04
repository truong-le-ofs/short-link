# URL Shortener - 6-Hour Development Plan with Supabase

## Overview
Build a full-featured URL shortener application with user authentication, link management, analytics, and advanced features using Next.js and Supabase.

## Requirements Checklist
- [x] User registration & authentication
- [x] Short link management (CRUD)
- [x] Dynamic target URL updates
- [x] Time-based access restrictions
- [x] Scheduled URL changes
- [x] Password protection with time limits
- [x] Analytics & tracking
- [x] Web interface
- [x] API endpoints
- [x] Database storage
- [x] Docker deployment

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Styling**: Tailwind CSS + shadcn/ui
- **Analytics**: Supabase Database + Recharts
- **Deployment**: Docker Compose (Next.js) + Supabase Cloud

## Time Allocation (6 Hours)

### Hour 0-0.5: Project Setup (30 minutes)
- [ ] Create Next.js project
- [ ] Set up Supabase project
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Initialize project structure

### Hour 0.5-1: Authentication (30 minutes)
- [ ] Configure Supabase Auth
- [ ] Create auth pages (login/register)
- [ ] Set up auth middleware
- [ ] Protected routes
- [ ] User profile component

### Hour 1-3: Core Features (2 hours)
- [ ] Database schema & RLS policies
- [ ] Link CRUD operations
- [ ] Short code generation
- [ ] Link resolution logic
- [ ] Password protection
- [ ] Time-based restrictions
- [ ] Scheduled URL changes

### Hour 3-5: Analytics & Advanced Features (2 hours)
- [ ] Click tracking
- [ ] Analytics dashboard
- [ ] Real-time updates
- [ ] Device/browser detection
- [ ] Geographic tracking
- [ ] Data visualization
- [ ] Export functionality

### Hour 5-5.5: Deployment (30 minutes)
- [ ] Docker configuration
- [ ] Edge Functions deployment
- [ ] Environment setup
- [ ] API documentation

### Hour 5.5-6: Testing & Polish (30 minutes)
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] UI polish
- [ ] Documentation

## Implementation Guide

### 1. Project Setup

```bash
# Create Next.js project
npx create-next-app@latest shortlink-app --typescript --tailwind --app
cd shortlink-app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install nanoid date-fns recharts ua-parser-js bcryptjs
npm install @tanstack/react-query axios
npx shadcn-ui@latest init

# Add shadcn components
npx shadcn-ui@latest add button card form input label table tabs toast
```

### 2. Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Schema

Execute in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Links table
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  password TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  password_expires_at TIMESTAMP WITH TIME ZONE,
  max_clicks INTEGER,
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled URL changes
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_analytics_link_id ON analytics(link_id);
CREATE INDEX idx_analytics_clicked_at ON analytics(clicked_at);
CREATE INDEX idx_schedules_link_id ON schedules(link_id);
CREATE INDEX idx_schedules_dates ON schedules(starts_at, ends_at);

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Links policies
CREATE POLICY "Users can view own links" ON links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own links" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON links
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view active links for resolution" ON links
  FOR SELECT USING (is_active = true);

-- Schedules policies
CREATE POLICY "Users can manage own schedules" ON schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = schedules.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Anyone can insert analytics" ON analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = analytics.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION increment_click_count(link_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1 
  WHERE id = link_uuid;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Supabase Client Setup

`lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 5. Project Structure

```
shortlink-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── links/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── links/
│   │   │   └── route.ts
│   │   └── resolve/
│   │       └── route.ts
│   ├── [code]/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthProvider.tsx
│   ├── links/
│   │   ├── LinkForm.tsx
│   │   ├── LinkTable.tsx
│   │   ├── LinkCard.tsx
│   │   └── ScheduleForm.tsx
│   ├── analytics/
│   │   ├── AnalyticsChart.tsx
│   │   ├── DeviceStats.tsx
│   │   └── GeographicMap.tsx
│   ├── ui/
│   │   └── (shadcn components)
│   └── common/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useLinks.ts
│   └── useAnalytics.ts
├── types/
│   ├── supabase.ts
│   └── index.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### 6. Core Components Implementation

#### Link Creation Form
```typescript
// components/links/LinkForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { nanoid } from 'nanoid'
import { supabase } from '@/lib/supabase'

export function LinkForm() {
  const { register, handleSubmit } = useForm()
  
  const onSubmit = async (data) => {
    const shortCode = nanoid(6)
    const { error } = await supabase.from('links').insert({
      short_code: shortCode,
      target_url: data.targetUrl,
      password: data.password,
      expires_at: data.expiresAt,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    
    if (!error) {
      // Handle success
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### 7. Edge Functions

Create `supabase/functions/resolve-link/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const shortCode = url.pathname.split('/').pop()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get link with active schedule
  const { data: link, error } = await supabase
    .from('links')
    .select(`
      *,
      schedules (*)
    `)
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single()

  if (error || !link) {
    return new Response('Link not found', { status: 404 })
  }

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return new Response('Link expired', { status: 410 })
  }

  // Check max clicks
  if (link.max_clicks && link.click_count >= link.max_clicks) {
    return new Response('Link click limit reached', { status: 410 })
  }

  // Find active scheduled URL
  const now = new Date()
  const activeSchedule = link.schedules?.find((s: any) => 
    new Date(s.starts_at) <= now && 
    (!s.ends_at || new Date(s.ends_at) > now) &&
    s.is_active
  )

  const targetUrl = activeSchedule?.target_url || link.target_url

  // Track analytics (async, don't wait)
  const trackingData = {
    link_id: link.id,
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    user_agent: req.headers.get('user-agent'),
    referrer: req.headers.get('referer')
  }

  Promise.all([
    supabase.from('analytics').insert(trackingData),
    supabase.rpc('increment_click_count', { link_uuid: link.id })
  ])

  // Return response
  return new Response(JSON.stringify({ 
    targetUrl, 
    requiresPassword: !!link.password,
    passwordExpiresAt: link.password_expires_at
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 8. Docker Configuration

`Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 9. API Routes

`app/api/links/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('links')
    .select('*, schedules(*), analytics(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Implementation for creating links via API
}
```

### 10. Key Features Implementation

#### Password Protection
```typescript
// app/[code]/page.tsx
export default function RedirectPage({ params }: { params: { code: string } }) {
  const [password, setPassword] = useState('')
  const [link, setLink] = useState(null)
  
  useEffect(() => {
    checkLink()
  }, [])
  
  const checkLink = async () => {
    const res = await fetch(`/api/resolve?code=${params.code}`)
    const data = await res.json()
    
    if (data.requiresPassword) {
      setLink(data)
    } else {
      window.location.href = data.targetUrl
    }
  }
  
  const handlePasswordSubmit = async () => {
    // Verify password and redirect
  }
  
  if (link?.requiresPassword) {
    return <PasswordForm onSubmit={handlePasswordSubmit} />
  }
  
  return <div>Redirecting...</div>
}
```

#### Real-time Analytics
```typescript
// hooks/useAnalytics.ts
export function useRealtimeAnalytics(linkId: string) {
  const [analytics, setAnalytics] = useState([])
  
  useEffect(() => {
    const subscription = supabase
      .channel(`analytics:${linkId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'analytics', filter: `link_id=eq.${linkId}` },
        (payload) => {
          setAnalytics(prev => [...prev, payload.new])
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [linkId])
  
  return analytics
}
```

### 11. Testing Checklist

- [ ] User registration/login flow
- [ ] Link creation with all options
- [ ] Short link resolution
- [ ] Password protection
- [ ] Time-based expiration
- [ ] Scheduled URL changes
- [ ] Analytics tracking
- [ ] Real-time updates
- [ ] API endpoints
- [ ] Docker deployment

### 12. Performance Optimizations

1. **Database Indexes**: Already included in schema
2. **Caching**: Use Next.js ISR for public pages
3. **Rate Limiting**: Implement in Edge Functions
4. **CDN**: Use Vercel/Cloudflare for static assets

### 13. Security Considerations

1. **Input Validation**: Validate all user inputs
2. **SQL Injection**: Supabase handles this
3. **XSS Protection**: Next.js built-in protection
4. **Rate Limiting**: Implement per IP/user
5. **Password Hashing**: Use bcrypt for link passwords

### 14. Deployment Steps

```bash
# Build and run locally
docker-compose up --build

# Deploy Supabase Edge Functions
supabase functions deploy resolve-link

# Environment variables for production
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Quick Start Commands

```bash
# Clone and setup
git clone <your-repo>
cd shortlink-app
npm install

# Run development
npm run dev

# Build for production
npm run build
docker build -t shortlink-app .

# Run with Docker
docker-compose up
```

## API Documentation

### REST API Endpoints

#### Create Short Link
```
POST /api/links
Body: {
  targetUrl: string,
  password?: string,
  expiresAt?: string,
  maxClicks?: number
}
```

#### Get User Links
```
GET /api/links
Headers: { Authorization: "Bearer <token>" }
```

#### Get Link Analytics
```
GET /api/analytics/:linkId
Headers: { Authorization: "Bearer <token>" }
```

#### Resolve Short Link
```
GET /api/resolve?code=<shortCode>
```

## Troubleshooting

1. **Supabase Connection Issues**: Check environment variables
2. **RLS Policies**: Ensure policies match your use case
3. **Edge Function Errors**: Check Supabase logs
4. **Docker Issues**: Verify Node version compatibility

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Docker Documentation](https://docs.docker.com)

## License

MIT License - Feel free to use this for your projects!