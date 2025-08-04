#!/bin/bash

# E2E Testing Script for URL Shortener
# This script runs the complete e2e test suite

set -e

echo "🎭 Starting E2E Testing Suite"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the fe/ directory."
    exit 1
fi

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm."
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🌐 Installing Playwright browsers..."
npx playwright install

echo "🏗️  Starting Next.js development server..."
# Check if server is already running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Development server already running on port 3000"
else
    echo "🚀 Starting development server..."
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Server failed to start within 30 seconds"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
    done
fi

echo "🧪 Running E2E tests..."

# Parse command line arguments
TEST_TYPE="all"
BROWSER="chromium"
HEADED=false
DEBUG=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --smoke)
            TEST_TYPE="smoke"
            shift
            ;;
        --auth)
            TEST_TYPE="auth"
            shift
            ;;
        --links)
            TEST_TYPE="links"
            shift
            ;;
        --analytics)
            TEST_TYPE="analytics"
            shift
            ;;
        --browser=*)
            BROWSER="${1#*=}"
            shift
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --smoke      Run only smoke tests"
            echo "  --auth       Run only authentication tests"
            echo "  --links      Run only link management tests"
            echo "  --analytics  Run only analytics tests"
            echo "  --browser=X  Run tests on specific browser (chromium, firefox, webkit)"
            echo "  --headed     Run tests in headed mode (visible browser)"
            echo "  --debug      Run tests in debug mode"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build test command
CMD="npx playwright test"

if [ "$TEST_TYPE" != "all" ]; then
    CMD="$CMD $TEST_TYPE.spec.ts"
fi

if [ "$BROWSER" != "chromium" ]; then
    CMD="$CMD --project=$BROWSER"
fi

if [ "$HEADED" = true ]; then
    CMD="$CMD --headed"
fi

if [ "$DEBUG" = true ]; then
    CMD="$CMD --debug"
fi

echo "🏃 Running: $CMD"
$CMD

TEST_EXIT_CODE=$?

# Clean up
if [ ! -z "$SERVER_PID" ]; then
    echo "🧹 Stopping development server..."
    kill $SERVER_PID 2>/dev/null || true
fi

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "📊 View test report: npm run test:e2e:report"
else
    echo "❌ Some tests failed!"
    echo "📊 View test report: npm run test:e2e:report"
    echo "🔍 Debug failed tests: npm run test:e2e:debug"
fi

exit $TEST_EXIT_CODE