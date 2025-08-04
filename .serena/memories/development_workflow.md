# Development Workflow and Guidelines

## Project Development Focus
- **Primary Development**: Frontend in `/app/fe/` directory
- **Reference/Research**: Backend in `/app/be/` for API service understanding
- **Documentation**: Complete SDLC documentation in `/app/docs/`
- **Timeline**: 6-hour rapid development cycle with production-ready quality

## Multi-Developer Coordination
The project is designed for parallel development by multiple developers:

### Phase-Based Development (6-hour timeline)
1. **Phase 1 (0.5h)**: Project Setup & Architecture - Lead Developer
2. **Phase 2 (0.5h)**: Core Architecture - Senior Frontend Developer  
3. **Phase 3 (0.5h)**: UI/UX Foundation - UI/UX Developer
4. **Phase 4 (0.5h)**: Authentication System - Auth Specialist
5. **Phase 5 (1.5h)**: Link Management Features - 3 developers in parallel
6. **Phase 6 (1h)**: Analytics Dashboard - 2 developers
7. **Phase 7 (0.5h)**: API Integration & Optimization - Full-Stack Developer
8. **Phase 8 (1h)**: Testing & Deployment - All developers

### Parallel Development Strategy
- **Developer A**: Link Creation & Form handling
- **Developer B**: Link Management Table & CRUD operations
- **Developer C**: Link Resolution & API endpoints
- **Developer D**: Analytics & Data Visualization

## Code Quality Standards

### Definition of Done (Per Component/Feature)
- [ ] Functionality working as specified
- [ ] TypeScript types properly defined
- [ ] Responsive design implemented
- [ ] Loading states included
- [ ] Error handling implemented
- [ ] Basic tests written
- [ ] Code reviewed by team member
- [ ] No console errors or warnings

### Definition of Done (Per Phase)
- [ ] All assigned tasks completed
- [ ] Integration with other components tested
- [ ] Performance requirements met
- [ ] Documentation updated
- [ ] Demo-ready for stakeholder review

## Task Completion Protocol
**Always run when completing any task:**

1. **Code Quality Checks**
   ```bash
   npm run lint        # ESLint validation
   npm run type-check  # TypeScript validation
   ```

2. **Testing**
   ```bash
   npm run test        # Unit tests
   npm run test:e2e    # End-to-end tests (when implemented)
   ```

3. **Build Verification**
   ```bash
   npm run build       # Ensure production build works
   ```

4. **Git Workflow**
   ```bash
   git add .
   git commit -m "feat: implement [feature description]"
   git push origin [branch-name]
   ```

## Security Guidelines
- **Never expose sensitive data**: Environment variables, API keys, passwords
- **Input validation**: Always validate user inputs with Zod schemas
- **Authentication**: Protect all dashboard routes with middleware
- **CORS policies**: Implement proper cross-origin policies
- **SQL injection prevention**: Use Supabase parameterized queries only

## Error Handling Standards
- **Loading States**: Always provide loading indicators for async operations
- **Error Boundaries**: Wrap components that might fail
- **User-friendly messages**: Convert technical errors to readable messages
- **Fallback UI**: Provide fallback content for failed states
- **Network resilience**: Handle offline scenarios gracefully

## Component Architecture Patterns

### React Component Structure
```typescript
'use client'; // When needed

// 1. Imports (ordered)
import { useState } from 'react';
import { external-libs } from 'external';
import { InternalComponent } from '@/components';
import { utils } from '@/lib/utils';

// 2. Types and schemas
interface ComponentProps {
  // Define props
}

const schema = z.object({
  // Validation schema
});

// 3. Component implementation
export function ComponentName({ props }: ComponentProps) {
  // Implementation
}
```

### API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
  // Authentication check
  // Data fetching
  // Error handling
  // Response
}

export async function POST(request: NextRequest) {
  // Input validation
  // Authentication check
  // Data processing
  // Response
}
```

## Testing Strategy
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interactions
- **E2E Tests**: Complete user workflows
- **API Tests**: All API endpoints
- **Performance Tests**: Loading times and responsiveness

## Performance Requirements
- **First Contentful Paint**: < 2 seconds
- **Link Resolution**: < 100ms
- **Mobile Performance**: Optimized for mobile devices
- **Bundle Size**: Minimize with code splitting
- **Accessibility**: WCAG 2.1 AA compliance

## Risk Mitigation Strategies

### Common Pitfalls & Solutions
- **Dependency Conflicts**: Lock versions in package.json
- **Type Mismatches**: Share type definitions early across team
- **Styling Conflicts**: Use consistent Tailwind patterns
- **API Integration Issues**: Test endpoints before UI integration
- **Real-time Features**: Test Supabase subscriptions thoroughly

### Fallback Plans
- **Real-time failures**: Use polling as backup
- **Advanced analytics delays**: Focus on basic metrics first
- **Custom themes delays**: Use default shadcn theme
- **Testing delays**: Prioritize critical path testing

## Communication Protocols
- **Daily Standups**: Share progress and blockers
- **Component Interfaces**: Share early to avoid integration issues
- **Code Reviews**: Mandatory for all features
- **Documentation**: Update as you develop

## Deployment Workflow
1. **Local Testing**: Verify all features work locally
2. **Build Verification**: Ensure production build succeeds
3. **Environment Setup**: Configure production environment variables
4. **Deployment**: Deploy using Docker Compose with proper configuration
5. **Post-deployment Testing**: Verify all features in production
6. **Monitoring**: Set up error monitoring and analytics

## Continuous Integration Tasks
### Code Standards (All Developers)
- Follow TypeScript strict mode
- Use consistent naming conventions
- Implement proper error handling
- Add loading states to all async operations

### Version Control Standards
- Create feature branches for each phase
- Use descriptive commit messages (conventional commits)
- Regular merges to avoid conflicts
- Tag releases appropriately

## Success Metrics
- **Timeline Adherence**: Complete in 6-hour window
- **Code Quality**: Pass all linting and type checks
- **Test Coverage**: > 80% coverage on critical paths
- **Performance**: Meet all performance requirements
- **Functionality**: All features working end-to-end
- **Production Ready**: Successfully deployed and accessible