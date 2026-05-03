# 💰 FinTrack — Financial Tracking Application

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)

A full-stack personal finance tracking application with real-time dashboards, transaction management, multi-account support, and analytics charts.

---

## 📸 Features

- 🔐 **JWT Authentication** — Register, login, secure API
- 📊 **Live Dashboard** — Income vs Expenses charts, category breakdown, net savings
- 💳 **Transaction Management** — Full CRUD with filtering by type, category, account
- 🏦 **Multi-Account Support** — Cash, Bank, Credit Card, Savings, Investment
- 🗂️ **Smart Categories** — 12 default categories + custom user categories
- 📈 **Analytics** — 6-month trend charts, pie charts by category
- 🌍 **Multi-currency** — USD, EUR, GBP, PLN, JPY, CAD
- 🐳 **Docker Ready** — One command to run everything

---

## 🏗️ Architecture

```
fintrack/
├── backend/                  # Spring Boot (Java 17)
│   ├── src/main/java/com/fintrack/
│   │   ├── config/           # JWT, Security, CORS
│   │   ├── controller/       # REST API endpoints
│   │   ├── model/            # JPA Entities
│   │   ├── repository/       # Spring Data JPA
│   │   ├── service/          # Business logic
│   │   └── dto/              # Data Transfer Objects
│   └── Dockerfile
├── frontend/                 # React 18
│   ├── src/
│   │   ├── components/       # Layout, Sidebar
│   │   ├── context/          # Auth Context
│   │   ├── pages/            # Dashboard, Transactions, Accounts
│   │   └── services/         # Axios API layer
│   └── Dockerfile
├── docker/
│   └── init.sql              # PostgreSQL schema + seed data
└── docker-compose.yml
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Frontend | React 18, React Router 6, Recharts, Axios |
| Database | PostgreSQL 16 |
| Auth | JWT (JJWT 0.12) |
| Containerization | Docker, Docker Compose |
| Build | Maven 3.9, Node.js 20 |

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports `3000`, `8080`, `5432` must be free

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/fintrack.git
cd fintrack
```

### 2. Start everything with one command
```bash
docker-compose up --build
```

> First build takes ~3–5 minutes (downloads dependencies). Subsequent starts are instant.

### 3. Open the app
| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8080 |
| 🗄️ PostgreSQL | localhost:5432 |

### 4. Register and start tracking!
Go to http://localhost:3000/register and create your account.

---

## 🛠️ Local Development (Without Docker)

### Backend

**Requirements:** Java 17+, Maven 3.9+, PostgreSQL 16 running locally

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE fintrack;"
psql -U postgres -c "CREATE USER fintrack_user WITH PASSWORD 'fintrack_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintrack TO fintrack_user;"

# 2. Run the init script
psql -U fintrack_user -d fintrack -f docker/init.sql

# 3. Start the backend
cd backend
mvn spring-boot:run
```

Backend starts at: http://localhost:8080

### Frontend

**Requirements:** Node.js 18+, npm

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8080 npm start
```

Frontend starts at: http://localhost:3000

---

## 📡 REST API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated, filterable) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/dashboard` | Get dashboard summary |

**Query params for GET /api/transactions:**
```
?page=0&size=20&type=EXPENSE&categoryId=5&accountId=1
&startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
```

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List user accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/{id}` | Update account |
| DELETE | `/api/accounts/{id}` | Soft-delete account |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories (default + user) |
| POST | `/api/categories` | Create custom category |

### Request Examples

**Register:**
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "fullName": "John Doe",
  "currency": "USD"
}
```

**Create Transaction:**
```json
POST /api/transactions
Authorization: Bearer <token>

{
  "amount": 1500.00,
  "type": "INCOME",
  "description": "Monthly salary",
  "categoryId": 1,
  "accountId": 1,
  "transactionDate": "2024-01-15T09:00:00"
}
```

---

## 🗄️ Database Schema

```sql
users           -- User accounts
accounts        -- Financial accounts (bank, cash, etc.)
categories      -- Transaction categories (12 defaults + custom)
transactions    -- All financial operations
budgets         -- Budget limits per category
goals           -- Savings goals
```

---

## ⚙️ Environment Variables

### Backend (`docker-compose.yml` or `application.properties`)
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/fintrack
SPRING_DATASOURCE_USERNAME=fintrack_user
SPRING_DATASOURCE_PASSWORD=fintrack_pass
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=86400000
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:8080
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# Stop everything
docker-compose down

# Stop and remove volumes (wipes database!)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

---

## 🔒 Security

- Passwords hashed with **BCrypt**
- All API endpoints (except `/api/auth/**`) require valid **JWT Bearer token**
- JWT tokens expire after **24 hours**
- CORS configured for localhost development
- Database credentials isolated in environment variables

---

## 🚧 Roadmap

- [ ] Budget management UI
- [ ] Savings goals tracking
- [ ] Recurring transactions
- [ ] CSV/Excel export
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Dark/Light theme toggle

---

## 👨‍💻 Author

**Illia Semenov**  
GitHub: [@illiasemenov51-ui](https://github.com/illiasemenov51-ui)

---

## 📄 License

MIT License — feel free to use this project for learning or as a starting point for your own apps.
