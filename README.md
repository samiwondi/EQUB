# Equb Management System

A full-stack web application for managing Equb – the traditional Ethiopian community savings and credit association. Designed as a capstone project for Web Programming II.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication and Authorization](#authentication-and-authorization)
- [Extra Features](#extra-features)
- [Project Structure](#project-structure)
- [License](#license)

## Overview

The Equb Management System digitizes the traditional Ethiopian savings model. Users can create groups, manage savings cycles, run random draws, and handle all operations transparently.

Key workflows:

- Group Creation – Any user can create a public or private group.
- Join Requests – Users request to join public groups; private groups require an invitation.
- Cycles and Rounds – Once a group has enough members, the creator starts a cycle. Each round collects fixed contributions from all active members.
- Winners and Draws – For each round, a random winner (or fixed) is drawn; the winner receives the total pot.
- Reform and Dismantle – After all rounds are completed, the cycle ends. The creator can reform a new cycle (reusing members) or dismantle the group.
- Notifications – Members receive in-app notifications for actions like request approvals, contribution due dates, round winners, and group announcements.

The system uses Node.js (Express) for the backend, Next.js (App Router) for the frontend, and PostgreSQL as the database.

## Features

### Core Features

- User registration and login (JWT-based authentication)
- Public and private groups with join requests and invitations
- Group administration: approve/deny join requests, invite members by email
- Contribution tracking: members contribute a fixed amount per round
- Automated random winner selection (or fixed winner per round)
- Cycle management: start, complete, reform, dismantle
- In-app notifications for all relevant actions
- Group owner settings: kick members, update max members, send broadcast announcements

### Security

- Password hashing (bcrypt)
- JSON Web Tokens (JWT) for session management
- Role-based access control (member / group admin / platform admin)
- Input validation and sanitisation
- Helmet.js for security headers
- CORS configuration

### Architecture

- MVC pattern on the backend (Models, Controllers, Routes)
- RESTful API design
- Sequelize ORM with PostgreSQL
- Next.js App Router for the frontend (React)
- Tailwind CSS for styling

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express.js |
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS |
| Database | PostgreSQL with Sequelize ORM |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Logging | Winston + Morgan |
| HTTP Client | Axios (frontend) |
| Validation | express-validator |
| Environment | dotenv |
| Dev Tools | Nodemon (backend) |

## Architecture

The backend follows a classic Model-View-Controller pattern:

- Models – Define database tables and relationships (Sequelize).
- Controllers – Handle business logic and respond to HTTP requests.
- Routes – Map URLs to controller functions.
- Middleware – Authentication, validation, error handling, logging.

The frontend uses the Next.js App Router with client-side authentication (token stored in localStorage). API calls are made via axios with interceptors to attach the JWT token.

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/equb-platform.git
cd equb-platform
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit .env with your database credentials and JWT secret (see Environment Variables).

### 3. Database setup

Run the database schema:

```bash
psql -U postgres -d equb_db -f database/schema.sql
```

(Replace equb_db with your database name.)

### 4. Frontend setup

```bash
cd ../frontend
npm install
cp .env.local.example .env.local   # if provided
```

Add NEXT_PUBLIC_API_URL=http://localhost:5000/api to .env.local.

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | equb_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | yourpassword |
| JWT_SECRET | Secret key for signing JWT tokens | (required) |
| JWT_EXPIRE | Token expiration (e.g. 7d) | 7d |
| LOG_LEVEL | Winston log level | info |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API base URL | http://localhost:5000/api |

## Running the Application

### Start the Backend

```bash
cd backend
npm run dev   # or npm start
```

Server runs at http://localhost:5000.

### Start the Frontend

```bash
cd frontend
npm run dev
```

App runs at http://localhost:3000.

## API Endpoints

All endpoints return JSON. Protected routes require a JWT token in the Authorization: Bearer <token> header.

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login, returns token | No |
| GET | /api/auth/me | Get current user profile | Yes |

### Groups

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/groups | Create a new group | Yes |
| GET | /api/groups | List all groups (with filters) | No |
| GET | /api/groups/:id | Get group details | No |
| POST | /api/groups/:id/request-join | Request to join a public group | Yes |
| PUT | /api/groups/:id/requests/:userId | Approve/deny a join request | Yes (creator) |
| POST | /api/groups/:id/invite | Invite a user (private group) | Yes (creator) |
| POST | /api/groups/:id/contribute | Submit a contribution | Yes (member) |
| DELETE | /api/groups/:id/leave | Leave the group | Yes (member) |
| POST | /api/groups/:id/cycle/start | Start a new cycle | Yes (creator) |
| POST | /api/groups/:id/cycle/draw | Draw a winner for current round | Yes (creator) |
| GET | /api/groups/:id/cycle/status | Get active cycle status | Yes (member) |
| POST | /api/groups/:id/cycle/end | End cycle (reform/dismantle) | Yes (creator) |
| POST | /api/groups/:id/kick/:userId | Kick a member | Yes (creator) |
| PUT | /api/groups/:id/max-members | Update max members limit | Yes (creator) |
| POST | /api/groups/:id/notify | Send announcement to all members | Yes (creator) |

## Database Schema

The database schema is defined in database/schema.sql. It includes the following main tables:

- users – account information.
- groups – group details, privacy, contribution amount, etc.
- group_memberships – many-to-many relationship with roles (admin, member, pending, invited).
- cycles – savings cycles with start/end dates, total rounds, current round.
- rounds – each round has a winner, amount, and status.
- contributions – per-user, per-round payments.
- invites – tokens for private group invitations.
- notifications – in-app notifications for users.



## Authentication and Authorization

- JWT tokens are issued upon login/register and sent in the Authorization header.
- Middleware protect verifies the token and attaches the user to req.user.
- Authorization is enforced via checks on req.user.id against group.created_by for admin actions.
- Roles (admin, organizer, member) are defined at the user level but group-level permissions are primarily based on group_memberships.role.

## Project Structure

```
equb-platform/
├── backend/
│   ├── src/
│   │   ├── config/            # Database, JWT, logger config
│   │   ├── models/            # Sequelize models
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── scripts/           # Utility scripts (seed, etc.)
│   │   └── app.js             # Express app entry
│   ├── database/
│   │   └── schema.sql         # Full PostgreSQL schema
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/                   # Next.js App Router
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API client and auth services
│   │   ├── dashboard/         # Dashboard page
│   │   ├── groups/            # Group pages (list, create, detail, settings)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── layout.js
│   │   ├── page.js            # Homepage (landing)
│   │   └── globals.css
│   ├── public/                # Static assets
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## License

This project is created for educational purposes as part of the Web Programming II capstone.

---

Built for the Ethiopian community.
