# URL Shortener Project Overview

## Project Purpose
This is a full-featured URL shortener platform with advanced analytics, user management, and real-time features. The project is designed to be built within a 6-hour development timeline with production-ready code quality.

## Architecture Overview
- **Frontend**: Next.js 14 + TypeScript + Supabase + Docker Compose
- **Backend**: NestJS + TypeScript (for API research/service)
- **Database**: Supabase (PostgreSQL with auth, realtime, edge functions)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Analytics**: Supabase Database + Recharts for visualization
- **Deployment**: Docker Compose (Frontend + Production) + Supabase Cloud (Backend)

## Project Structure
```
/app/
├── fe/                          # Frontend directory (main focus)
│   ├── .claude/                 # Claude configuration
│   ├── MULTI_DEV_CHECKLIST.md  # Multi-developer coordination guide
│   └── FRONTEND_DEVELOPMENT_PLAN.md # Detailed frontend implementation plan
├── be/                          # Backend directory (research/API service)
│   ├── src/                     # NestJS source code
│   ├── test/                    # Test files
│   ├── package.json             # Backend dependencies and scripts
│   └── README.md                # NestJS documentation
├── docs/                        # Complete SDLC documentation
│   ├── 01-Project-Proposal.md
│   ├── 02-BRD-Business-Requirements.md
│   ├── 03-PRD-Product-Requirements.md
│   ├── 04-FRD-Functional-Requirements.md
│   ├── 05-SRS-Software-Requirements.md
│   ├── 06-HLD-High-Level-Design.md
│   ├── 07-LLD-Low-Level-Design.md
│   ├── 08-Test-Plan.md
│   ├── 09-Security-Review.md
│   └── 10-SDLC-Document-Index.md
└── url-shortener-plan.md        # High-level implementation plan
```

## Core Features
1. **User Authentication** - Registration, login, protected routes
2. **Link Management** - Create, edit, delete, manage short links
3. **Advanced Link Options**:
   - Custom short codes
   - Password protection with time limits
   - Expiration dates
   - Maximum click limits
   - Scheduled URL changes
4. **Analytics & Tracking**:
   - Real-time click tracking
   - Device and browser detection
   - Geographic tracking
   - Data visualization with charts
5. **Real-time Updates** - Using Supabase subscriptions
6. **Responsive Web Interface** - Mobile-first design
7. **API Endpoints** - RESTful API for all operations
8. **Docker Deployment** - Production-ready containerization

## Development Focus
- **Primary Focus**: Frontend development in `/app/fe/`
- **Secondary**: Backend in `/app/be/` is for research and API service understanding
- **Documentation**: Comprehensive SDLC docs in `/app/docs/`
- **Timeline**: 6-hour rapid development cycle
- **Quality**: Production-ready code with TypeScript strict mode