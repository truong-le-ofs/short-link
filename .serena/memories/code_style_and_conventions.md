# Code Style and Conventions

## TypeScript Configuration
**Strict Mode**: Always enabled for both frontend and backend
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Backend Code Style (NestJS - Existing)
Based on analysis of `/app/be/` directory:

### Prettier Configuration
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

### NestJS Conventions
- **Decorators**: Use NestJS decorators (@Controller, @Get, @Injectable, etc.)
- **Dependency Injection**: Constructor-based injection
- **File Naming**: kebab-case for files (app.controller.ts, app.service.ts)
- **Class Naming**: PascalCase (AppController, AppService)
- **Method Naming**: camelCase

### Example NestJS Style
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

## Frontend Code Style (Planned - Next.js + TypeScript)

### File and Folder Naming
- **Pages**: kebab-case or camelCase for route files
- **Components**: PascalCase for component files (LinkForm.tsx, UserNav.tsx)
- **Utilities**: camelCase for utility files (utils.ts, constants.ts)
- **Types**: camelCase with .types.ts suffix or index.ts in types folder

### Component Structure
```typescript
// components/links/LinkForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types first
interface LinkFormProps {
  onSuccess?: (link: Link) => void;
}

// Schema definitions
const linkSchema = z.object({
  targetUrl: z.string().url('Please enter a valid URL'),
  customCode: z.string().optional(),
});

// Component export
export function LinkForm({ onSuccess }: LinkFormProps) {
  // Implementation
}
```

### Import Order
1. React and Next.js imports
2. Third-party library imports
3. Internal component imports
4. Utility and type imports
5. Relative imports

### Naming Conventions
- **Components**: PascalCase (LinkForm, UserNav, AnalyticsDashboard)
- **Hooks**: camelCase with 'use' prefix (useAuth, useLinks, useAnalytics)
- **Variables**: camelCase (targetUrl, shortCode, clickCount)
- **Constants**: UPPER_SNAKE_CASE (API_ENDPOINTS, DEFAULT_CONFIG)
- **Types/Interfaces**: PascalCase (Link, AnalyticsData, UserProfile)

### React/Next.js Patterns
- **'use client'**: Always at top of client components
- **Error Boundaries**: Wrap components that might fail
- **Loading States**: Always provide loading and error states
- **Type Safety**: Never use 'any', always type props and state

## Form Handling Standards
```typescript
// Always use react-hook-form with Zod validation
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: {
    // Always provide defaults
  }
});
```

## API Integration Patterns
```typescript
// Use React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: async () => {
    const response = await fetch(`/api/resource/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
});

// Use mutations for data modification
const mutation = useMutation({
  mutationFn: async (data) => {
    // mutation logic
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
  },
});
```

## Error Handling Conventions
- **Always handle errors**: Never let unhandled promises exist
- **User-friendly messages**: Convert technical errors to user-friendly messages
- **Loading states**: Show loading indicators for async operations
- **Fallback UI**: Provide fallback content for failed components

## CSS and Styling Conventions
- **Tailwind CSS**: Primary styling framework
- **shadcn/ui**: Component library for consistent UI
- **Mobile-first**: Start with mobile breakpoints, scale up
- **Semantic classes**: Use semantic class names when needed

## Security Best Practices
- **Input validation**: Always validate user inputs with Zod
- **Environment variables**: Never expose secrets in client code
- **SQL injection**: Use Supabase parameterized queries
- **XSS protection**: Trust Next.js built-in protection, validate inputs
- **CSRF protection**: Use Next.js built-in CSRF protection

## Testing Conventions
- **Unit tests**: Test components in isolation
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete user flows
- **Test file naming**: ComponentName.test.tsx
- **Mock external dependencies**: Mock APIs and external services

## Documentation Standards
- **JSDoc comments**: For public APIs and complex functions
- **README files**: For each major module
- **Type annotations**: Self-documenting code through types
- **Component props**: Document all component props with TypeScript