# Development Commands

## Frontend Commands (To be implemented)
Since the frontend is not yet set up, these are the planned commands based on Next.js and the project requirements:

```bash
# Project setup (to be run once)
npx create-next-app@latest shortlink-app --typescript --tailwind --app
cd shortlink-app
npm install [dependencies as listed in tech stack]

# Development commands
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Testing commands (to be implemented)
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests

# Utility commands
npm run format       # Format code with Prettier
npm run analyze      # Analyze bundle size
```

## Backend Commands (Existing - NestJS)
Located in `/app/be/package.json`:

```bash
# Development
npm run start        # Start application
npm run start:dev    # Start in development mode with watch
npm run start:debug  # Start in debug mode with watch
npm run start:prod   # Start in production mode

# Build
npm run build        # Build the application

# Code Quality
npm run format       # Format code with Prettier
npm run lint         # Run ESLint with auto-fix

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:debug   # Run tests in debug mode
npm run test:e2e     # Run end-to-end tests
```

## Task Completion Commands
Based on the project requirements, these commands should be run when completing tasks:

### Frontend Task Completion (Planned)
```bash
# 1. Run linting
npm run lint

# 2. Run type checking
npm run type-check

# 3. Run tests
npm run test

# 4. Build for production (to verify build works)
npm run build

# 5. Check bundle size
npm run analyze
```

### Backend Task Completion (Existing)
```bash
# 1. Run linting and formatting
npm run lint
npm run format

# 2. Run tests
npm run test
npm run test:e2e

# 3. Build application
npm run build
```

## Docker Commands
For containerized development and deployment:

```bash
# Development with Docker Compose
docker-compose up --build    # Build and start all services
docker-compose up -d         # Start in detached mode
docker-compose down          # Stop all services
docker-compose logs -f       # Follow logs

# Production Docker
docker build -t shortlink-app .  # Build production image
docker run -p 3000:3000 shortlink-app  # Run production container
```

## Git Workflow Commands
```bash
# Feature development
git checkout -b feature/feature-name
git add .
git commit -m "feat: implement feature description"
git push origin feature/feature-name

# Code review and merge
git checkout main
git pull origin main
git merge feature/feature-name
git push origin main
git tag v1.0.0  # Tag releases
```

## Supabase Commands
For database and backend services:

```bash
# Local development
supabase start                    # Start local Supabase stack
supabase stop                     # Stop local Supabase stack
supabase db reset                 # Reset local database

# Database migrations
supabase db diff                  # Generate migration
supabase db push                  # Push schema changes

# Edge Functions
supabase functions deploy resolve-link  # Deploy edge function
supabase functions logs resolve-link    # View function logs
```

## System Commands (Linux)
Essential system commands for the development environment:

```bash
# File operations
ls -la                    # List files with details
find . -name "*.ts"       # Find TypeScript files
grep -r "pattern" .       # Search for patterns
cd /path/to/directory     # Change directory

# Process management
ps aux | grep node        # Find Node.js processes
kill -9 PID              # Kill process by PID
lsof -i :3000            # Check what's running on port 3000

# Git operations
git status               # Check git status
git log --oneline        # View commit history
git diff                 # Show changes
```