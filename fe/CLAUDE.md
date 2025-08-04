# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Docker Commands:**
```bash
npm run docker:build    # Build Docker image
npm run docker:run      # Run container with .env.local
npm run docker:up       # Development with docker-compose
npm run docker:prod     # Production deployment
```

## Architecture Overview

### **Authentication System (No External Services)**
- **AuthProvider** (`src/contexts/auth-context.tsx`): Complete JWT-based authentication
- **API Integration**: Direct fetch calls to backend API (configurable via `NEXT_PUBLIC_API_URL`)
- **Token Management**: Local storage with automatic refresh and validation
- **Protected Routes**: Handled via React Context, not middleware
- **Auth Components**: `login-form.tsx`, `register-form.tsx`, `protected-route.tsx`

### **Backend Communication**
- **No Supabase**: Uses direct API calls to backend (local or ngrok)
- **API Base URL**: `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Centralized in auth context with toast notifications

### **Type System & Validation**
- **Core Types** (`src/types/index.ts`): User, Link, LinkClick, AnalyticsData
- **Zod Schemas** (`src/lib/validations.ts`): Runtime validation for all forms
- **Form Handling**: react-hook-form with @hookform/resolvers/zod integration
- **Type Safety**: Strict TypeScript mode with comprehensive type definitions

### **UI Architecture**
- **Design System**: shadcn/ui components with custom theme provider
- **Layout Structure**: Header with MainNav and UserNav in root layout
- **Theme System**: next-themes with dark/light/system modes
- **Responsive Design**: Mobile-first Tailwind CSS patterns
- **Loading States**: Custom skeleton components for all UI states

### **App Router Structure**
```
app/
├── (auth)/              # Route group for auth pages (no header)
│   ├── login/page.tsx
│   └── register/page.tsx
├── [code]/              # Dynamic route for link resolution
├── dashboard/page.tsx   # Main dashboard
├── links/               # Link management
├── analytics/           # Analytics dashboard
└── api/                 # API routes (health check)
```

### **Component Organization**
- **Layout**: `components/layout/` - Header, MainNav, UserNav
- **Auth**: `components/auth/` - Forms and protected route wrapper
- **UI**: `components/ui/` - shadcn/ui components
- **Forms**: `components/forms/` - Reusable form components
- **Loading**: Custom skeleton components for different UI sections

### **State Management**
- **Authentication**: React Context with AuthProvider
- **Data Fetching**: @tanstack/react-query (configured but ready for use)
- **Form State**: react-hook-form with Zod validation
- **Theme State**: next-themes provider

## Key Implementation Details

### **Environment Variables**
- `NEXT_PUBLIC_API_URL`: Backend API base URL (required)
- `NEXT_PUBLIC_APP_URL`: Frontend URL for production
- `NEXT_PUBLIC_SHORT_URL_BASE`: Base URL for generated short links
- `AUTH_SECRET` & `JWT_SECRET`: For backend authentication

### **Error Handling Strategy**
- **ErrorBoundary**: React class component with development error details
- **Toast Notifications**: Sonner integration with theme-aware styling
- **API Errors**: Centralized handling in auth context
- **Form Validation**: Real-time Zod validation with user-friendly messages

### **Development Workflow**
The project follows a multi-phase development approach tracked in `MULTI_DEV_CHECKLIST.md`:
- **Phase 1-4**: Completed (Setup, Architecture, UI Foundation, Authentication)
- **Phase 5**: Link Management (in progress)
- **Phase 6-8**: Analytics, Optimization, Testing

### **Key Patterns**
- **Custom Hooks**: `useAuth()`, `useToast()`, `useAuthRedirect()`
- **Protected Routes**: Use `<ProtectedRoute>` wrapper component
- **Form Components**: Use `FormField` with built-in validation display
- **Loading States**: Import specific skeletons from `loading-skeleton.tsx`
- **API Calls**: Use the `apiCall` helper from auth context for consistency

### **Code Style**
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Consistent component naming (PascalCase)
- Custom hooks prefixed with 'use'
- API routes follow RESTful conventions

### **Testing & Deployment**
- Docker Compose setup for both development and production
- nginx reverse proxy configuration included
- Jest and React Testing Library configured for unit tests
- Build process validates TypeScript and runs linting

## Team Coordination Guidelines

### Communication Protocols

**Daily Standup Process:**
- **Format**: Brief 15-minute sessions
- **Structure**: What did you complete? What are you working on? Any blockers?
- **Focus Areas**: Interface changes, shared utility updates, dependency conflicts
- **Documentation**: Log major decisions and interface changes in CLAUDE.md

**Component Interface Sharing:**
- **Early Sharing**: Document all component props and interfaces in `src/types/index.ts`
- **Interface Changes**: Announce changes in team chat before implementation
- **Breaking Changes**: Create migration guides for existing components
- **Type Safety**: Always export TypeScript interfaces for reusable components

**Shared Utilities Coordination:**
- **Core Utils**: All shared functions go in `src/lib/utils.ts`
- **API Utils**: API-related utilities in `src/lib/api.ts` and `src/lib/api-middleware.ts`
- **Validation**: Shared Zod schemas in `src/lib/validations.ts`
- **Constants**: Global constants in `src/lib/constants.ts`
- **Testing**: Add tests for all shared utilities in `src/lib/__tests__/`

**Code Review Process:**
- **Review Requirements**: All code requires review before merging to main
- **Focus Areas**: TypeScript compliance, security, performance, accessibility
- **Tools**: Use GitHub PR reviews with required checks
- **Standards**: Follow the established patterns in existing components

### Version Control Strategy

**Branch Strategy:**
```bash
main                    # Production-ready code
├── phase-1-setup      # Project setup and architecture
├── phase-2-auth       # Authentication system
├── phase-3-links      # Link management features
├── phase-4-analytics  # Analytics dashboard
├── phase-5-testing    # Testing and deployment
└── hotfix/*           # Critical fixes
```

**Commit Message Guidelines:**
```
type(scope): brief description

Examples:
feat(auth): add JWT token refresh mechanism
fix(links): resolve link deletion confirmation dialog
refactor(ui): optimize table component performance
test(analytics): add unit tests for chart components
docs(readme): update deployment instructions
```

**Merge Strategy:**
- **Feature Branches**: Create from main, merge back via PR
- **Regular Syncing**: Pull main daily to avoid conflicts
- **Conflict Resolution**: Coordinate with team before resolving complex conflicts
- **Code Freeze**: No direct pushes to main, all changes via PR

**Release Tagging:**
```bash
v1.0.0        # Major release - Full feature set
v1.1.0        # Minor release - New features
v1.1.1        # Patch release - Bug fixes
v1.0.0-beta.1 # Pre-release versions
```

### Development Workflow

**Phase-Based Development:**
1. **Setup Phase**: Environment, architecture, and tooling
2. **Auth Phase**: Authentication system and protected routes
3. **Core Phase**: Link management and CRUD operations
4. **Analytics Phase**: Dashboard and data visualization
5. **Polish Phase**: Testing, optimization, and deployment

**Quality Gates:**
- TypeScript strict mode compliance
- ESLint warnings resolved
- Unit tests for critical paths
- Responsive design verification
- Accessibility compliance check

**Deployment Coordination:**
- **Staging**: Deploy feature branches to staging environment
- **Production**: Deploy only from main branch
- **Rollback**: Keep previous version tagged for quick rollback
- **Monitoring**: Monitor performance and error logs post-deployment