# InternshipHub

> A modern, multi-role SaaS platform connecting students with internship opportunities and helping companies discover top talent.

[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the App](#running-the-app)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**InternshipHub** is a full-stack internship management platform built as a decoupled SaaS application. It supports three distinct user roles — **Students**, **Companies**, and **Admins** — each with a tailored experience.

Students can browse and apply for internships, track their applications, save listings, and engage in a community feed. Companies can post and manage listings, review applicants, and update their profiles. The entire frontend is powered by a RESTful Laravel API with token-based authentication via Laravel Sanctum.

---

## Features

### 👨‍🎓 Student
- Browse and filter internship listings by location, type (remote/hybrid/on-site), and skills
- Apply to internships and track application status (pending → accepted/rejected)
- Save favourite listings for later
- Build a professional profile (bio, university, CV upload, skills, LinkedIn/GitHub)
- Participate in the community feed: post updates, comment, and like posts
- Receive in-app notifications when someone comments on their post

### 🏢 Company
- Post, edit, and delete internship listings with skills tagging
- View all applicants per listing and accept or reject with one click
- Manage company profile (name, description, website, avatar)
- Participate in the community feed
- Receive in-app notifications on community interactions

### 🔔 Notifications
- Real-time-like bell icon with unread count badge
- Dropdown panel with per-notification read/unread state
- "Mark all as read" in one click
- Notifications are stored in the database (no external queue required)

### 🌐 Community Feed
- Shared feed visible to both students and companies
- Create, edit, and delete posts
- Comment threads per post
- Like / unlike posts
- Polymorphic authorship (posts and comments from any role type)

### 🔐 Authentication
- Email/password registration and login
- Role-based access control (student, company, admin)
- Forgot password flow with email reset link
- Laravel Sanctum token authentication

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Laravel 13 (PHP 8.3+) |
| **Authentication** | Laravel Sanctum (SPA token auth) |
| **Database** | MySQL (production) / SQLite (local dev) |
| **Frontend Framework** | React 19 (Vite 8) |
| **Styling** | Tailwind CSS v4 + Vanilla CSS |
| **HTTP Client** | Axios |
| **Routing** | React Router v7 |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **i18n** | i18next + react-i18next |
| **Faker / Seeding** | FakerPHP |
| **Dev Server** | Vite (`npm run dev`) |
| **API Format** | JSON REST (Laravel API Resources) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              React SPA (Vite + Tailwind)                │
│   Context API ─── React Router ─── Axios HTTP Client    │
└───────────────────────┬─────────────────────────────────┘
                        │  REST API (JSON)
                        │  /api/*  — Bearer token
┌───────────────────────▼─────────────────────────────────┐
│               Laravel 13 (API-only mode)                │
│  Routes → Form Requests → Controllers → API Resources   │
│              Laravel Sanctum (auth)                     │
│           Laravel Notifications (database)              │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                 MySQL / SQLite Database                  │
│     Eloquent ORM — Migrations — Factories — Seeders     │
└─────────────────────────────────────────────────────────┘
```

The frontend and backend are **completely decoupled**. The React app communicates exclusively through the REST API — no Blade templates, no server-side rendering.

---

## Project Structure

```
internship-platform/
├── backend/                         # Laravel 13 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/     # All API controllers
│   │   │   └── Requests/            # Form Request validators
│   │   ├── Models/                  # Eloquent models
│   │   └── Notifications/           # Database notification classes
│   ├── database/
│   │   ├── factories/               # Faker-powered model factories
│   │   ├── migrations/              # Database schema migrations
│   │   └── seeders/                 # DatabaseSeeder + role seeders
│   └── routes/
│       └── api.php                  # All API route definitions
│
└── frontend/                        # React 19 + Vite SPA
    └── src/
        ├── components/
        │   ├── common/              # Shared components (NotificationBell, Toast…)
        │   └── layout/              # TopHeader, Sidebar, layouts
        ├── context/                 # AuthContext, global state
        ├── pages/
        │   ├── auth/                # Login, Register, ForgotPassword
        │   ├── student/             # Dashboard, Board, Profile, Applications…
        │   ├── company/             # Dashboard, ManageInternships, Applicants…
        │   ├── admin/               # Admin dashboard
        │   └── shared/              # CommunityFeed (both roles)
        └── services/                # Axios API service modules
```

---

## Getting Started

### Prerequisites

Make sure the following are installed in your environment:

| Tool | Version |
|---|---|
| PHP | ≥ 8.3 |
| Composer | ≥ 2.x |
| Node.js | ≥ 20.x |
| npm | ≥ 10.x |
| MySQL | ≥ 8.0 (or SQLite for local dev) |

> **WSL users (Windows):** All terminal commands must be prefixed with `wsl`. The project lives inside the WSL filesystem. See [Running the App](#running-the-app).

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy the environment file and configure it
cp .env.example .env

# 4. Generate the application key
php artisan key:generate

# 5. Configure your database in .env
#    For local dev (SQLite — zero config):
#      DB_CONNECTION=sqlite
#    For MySQL:
#      DB_CONNECTION=mysql
#      DB_HOST=127.0.0.1
#      DB_PORT=3306
#      DB_DATABASE=internship_platform
#      DB_USERNAME=root
#      DB_PASSWORD=your_password

# 6. Run migrations and seed the database
php artisan migrate:fresh --seed

# 7. (Optional) Link storage for avatar uploads
php artisan storage:link

# 8. Start the development server
php artisan serve
```

The API will be available at **`http://localhost:8000`**.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

The React app will be available at **`http://localhost:3000`**.

> The Vite dev server is pre-configured to proxy all `/api` requests to `http://localhost:8000`, so no CORS issues during development.

---

### Running the App

Open **two terminals** (or two WSL sessions) and run both servers simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend && php artisan serve
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Then open **`http://localhost:3000`** in your browser.

---

## Demo Accounts

The database seeder creates two ready-to-use test accounts:

| Role | Email | Password |
|---|---|---|
| 🎓 Student | `student@test.com` | `password` |
| 🏢 Company | `company@test.com` | `password` |

The seeder also generates a full demo dataset:

| Resource | Count |
|---|---|
| Skills | 15 |
| Companies | 11 |
| Students | 21 |
| Internships | 30 (with skills) |
| Feed Posts | 40 |
| Feed Comments | 100 |

To re-seed the database at any time:
```bash
php artisan migrate:fresh --seed
```

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header (obtained from `/api/login`).

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/register` | Register a new user | Public |
| `POST` | `/api/login` | Log in and get a Sanctum token | Public |
| `POST` | `/api/logout` | Revoke the current token | ✅ |
| `GET` | `/api/user` | Get the authenticated user | ✅ |
| `POST` | `/api/forgot-password` | Send a password reset email | Public |
| `POST` | `/api/reset-password` | Reset password with token | Public |

### Internships

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/internships` | List all internships | Public |
| `GET` | `/api/internships/{id}` | Get a single internship | Public |
| `POST` | `/api/internships` | Create an internship (Company) | ✅ |
| `PUT` | `/api/internships/{id}` | Update an internship (Company) | ✅ |
| `DELETE` | `/api/internships/{id}` | Delete an internship (Company) | ✅ |

### Applications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/internships/{id}/apply` | Apply to an internship (Student) | ✅ |
| `GET` | `/api/student/applications` | List student's own applications | ✅ |
| `GET` | `/api/internships/{id}/applications` | List applicants (Company) | ✅ |
| `PATCH` | `/api/applications/{id}/status` | Accept or reject (Company) | ✅ |

### Community Feed

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/feed` | Get all posts | ✅ |
| `POST` | `/api/feed/posts` | Create a post | ✅ |
| `PUT` | `/api/feed/posts/{id}` | Edit a post | ✅ |
| `DELETE` | `/api/feed/posts/{id}` | Delete a post | ✅ |
| `POST` | `/api/feed/posts/{id}/like` | Toggle like | ✅ |
| `POST` | `/api/feed/posts/{id}/comments` | Add a comment | ✅ |
| `DELETE` | `/api/feed/comments/{id}` | Delete a comment | ✅ |

### Notifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | List notifications with unread count | ✅ |
| `POST` | `/api/notifications/{id}/read` | Mark one as read | ✅ |
| `POST` | `/api/notifications/read-all` | Mark all as read | ✅ |

### Profile & Settings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/student/profile` | — (via `/api/user`) | ✅ |
| `POST` | `/api/student/profile` | Update student profile (multipart) | ✅ |
| `PUT` | `/api/student/skills` | Sync student skills | ✅ |
| `GET` | `/api/company/profile` | Get company profile | ✅ |
| `PUT` | `/api/company/profile` | Update company profile | ✅ |
| `POST` | `/api/user/avatar` | Upload avatar | ✅ |
| `PUT` | `/api/user/password` | Change password | ✅ |

---

## Database Schema

```
users                   student_profiles         companies
────────────────        ──────────────────       ──────────────
id                      id                       id
name                    user_id (FK)             user_id (FK)
email                   university               company_name
password                bio                      description
role                    phone                    website
avatar                  linkedin_link
                        github_link
                        languages
                        cv_path

internships             applications             skills
────────────────        ──────────────────       ──────────────
id                      id                       id
company_id (FK)         internship_id (FK)       name
title                   student_id (FK)
description             status
location
type                    internship_skill (pivot)
deadline                skill_student (pivot)
salary

posts                   feed_comments            notifications
────────────────        ──────────────────       ──────────────
id                      id                       id (UUID)
body                    post_id (FK)             notifiable_type
author_type (morph)     body                     notifiable_id
author_id  (morph)      author_type (morph)      type
                        author_id  (morph)       data (JSON)
post_likes                                       read_at
────────────────
id
post_id (FK)
liker_type (morph)
liker_id   (morph)
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | `InternshipHub` |
| `APP_ENV` | Environment (`local`, `production`) | `local` |
| `APP_KEY` | Laravel encryption key (auto-generated) | — |
| `APP_URL` | Backend base URL | `http://localhost:8000` |
| `DB_CONNECTION` | Database driver (`mysql` or `sqlite`) | `sqlite` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `internship_platform` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | — |
| `MAIL_MAILER` | Mail driver (`log` for dev, `smtp` for prod) | `log` |
| `SANCTUM_STATEFUL_DOMAINS` | Allowed SPA origins | `localhost:3000` |
| `FILESYSTEM_DISK` | Storage disk for uploads | `public` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API URL (if not using proxy) | `/api` |

> In local development, the Vite proxy in `vite.config.js` handles API routing automatically — no frontend `.env` file is required.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes with clear messages: `git commit -m "feat: add X feature"`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request against `main`

### Code Style

- **Backend:** Follow [Laravel conventions](https://laravel.com/docs/contributions#coding-style). Run `./vendor/bin/pint` before committing.
- **Frontend:** ESLint is configured — run `npm run lint` before committing.
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ using Laravel & React</p>
