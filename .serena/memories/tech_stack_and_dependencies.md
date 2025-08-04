# Tech Stack and Dependencies

## Frontend Stack (Primary Development)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database & Auth**: Supabase
- **State Management**: @tanstack/react-query
- **Form Handling**: react-hook-form + @hookform/resolvers/zod
- **Validation**: Zod schemas
- **Charts**: Recharts
- **Icons**: Lucide React
- **Utilities**: nanoid, date-fns, ua-parser-js

## Frontend Dependencies (Planned)
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers/zod zod
npm install nanoid date-fns ua-parser-js
npm install recharts lucide-react

# UI Framework
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label table tabs toast
npx shadcn-ui@latest add dropdown-menu dialog sheet skeleton
```

## Backend Stack (Research/API Service)
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Runtime**: Node.js
- **Testing**: Jest with coverage
- **Linting**: ESLint 9.18.0
- **Formatting**: Prettier 3.4.2

## Backend Dependencies (Existing)
### Core Dependencies
- @nestjs/common: ^11.0.1
- @nestjs/core: ^11.0.1
- @nestjs/platform-express: ^11.0.1
- reflect-metadata: ^0.2.2
- rxjs: ^7.8.1

### Development Dependencies
- @nestjs/cli: ^11.0.0
- @nestjs/testing: ^11.0.1
- TypeScript: ^5.7.3
- Jest: ^30.0.0
- ESLint: ^9.18.0
- Prettier: ^3.4.2

## Database & External Services
- **Primary Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Edge Functions**: Supabase Edge Functions (Deno)
- **File Storage**: Supabase Storage (if needed)

## Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Deployment**: Docker Compose (Frontend), Supabase Cloud (Backend)
- **Containerization**: Docker + Docker Compose
- **IDE Integration**: VS Code with TypeScript support

## Environment Configuration
```env
# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach