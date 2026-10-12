# OpenShelf — Online Library Management & Digital Book System

A full-stack starter project featuring a responsive React interface and a Java Spring Boot REST API backed by MySQL. Includes JWT authentication, role-protected administration, catalogue management, borrowing and returns.

## Requirements

- Java 17 or later
- Maven 3.8+ (or use your IDE's Maven integration)
- Node.js 18+
- MySQL 8+

## 1. Configure MySQL

Make sure the MySQL service is running. The application can create the schema automatically when the MySQL user has permission:

`openshelf_library`

If your local MySQL `root` account has a password, set `DB_PASSWORD` before starting the backend.

**Windows PowerShell example:**

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="replace-with-a-random-secret-at-least-32-bytes"
$env:ADMIN_EMAIL="admin@openshelf.local"
$env:ADMIN_PASSWORD="ChangeMe123!"
```

Change the example admin password before using the application beyond local development. The seeded administrator is created only if the configured email does not already exist.

## 2. Start the backend

```powershell
cd backend
mvn spring-boot:run
```

Backend base URL: `http://localhost:8080/api`

If Maven is not installed, install Apache Maven or use the Maven support in your IDE. This project uses Java 17 and Spring Boot 3.3.5.

## 3. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Optional: copy `frontend/.env.example` to `frontend/.env` if you want to change `VITE_API_URL`.

## Default local administrator

- Email: `admin@openshelf.local`
- Password: `ChangeMe123!`

The default credentials are for local development only. Change `ADMIN_PASSWORD` before first startup. If the administrator already exists, changing the environment variable will not reset the existing password.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a member |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/books` | Public | List books; optional `?q=` search |
| GET | `/api/books/{id}` | Public | Book details |
| POST | `/api/books` | Admin | Add a book |
| PUT | `/api/books/{id}` | Admin | Update a book |
| DELETE | `/api/books/{id}` | Admin | Delete a book |
| POST | `/api/borrowings/{bookId}` | Member | Borrow an available book |
| GET | `/api/borrowings/my` | Member | Current member's borrowing history |
| POST | `/api/borrowings/{id}/return` | Record owner or admin | Return a borrowed book |
| GET | `/api/borrowings` | Admin | List all borrowing records |
| GET | `/api/admin/members` | Admin | List members |
| PATCH | `/api/admin/members/{id}/status` | Admin | Activate/deactivate a member |
| GET | `/api/admin/borrowings` | Admin | All borrowing records |

JWT should be sent as `Authorization: Bearer <token>`.

## Project layout

```text
online-library-management-system/
├── frontend/                  # React + Vite
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── main.jsx
│       └── styles.css
├── backend/                   # Spring Boot + JPA + Spring Security + JWT
│   ├── pom.xml
│   └── src/main/java/com/openshelf/library/
│       ├── auth/
│       ├── book/
│       ├── borrowing/
│       ├── admin/
│       └── config/
└── README.md
```

## Notes and limitations

- The UI has a small fallback catalogue for preview if the API is offline; once the backend returns book records, those are displayed instead.
- This starter implements physical-book catalogue, borrowing, and return workflows. Digital book upload/reading, fine calculation, email reminders, reviews, and recommendation algorithms are not implemented yet.
- The backend currently uses `spring.jpa.hibernate.ddl-auto=update` for development. Use versioned database migrations and a managed secret store for production.
- For production, prefer secure, HTTP-only cookies for JWT/session storage, HTTPS, rate limiting, stronger audit logging, and tested concurrency controls for inventory.
- The seed catalogue contains illustrative starter records. Replace or remove them as appropriate for your library.
