# Docker Setup for ShortLink API

## 🚀 Cách chạy với Docker

### 1. Development (Local)
```bash
# Chạy ứng dụng trong development mode
npm run start:shortlink:dev

# Hoặc build và chạy production locally
npm run build:shortlink
npm run start:prod
```

### 2. Docker Build & Run

#### Build Docker image
```bash
# Build image
npm run docker:build
# Hoặc
docker build -t shortlink-api .

# Run container
npm run docker:run
# Hoặc
docker run -p 4000:4000 shortlink-api
```

#### Docker Compose (Recommended)
```bash
# Start all services (PostgreSQL + API)
npm run docker:up
# Hoặc
docker-compose up -d

# View logs
npm run docker:logs
# Hoặc
docker-compose logs -f shortlink-api

# Stop all services
npm run docker:down
# Hoặc
docker-compose down
```

### 3. Environment Variables

Copy và chỉnh sửa file environment:
```bash
cp .env.example .env
```

### 4. Database Migration

Migration sẽ tự động chạy khi container start. Nếu cần chạy manual:
```bash
# Vào container
docker exec -it shortlink-api sh

# Chạy migration
npm run migration:up
```

### 5. Access Points

- **API**: http://localhost:4000
- **Swagger UI**: http://localhost:4000/swagger
- **Swagger JSON**: http://localhost:4000/swagger/api-json
- **PostgreSQL**: localhost:5432

### 6. Health Check

```bash
# Check container health
docker ps

# Check application health
curl http://localhost:4000/swagger
```

## 🔧 Troubleshooting

### Container logs
```bash
docker-compose logs shortlink-api
```

### Rebuild after code changes
```bash
docker-compose down
docker-compose up --build -d
```

### Clean up
```bash
# Remove containers and volumes
docker-compose down -v

# Remove images
docker rmi shortlink-api
```

## 📝 Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   ShortLink     │
│   (Port: 3000)  │    │   API           │
└─────────────────┘    │   (Port: 4000)  │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   (Port: 5432)  │
                       └─────────────────┘
```

## 🚀 Production Deployment

Đối với production, cần:
1. Thay đổi JWT_SECRET
2. Sử dụng external database
3. Setup reverse proxy (nginx)
4. Enable HTTPS
5. Configure proper logging