# Suggested Commands for URL Shortener Development

## Essential Daily Commands

### Frontend Development (Primary Focus)
```bash
# Project initialization (run once)
npx create-next-app@latest shortlink-app --typescript --tailwind --app
cd shortlink-app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @tanstack/react-query react-hook-form @hookform/resolvers/zod zod nanoid date-fns ua-parser-js recharts lucide-react

# Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label table tabs toast dropdown-menu dialog sheet skeleton

# Development workflow
npm run dev              # Start development server (most used)
npm run build           # Build for production testing
npm run lint            # Check code quality
npm run type-check      # Verify TypeScript
```

### Backend Reference Commands (NestJS - for API understanding)
```bash
cd be/
npm run start:dev       # Start backend in development mode
npm run test           # Run unit tests
npm run lint           # Lint backend code
npm run build          # Build backend
```

## Task Completion Workflow
**Run these commands when completing any task:**

```bash
# 1. Code quality checks
npm run lint
npm run type-check

# 2. Build verification
npm run build

# 3. Test execution
npm run test

# 4. Git workflow
git add .
git commit -m "feat: describe what was implemented"
```

## Quick Development Setup
```bash
# Navigate to workspace
cd /app/fe

# If starting fresh frontend
npx create-next-app@latest . --typescript --tailwind --app

# Daily development
npm run dev             # Always start with this
```

## File Operations (Linux System)
```bash
# Navigation
ls -la                  # List files and directories
cd /app/fe             # Navigate to frontend
cd /app/be             # Navigate to backend
cd /app/docs           # Navigate to documentation

# File search
find . -name "*.tsx"    # Find React components
find . -name "package.json"  # Find package configurations
grep -r "useState" .    # Search for React hooks usage

# File creation
mkdir -p components/auth   # Create directory structure
touch components/LoginForm.tsx  # Create new component file
```

## Docker Development
```bash
# Local development with Docker
docker-compose up --build    # Build and start all services
docker-compose logs -f       # View logs
docker-compose down          # Stop services

# Production deployment
docker build -t shortlink-app .
docker run -p 3000:3000 shortlink-app
```

## Supabase Integration
```bash
# Local Supabase development
supabase start           # Start local Supabase stack
supabase db reset        # Reset database to clean state
supabase functions deploy resolve-link  # Deploy edge functions

# Database operations
supabase db diff         # Check database changes
supabase db push         # Apply schema changes
```

## Debugging and Monitoring
```bash
# Process monitoring
ps aux | grep node       # Check Node.js processes
lsof -i :3000           # Check what's using port 3000
kill -9 [PID]           # Kill specific process

# Log monitoring  
tail -f ~/.npm/_logs/*   # Monitor npm logs
docker-compose logs -f app  # Monitor container logs
```

## Git Workflow Commands
```bash
# Feature development
git status              # Check current status
git checkout -b feature/[name]  # Create feature branch
git add .               # Stage changes
git commit -m "feat: [description]"  # Commit with semantic message
git push origin feature/[name]  # Push to remote

# Code review and integration
git checkout main       # Switch to main branch
git pull origin main    # Get latest changes
git merge feature/[name]  # Merge feature
git tag v1.0.0         # Tag releases
```

## Performance and Quality Checks
```bash
# Bundle analysis (when implemented)
npm run analyze         # Analyze bundle size
npm run test:coverage   # Check test coverage

# Performance testing
npm run build && npm run start  # Test production build
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000  # Basic performance test
```

## Troubleshooting Commands
```bash
# Clean reset
rm -rf node_modules package-lock.json  # Remove dependencies
npm install             # Reinstall dependencies

# Port conflicts
sudo lsof -ti:3000 | xargs kill -9  # Kill processes on port 3000

# Cache clearing
npm cache clean --force  # Clear npm cache
```

## System Utilities
```bash
# System information
node --version          # Check Node.js version
npm --version          # Check npm version
docker --version       # Check Docker version

# File permissions (if needed)
chmod +x script.sh     # Make script executable
chown -R $USER:$USER . # Fix ownership issues
```

## Most Frequently Used Commands
1. `cd /app/fe && npm run dev` - Start development
2. `npm run build` - Test production build
3. `git add . && git commit -m "message"` - Save changes
4. `npm run lint` - Check code quality
5. `ls -la` - Check directory contents