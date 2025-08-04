# High-Level Design (HLD)
## URL Shortener Platform

### Document Information
- **Version**: 1.0
- **Date**: 2025-01-04
- **Author**: Architecture Team
- **Status**: Approved

## 1. System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  Nginx/Docker   │◄──►│   Next.js App   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────►│  Edge Functions │◄────────────┘
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Supabase      │
                        │   - PostgreSQL  │
                        │   - Auth        │
                        │   - Realtime    │
                        └─────────────────┘
```

## 2. Component Architecture

### 2.1 Frontend Components
```
Next.js Application
├── App Router
│   ├── (auth) - Authentication pages
│   ├── (dashboard) - Protected user area
│   ├── [code] - Link resolution
│   └── api/ - API routes
├── Components
│   ├── ui/ - Reusable UI components
│   ├── auth/ - Authentication forms
│   ├── links/ - Link management
│   └── analytics/ - Data visualization
└── Libraries
    ├── Supabase client
    ├── React Query
    └── Recharts
```

### 2.2 Backend Services
```
Supabase Platform
├── PostgreSQL Database
│   ├── Users table (auth.users)
│   ├── Links table
│   ├── Analytics table
│   └── Schedules table
├── Authentication Service
│   ├── JWT token management
│   ├── Email verification
│   └── Password reset
├── Edge Functions
│   ├── Link resolution
│   ├── Analytics tracking
│   └── Webhooks
└── Real-time Service
    ├── Live analytics
    └── User notifications
```

## 3. Data Flow Architecture

### 3.1 Link Creation Flow
```
User Input → Form Validation → API Call → Database Insert → Response
     ↓
Generate Short Code → Check Uniqueness → Store Mapping
```

### 3.2 Link Resolution Flow
```
Short URL Request → Edge Function → Database Query → Validation
     ↓
Password Check → Schedule Check → Analytics Tracking → Redirect
```

### 3.3 Analytics Flow
```
Click Event → Data Collection → IP Resolution → Device Detection
     ↓
Database Insert → Real-time Update → Dashboard Refresh
```

## 4. Module Design

### 4.1 Authentication Module
- **Purpose**: User registration, login, session management
- **Components**:
  - Registration form with email verification
  - Login form with JWT token generation
  - Password reset functionality
  - Session middleware for protected routes

### 4.2 Link Management Module
- **Purpose**: CRUD operations for short links
- **Components**:
  - Link creation with options
  - Link editing and deactivation
  - Bulk operations interface
  - URL validation and safety checks

### 4.3 Analytics Module
- **Purpose**: Track and analyze link performance
- **Components**:
  - Click tracking middleware
  - Data aggregation services
  - Real-time dashboard updates
  - Export functionality

### 4.4 API Module
- **Purpose**: Programmatic access to platform features
- **Components**:
  - RESTful endpoint handlers
  - API key authentication
  - Rate limiting middleware
  - Response formatting

## 5. Database Design

### 5.1 Core Tables
```sql
-- Users (handled by Supabase Auth)
auth.users (id, email, created_at, ...)

-- Links
links (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  short_code TEXT UNIQUE,
  target_url TEXT,
  password TEXT,
  expires_at TIMESTAMP,
  is_active BOOLEAN,
  created_at TIMESTAMP
)

-- Analytics
analytics (
  id UUID PRIMARY KEY,
  link_id UUID REFERENCES links(id),
  ip TEXT,
  user_agent TEXT,
  country TEXT,
  device TEXT,
  clicked_at TIMESTAMP
)

-- Schedules
schedules (
  id UUID PRIMARY KEY,
  link_id UUID REFERENCES links(id),
  target_url TEXT,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP
)
```

### 5.2 Indexes and Performance
- Primary indexes on id columns
- Unique index on short_code
- Composite indexes for analytics queries
- Partitioning for large analytics tables

## 6. Security Architecture

### 6.1 Authentication & Authorization
- JWT tokens for session management
- Row Level Security (RLS) policies
- API key authentication for external access
- Multi-factor authentication (future)

### 6.2 Data Protection
- HTTPS/TLS encryption in transit
- AES-256 encryption at rest
- Input validation and sanitization
- SQL injection prevention via ORM

### 6.3 Access Control
- User-based link ownership
- Role-based permissions (admin, user)
- Rate limiting per user/IP
- CORS policy configuration

## 7. Performance Design

### 7.1 Caching Strategy
- CDN caching for static assets
- Database query result caching
- Redis for session storage (future)
- Browser caching headers

### 7.2 Optimization Techniques
- Database connection pooling
- Lazy loading for dashboard components
- Image optimization with Next.js
- Code splitting and tree shaking

### 7.3 Scalability Considerations
- Horizontal scaling via Docker Compose
- Database read replicas
- Edge function auto-scaling
- Load balancing

## 8. Integration Design

### 8.1 Third-party Services
- Geolocation API for IP resolution
- Email service via Supabase Auth
- Analytics services (future)
- Payment processing (future)

### 8.2 API Integration
- Webhook endpoints for events
- External API consumption
- Rate limiting and retry logic
- Error handling and logging

## 9. Deployment Architecture

### 9.1 Environment Structure
```
Development → Staging → Production
     ↓           ↓         ↓
Local Docker → Preview → Live
```

### 9.2 CI/CD Pipeline
- GitHub Actions for automation
- Automated testing on PR
- Preview deployments
- Production deployment approval

### 9.3 Monitoring & Logging
- Application monitoring and analytics
- Supabase logging for backend
- Error tracking with Sentry (future)
- Uptime monitoring

## 10. Technology Stack

### 10.1 Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query + Context API
- **Deployment**: Docker Compose

### 10.2 Backend Stack
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Functions**: Supabase Edge Functions
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage

### 10.3 Development Stack
- **Version Control**: Git + GitHub
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest + Cypress
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

---
*This HLD provides the architectural foundation for detailed design and implementation.*