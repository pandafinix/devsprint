# 🚀 DevSprint - Multi-Tenant Agile Project Management

A full-stack enterprise SaaS application for managing projects, teams, and tasks. Built with Spring Boot, React, TypeScript, and PostgreSQL.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🏢 Multi-Tenant Architecture
- Complete company-level data isolation
- Multiple companies can use the platform simultaneously
- Unique invite codes per company
- Optional email domain restrictions

### 👥 Role-Based Access Control (RBAC)
- **Master Admin** — Full control, manages company and projects
- **Admin** — Manages assigned projects and tasks
- **User** — Works on tasks in assigned project

### 📊 Project Management
- Create unlimited projects per company
- Auto-generated unique project codes
- Assign multiple admins per project
- 1 user per project (exclusive)
- Mark projects as completed (with validation)
- Pending changes pattern for bulk member management

### ✅ Task Management
- Kanban board (TODO / IN_PROGRESS / DONE)
- Priority levels (LOW / MEDIUM / HIGH)
- Real-time status updates
- Project-scoped task assignment

### 🔒 Security
- JWT-based authentication
- BCrypt password hashing (strength 12)
- Email case-insensitive (lowercase normalization)
- Stateless session management
- CORS configured
- Spring Security 6

### 🎨 Modern UI/UX
- Beautiful dark theme
- Responsive design
- Smooth animations
- Toast notifications
- Pending changes indicator
- Real-time stats and progress bars

## 🛠 Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.2.5**
- **Spring Security 6**
- **Spring Data JPA**
- **PostgreSQL 15+**
- **JWT (JJWT 0.12.5)**
- **Lombok**
- **Maven**

### Frontend
- **React 18**
- **TypeScript 5**
- **Vite 5**
- **Tailwind CSS 3**
- **React Router 6**
- **Axios**
- **Lucide React Icons**
- **React Hot Toast**

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Java 21+** ([Adoptium](https://adoptium.net))
- **Maven 3.8+**
- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- **PostgreSQL 15+** ([postgresql.org](https://www.postgresql.org/download))
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/pandafinix/devsprint.git
cd devsprint
```

### 2. Setup PostgreSQL Database

```bash
# Open psql
psql -U postgres

# Create database
CREATE DATABASE devsprint;
\q
```

### 3. Backend Setup

```bash
cd backend

# Update database credentials in application.properties
# OR set environment variables:
#   DB_URL=jdbc:postgresql://localhost:5432/devsprint
#   DB_USERNAME=postgres
#   DB_PASSWORD=yourpassword

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start on **http://localhost:8080**

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will start on **http://localhost:5173**

## 🎯 Usage Flow

### 1. Register Your Company
- Go to http://localhost:5173
- Click "Get Started Free"
- Fill company details
- You become the **Master Admin**
- Save your unique invite code

### 2. Set Domain Restriction (Optional)
- Go to Master Dashboard
- Set company domain (e.g., yourcompany.com)
- Now only users with @yourcompany.com emails can join

### 3. Invite Team Members
- Share invite code with team
- They sign up at /signup as Admin or User
- They appear in your dashboard

### 4. Create Projects
- Master Admin creates a project
- Select admins to manage it
- Select users to work on it

### 5. Create & Assign Tasks
- Admin opens their project
- Creates tasks with priority
- Assigns to users in that project

### 6. Users Work on Tasks
- Users see their personal Kanban board
- Move tasks: TODO → IN PROGRESS → DONE
- Real-time progress tracking

### 7. Complete Projects
- All tasks must be DONE
- Master Admin clicks "Complete"
- Team is freed for new projects

## 📁 Project Structure

```
devsprint/
├── backend/
│   ├── src/main/java/com/devsprint/
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Request/Response objects
│   │   ├── entity/          # JPA entities
│   │   ├── enums/           # Enums (Role, Status, etc.)
│   │   ├── exception/       # Global exception handling
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT + auth filters
│   │   └── service/         # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   ├── board/
    │   │   ├── master/
    │   │   ├── modals/
    │   │   └── ui/
    │   ├── context/         # AuthContext
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Route pages
    │   ├── services/        # API client
    │   ├── types/           # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register-company` - Register new company
- `POST /api/auth/signup` - Sign up with invite code
- `POST /api/auth/login` - Login
- `PUT /api/auth/profile` - Update profile (name only)
- `PUT /api/auth/change-password` - Change password

### Master Admin
- `GET /api/master/company` - Company info
- `PUT /api/master/company/name` - Update company name
- `PUT /api/master/company/domain` - Update domain
- `GET /api/master/admins` - List admins
- `GET /api/master/users` - List users
- `DELETE /api/master/users/{id}` - Remove user

### Projects
- `GET /api/projects` - All projects (role-based)
- `POST /api/projects` - Create project
- `POST /api/projects/{id}/users/{userId}` - Add user
- `DELETE /api/projects/{id}/users/{userId}` - Remove user
- `POST /api/projects/{id}/admins/{adminId}` - Add admin
- `DELETE /api/projects/{id}/admins/{adminId}` - Remove admin
- `POST /api/projects/{id}/complete` - Mark complete
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (role-based)
- `GET /api/tasks/project/{projectId}` - Tasks by project
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update status
- `DELETE /api/tasks/{id}` - Delete task

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Satyam Jha**

- 🐙 GitHub: [@pandafinix](https://github.com/pandafinix)
- 💼 LinkedIn: [Satyam Jha](https://www.linkedin.com/in/satyam-jha-7a5027302/)

Built with ❤️ as a full-stack portfolio project.

## 🙏 Acknowledgments

- Inspired by Jira, Linear, and Asana
- Built with modern web technologies
- Designed for real-world enterprise use cases

---

⭐ **If you find this project useful, please give it a star!**