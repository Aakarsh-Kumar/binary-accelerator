# Template - Monorepo Project

A modern, full-stack monorepo template featuring a **Next.js frontend** and **Express.js backend** with TypeScript, Prisma ORM, and OpenAPI-driven development.

---

## 📁 Project Structure

This is a **monorepo** containing two main applications:

```
template/
├── client/              # Next.js frontend (React 19)
├── server/              # Express.js backend API
├── README.md            # This file
└── readme.md            # Project root
```

### Monorepo Benefits

- **Shared Types**: Backend API types are auto-generated and shared with the frontend
- **Single Repository**: Easier version control and consistency
- **Unified Development**: Both frontend and backend evolve together
- **Code Sharing**: Common utilities and types can be easily shared

---

## 🎨 Frontend (`/client`) - Next.js Application

### Folder Structure

```
client/
├── src/
│   ├── app/                    # Next.js app directory (pages & layouts)
│   │   ├── (public)/           # Public pages (login, landing)
│   │   ├── dashboard/          # Protected dashboard routes
│   │   ├── onboarding/         # Onboarding flow
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles & design tokens
│   │   └── middleware.ts       # Next.js middleware
│   ├── components/             # Reusable React components
│   │   ├── layout/             # Layout components (Navbar, Sidebar, etc.)
│   │   ├── pwa/                # PWA-related components
│   │   ├── ui/                 # Shadcn UI components
│   │   └── utils/              # Utility components
│   ├── constants/              # Global constants & configuration
│   ├── features/               # Feature-based organization
│   │   └── auth/               # Auth feature
│   │       ├── api/            # API calls for auth
│   │       ├── components/     # Auth-specific components
│   │       └── hooks/          # Auth-specific hooks
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── providers/              # Context providers (Auth, Query, Socket, etc.)
│   ├── services/               # API client & services
│   ├── store/                  # Global state (Zustand)
│   ├── types/                  # TypeScript types
│   │   └── api.ts              # 🔄 Auto-generated from OpenAPI (run `npm run gen`)
│   └── middleware.ts           # Next.js auth middleware
├── public/                     # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

### Frontend Rules & Best Practices

#### 1. **Global Color Definitions** 🎨

All colors **must be defined in `globals.css` first**, then used via CSS classes:

```css
/* ✅ DO: Define in globals.css */
:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
}

/* ✅ DO: Use CSS variables */
.button-primary {
  background-color: var(--primary);
}
```

```tsx
/* ✅ DO: Use CSS classes or Tailwind */
<button className="bg-blue-500">Click me</button>
```

**Never hardcode colors in components:**

```tsx
/* ❌ DON'T: Hardcode colors */
<div style={{ backgroundColor: "#3b82f6" }}>Text</div>
```

#### 2. **State Management** - Zustand + TanStack Query

- **Global State**: Use **Zustand** for simple, persistent state (auth user, preferences)
- **Server State**: Use **TanStack Query** (@tanstack/react-query) for API data
- **Local State**: Use React `useState` for component-level state

```tsx
// ✅ Zustand for auth state
import { useAuthStore } from "@/store/authStore";

function Profile() {
  const { user } = useAuthStore();
  return <div>{user?.name}</div>;
}

// ✅ TanStack Query for API data
import { useQuery } from "@tanstack/react-query";

function UserList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users"),
  });

  if (isLoading) return <div>Loading...</div>;
  return users.map((u) => <div key={u.id}>{u.name}</div>);
}
```

#### 3. **API Folder Structure** - Features

API calls are organized by **feature** in `/src/features/{featureName}/api`:

```tsx
// ✅ DO: Keep API calls in features folder
// src/features/auth/api/authApi.ts
import { api } from "@/services/api";
import { AuthResponse } from "@/types";

export const authApi = {
  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google", { idToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  },
};
```

Use in components:

```tsx
import { authApi } from "@/features/auth/api/authApi";

async function loginUser() {
  const result = await authApi.googleLogin(idToken);
  setUser(result.user);
}
```

#### 4. **Constants** - Global Configuration

All constant variables (API endpoints, timeouts, etc.) live in `/src/constants/index.ts`:

```tsx
// ✅ src/constants/index.ts
export const TIMEOUTS = {
  API_TIMEOUT: 15000,
  RETRY_DELAY: 1000,
};

export const API_ENDPOINTS = {
  HEALTH: "/health",
  AUTH: "/auth",
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
```

Use throughout your app:

```tsx
import { TIMEOUTS } from "@/constants";

const api = axios.create({
  timeout: TIMEOUTS.API_TIMEOUT,
});
```

#### 5. **Type Validation** - Zod + OpenAPI

Types are **auto-generated** from the backend OpenAPI spec. Run this regularly:

```bash
npm run gen
```

This command:

1. Reads `/server/docs/v1_openapi.yaml`
2. Generates `/src/types/api.ts` with TypeScript types
3. **Never manually edit** `api.ts` - it's generated

**Using Generated Types:**

```tsx
import { AuthResponse, User } from "@/types/api";

// ✅ Types are guaranteed to match backend
const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await api.get("/auth/me");
  return response.data;
};
```

**Type Validation in Components:**

```tsx
import { User } from "@/types/api";

interface ProfileProps {
  user: User; // ✅ Type-safe
}

export function Profile({ user }: ProfileProps) {
  return <div>{user.name}</div>;
}
```

#### 6. **Request/Response Validation**

Validate API responses using the `@zodios/core` package:

```tsx
// ✅ Using Zodios for type-safe API calls
import { api } from "@/services/api";

// Types are auto-validated against schema
const response = await api.get("/users"); // ✅ Response is typed
```

**Error Handling:**

The API client has a **universal error interceptor** in `/src/services/api.ts` that automatically handles errors:

- 401 → Logs out user & redirects to login
- 403 → Shows permission error toast
- 500 → Shows server error toast
- Network errors → Shows connection error toast

```tsx
import { api } from "@/services/api";

// ✅ Error handling is automatic - no try/catch needed!
const response = await api.post("/auth/login", { email, password });
setUser(response.data.user);

// ❌ DON'T: Add catch blocks unless you need custom logic
// try {
//   ...
// } catch (error) {
//   // toast.error('...') // ← Already handled by interceptor
// }
```

**Custom error handling** (only when needed):

```tsx
import { api } from "@/services/api";

try {
  const response = await api.post("/auth/login", { email, password });
  setUser(response.data.user);
} catch (error) {
  // ✅ Only add custom logic if interceptor default isn't enough
  if (error.response?.status === 401) {
    // Custom 401 logic...
  }
}
```

#### 7. **API Client Setup**

The API client is configured in `/src/services/api.ts` with:

- **Base URL** from environment variable
- **Timeout** set to 15 seconds
- **Error interceptor** for handling 401, 403, 500, etc.
- **Cookie credentials** enabled for auth

```tsx
// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 15000,
});

// Error interceptor handles:
// - 401: Logout user & redirect to login
// - 403: Show permission error
// - 500: Show server error
// - Network errors: Show connection error
```

#### 8. **Styling** - Tailwind CSS

- Use **Tailwind CSS** for styling
- Define custom colors in `globals.css` using CSS variables
- Use component-level classes via `className`
- Use utility classes from `shadcn/ui` components

```tsx
// ✅ Use Tailwind utilities
<button className="px-4 py-2 bg-blue-500 text-white rounded">Click me</button>;

// ✅ Use shadcn/ui components
import { Button } from "@/components/ui/button";

<Button variant="primary">Click me</Button>;
```

---

## 🔧 Backend (`/server`) - Express.js API

### Folder Structure

```
server/
├── src/
│   ├── app.ts                  # Express app configuration
│   ├── server.ts               # Server entry point
│   ├── config/                 # Configuration files
│   │   └── config.ts           # Environment config & secrets
│   ├── controllers/            # Route controllers (business logic)
│   ├── middlewares/            # Express middlewares
│   │   ├── auth.ts             # Authentication middleware
│   │   ├── errorHandler.ts     # Global error handler
│   │   ├── validate.ts         # Request/response validation
│   │   └── verifyGoogleAuthToken.ts
│   ├── models/                 # Database models (Prisma)
│   ├── routes/                 # API routes
│   │   ├── health.ts           # Health check endpoint
│   │   └── sample-route.ts     # Example route
│   ├── services/               # Business logic services
│   ├── sockets/                # WebSocket handlers
│   ├── types/                  # TypeScript type definitions
│   │   └── api.ts              # 🔄 Auto-generated from OpenAPI
│   ├── utils/                  # Utility functions
│   │   ├── cookies.ts          # Cookie helpers
│   │   ├── ipUtils.ts          # IP detection utilities
│   │   ├── jwt.ts              # JWT helpers
│   │   ├── logger.ts           # Logging utility
│   │   ├── sendResponse.ts     # Standardized responses
│   │   ├── validators.ts       # Custom validators
│   │   └── zod.ts              # 🔄 Auto-generated Zod schemas
│   └── types/
│       └── index.ts            # Type declarations
├── prisma/
│   └── schema.prisma           # Prisma schema & database models
├── docs/
│   ├── v1_openapi.yaml         # OpenAPI specification (source of truth)
│   └── Postman_Collection.json # 🔄 Auto-generated Postman collection
├── package.json
├── tsconfig.json
└── .env.example
```

### Backend Rules & Best Practices

#### 1. **API Definition** - OpenAPI Specification

The **`v1_openapi.yaml`** is the **source of truth** for your API. Define all endpoints, schemas, and security here:

```yaml
# ✅ docs/v1_openapi.yaml
openapi: 3.1.0
info:
  title: Reusable API Template
  version: 1.0.0

servers:
  - url: http://localhost:3000/api/v1
    description: Local development

components:
  schemas:
    # Define request schemas
    SampleRequest:
      type: object
      required:
        - sample
      properties:
        sample:
          type: string
          maxLength: 2048

    # Define response schemas
    SuccessResponse:
      type: object
      required:
        - success
        - message
      properties:
        success:
          type: boolean
          message:
          type: string

paths:
  /sample-endpoint:
    get:
      summary: Sample endpoint
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SampleRequest'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
```

**Keep OpenAPI updated as you add new endpoints!**

#### 2. **Generate Types & Schemas** 🔄

Run `npm run gen` in the server to:

1. **Generate Postman Collection** from OpenAPI
2. **Generate TypeScript types** (`src/types/api.ts`)
3. **Generate Zod schemas** (`src/utils/zod.ts`)

```bash
cd server
npm run gen
```

**Never manually edit:**

- `/src/types/api.ts` (auto-generated)
- `/src/utils/zod.ts` (auto-generated)
- `/docs/Postman_Collection.json` (auto-generated)

#### 3. **Environment Configuration** - `config.ts`

All environment variables are imported and validated in `/src/config/config.ts`:

```typescript
// ✅ src/config/config.ts
import dotenv from "dotenv";

dotenv.config();

const cleanEnvVar = (
  val: string | undefined,
  fallback: string = "",
): string => {
  if (!val) return fallback;
  return val.replace(/^["']|["']$/g, ""); // strip quotes
};

export const config = {
  port: process.env.PORT || 3000,
  environment: cleanEnvVar(process.env.NODE_ENV, "development"),
  databaseUrl: cleanEnvVar(process.env.DATABASE_URL),
  apiVersion: cleanEnvVar(process.env.API_VERSION, "v1"),
  jwt: {
    secret: cleanEnvVar(process.env.JWT_SECRET),
    expiration: cleanEnvVar(process.env.JWT_EXPIRATION, "1d"),
    issuer: "Template",
  },
  googleClientId: cleanEnvVar(process.env.GOOGLE_CLIENT_ID),
};
```

**Usage in application:**

```typescript
// ✅ Import from config
import { config } from "./config/config";

const PORT = config.port;
const JWT_SECRET = config.jwt.secret;

// ❌ DON'T: Use process.env directly
// const PORT = process.env.PORT;
```

**Setup `.env` file:**

```bash
# .env (root level, not in git)
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
```

#### 4. **Route Definition & Validation**

Routes are defined in `/src/routes/` and use the generated Zod schemas for validation:

```typescript
// ✅ src/routes/sample-route.ts
import { sampleController } from "../controllers/your-route-controllers";
import { validate, validateResponse } from "../middlewares/validate";
import { schemas } from "../utils/zod";
import { Router } from "express";

const router = Router();

router.get(
  "/sample-endpoint",
  validate(schemas.SampleRequest), // ✅ Validate request
  validateResponse(schemas.SuccessResponse), // ✅ Validate response (dev only)
  sampleController,
);

export default router;
```

**Middleware order matters:**

1. `validate()` - Validates incoming request body
2. `validateResponse()` - (Dev only) Validates response matches spec
3. `controller` - Route handler

#### 5. **Request/Response Validation** - Zod Middleware

Use the `validate()` middleware to ensure requests match your OpenAPI spec:

```typescript
// ✅ Automatically validates against Zod schema
router.post(
  "/users",
  validate(schemas.CreateUserRequest), // Validates req.body
  createUserController,
);

// ✅ Validate query parameters
router.get(
  "/users",
  validate(schemas.ListUsersQuery, "query"), // Validates req.query
  listUsersController,
);

// ✅ Validate URL parameters
router.get(
  "/users/:id",
  validate(schemas.GetUserParams, "params"), // Validates req.params
  getUserController,
);
```

**In controller:**

```typescript
// ✅ Data is already parsed and coerced by Zod
export const createUserController = (req: Request, res: Response) => {
  const { email, name } = req.body; // ✅ Type-safe & validated

  // Process validated data...

  res.json({
    success: true,
    message: "User created",
  });
};
```

**Error handling** (automatic):

```json
// Invalid request returns 400
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 6. **Response Validation** (Development Only)

The `validateResponse()` middleware (in dev) warns if controller output doesn't match OpenAPI spec:

```typescript
router.get(
  "/auth/me",
  isAuthenticated,
  validateResponse(schemas.AuthMeResponse), // ✅ Validates response shape
  getCurrentUserController,
);
```

In production, this middleware is a no-op for performance.

#### 7. **Prisma ORM** - Database Management

Prisma is configured in `/prisma/schema.prisma`:

```prisma
// ✅ prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
  posts Post[]
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  user  User    @relation(fields: [userId], references: [id])
  userId Int
}
```

**Common Prisma commands:**

```bash
# Generate Prisma client (after updating schema)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Deploy migrations to database
npm run prisma:deploy

# Pull schema from existing database
npm run prisma:pull

# View database (Prisma Studio)
npm run prisma:studio

# Check migration status
npm run prisma:status
```

**Using Prisma in services:**

```typescript
// ✅ src/services/userService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userService = {
  create: async (email: string, name: string) => {
    return prisma.user.create({
      data: { email, name },
    });
  },

  findById: async (id: number) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};
```

#### 8. **Middleware Stack**

Express middlewares are configured in `/src/app.ts`:

```typescript
// ✅ Middleware order (important!)
app.use(cors()); // 1. Enable CORS
app.use(helmet()); // 2. Security headers
app.use(rateLimit()); // 3. Rate limiting
app.use(express.json()); // 4. Parse JSON
app.use(cookieParser()); // 5. Parse cookies
app.use(requestLogger); // 6. Log requests

// Routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Error handling (must be last)
app.use(errorHandler); // 7. Global error handler
```

#### 9. **Error Handling**

Use the global error handler middleware:

```typescript
// ✅ src/middlewares/errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Unhandled error", { error: err.message });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
```

**In controllers:**

```typescript
// ✅ Throw errors - they're caught by errorHandler
export const getUserController = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    throw error; // ✅ Will be caught by errorHandler
  }
};
```

#### 10. **Logging**

Use the Winston logger for consistent logging:

```typescript
// ✅ src/utils/logger.ts (already configured)
import logger from "./utils/logger";

logger.info("User created", { userId: 123, email: "user@example.com" });
logger.warn("Deprecated endpoint used", { endpoint: "/old-api" });
logger.error("Database connection failed", { error: err.message });
```

---

## 🚀 Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd template

# Install dependencies for both client and server
npm install --prefix client
npm install --prefix server

# Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Initialize database
cd server
npm run prisma:migrate
npm run prisma:generate
```

### Daily Development

```bash
# Terminal 1: Start Backend
cd server
npm run dev          # Starts on http://localhost:5000

# Terminal 2: Start Frontend
cd client
npm run dev          # Starts on http://localhost:3000

# Terminal 3: Generate types when you update OpenAPI spec
cd server
npm run gen

# Then update client types
cd client
npm run gen
```

### Creating a New Feature

**1. Backend First:**

```bash
cd server

# 1. Update OpenAPI spec (docs/v1_openapi.yaml)
# 2. Generate types
npm run gen

# 3. Create database models
npm run prisma:migrate

# 4. Write service & controller
vim src/services/newFeatureService.ts
vim src/controllers/newFeatureController.ts

# 5. Create route
vim src/routes/newFeature.ts

# 6. Add route to app.ts
```

**2. Frontend:**

```bash
cd client

# 1. Generate types from updated backend OpenAPI
npm run gen

# 2. Create API functions in features folder
vim src/features/newFeature/api/newFeatureApi.ts

# 3. Create components
vim src/features/newFeature/components/NewFeatureComponent.tsx

# 4. Use in pages
vim src/app/newFeature/page.tsx
```

---

## 📋 Pull Request Checklist

Before submitting a PR, ensure you've completed these checks:

### ✅ **Build Clearance**

- [ ] **No TypeScript errors**: `npm run build` passes in both `client/` and `server/`
- [ ] **No linting errors**: `npm run lint` passes
- [ ] **Tests pass**: (if applicable) `npm run test`

### ✅ **Code Quality**

- [ ] Code follows project conventions (see rules above)
- [ ] Constants are in `/constants`, not hardcoded
- [ ] Colors are defined in `globals.css`, not inline
- [ ] API calls are in `/features/{name}/api`, not in components
- [ ] Types are generated (run `npm run gen`)
- [ ] Request/response validation is in place

### ✅ **Backend Changes**

- [ ] Updated `/server/docs/v1_openapi.yaml`
- [ ] Ran `npm run gen` to update types & schemas
- [ ] Ran `npm run prisma:migrate` if schema changed
- [ ] Error handling is implemented
- [ ] Request/response validation middleware is applied

### ✅ **Frontend Changes**

- [ ] Ran `npm run gen` to sync with backend API
- [ ] Using generated types from `/src/types/api.ts`
- [ ] Using TanStack Query for async data
- [ ] Using Zustand for global state
- [ ] No hardcoded colors or constants

### ✅ **UI Changes**

- [ ] Include **screenshots** showing before/after
- [ ] Tested on mobile & desktop
- [ ] Accessibility considered (keyboard navigation, contrast)
- [ ] Responsive design works

### ✅ **PR Metadata**

- [ ] **Title**: Clear, descriptive (e.g., "feat: add user profile page")
- [ ] **Description**: Explain what changed and why
- [ ] **Reviewer**: Assign at least one reviewer
- [ ] **Labels**: Add relevant labels (bug, feature, enhancement, etc.)
- [ ] **Screenshots**: Attached for UI changes

### Example PR Template

```markdown
## Description

Brief description of changes

## Changes Made

- Bullet point 1
- Bullet point 2
- Bullet point 3

## Testing

How to test these changes

## Screenshots

[If UI changes]

## Checklist

- [ ] Build passes (`npm run build`)
- [ ] No lint errors (`npm run lint`)
- [ ] Types generated (`npm run gen`)
- [ ] API documented (OpenAPI updated)
```

---

## 🔄 Synchronizing Client & Backend

The client and backend must stay in sync:

```bash
# After updating OpenAPI spec:
cd server
npm run gen        # Generates types, zod schemas, Postman collection

# Then update frontend:
cd client
npm run gen        # Generates TypeScript types from OpenAPI

# Commit both generated files
git add server/src/types/api.ts server/src/utils/zod.ts
git add client/src/types/api.ts
git commit -m "chore: sync types with API spec"
```

---

## 📚 Key Files Reference

| File                                 | Purpose                             |
| ------------------------------------ | ----------------------------------- |
| `server/docs/v1_openapi.yaml`        | API specification (source of truth) |
| `server/src/config/config.ts`        | Environment configuration           |
| `server/src/middlewares/validate.ts` | Request/response validation         |
| `server/src/utils/zod.ts`            | 🔄 Auto-generated Zod schemas       |
| `client/src/globals.css`             | Color & design tokens               |
| `client/src/constants/index.ts`      | Global constants                    |
| `client/src/services/api.ts`         | Axios API client                    |
| `client/src/store/authStore.ts`      | Zustand global state                |
| `client/src/types/api.ts`            | 🔄 Auto-generated types             |

---

## 🎯 Quick Commands

### Backend

```bash
cd server

npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Check code style
npm run gen                # Generate types, zod, postman
npm run prisma:migrate     # Create database migration
npm run prisma:studio      # Open Prisma Studio (GUI)
npm run prisma:generate    # Update Prisma client
```

### Frontend

```bash
cd client

npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Check code style
npm run gen                # Generate types from OpenAPI
```

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [Prisma ORM](https://www.prisma.io)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0)
- [Zod Validation](https://zod.dev)

---

## 🤝 Contributing

### Branch Naming Convention

Use your initials followed by the branch type and feature name:

```bash
# Feature branch
git checkout -b ak/feat/user-authentication

# Bug fix
git checkout -b ak/fix/login-redirect-issue

# Chore/maintenance
git checkout -b ak/chore/update-dependencies

# Documentation
git checkout -b ak/docs/api-migration-guide

# Performance improvements
git checkout -b ak/perf/optimize-query-loading
```

**Format**: `{initials}/{type}/{description}`

**Types**:

- `feat` - New feature
- `fix` - Bug fix
- `chore` - Maintenance, dependency updates
- `docs` - Documentation only
- `perf` - Performance improvement
- `refactor` - Code refactoring
- `test` - Test additions/updates

### Contribution Steps

1. **Create feature branch** using the naming convention above
2. **Follow the rules** outlined in this README
3. **Run `npm run gen`** when API changes
4. **Complete the PR checklist** before submitting
5. **Request review** from team members
6. **Address feedback** and merge!

---

**Happy coding! 🚀**
