# Overview

This is an AI-powered image generation web application called "Nano Banana" that allows users to upload photos (a main photo and up to 2 prop images) along with a text prompt to generate creative image variations using Google's Gemini AI. The application is built as a full-stack TypeScript application with a React frontend and Express backend, designed to run on Replit.

The application uses Google's Gemini 2.5 Flash Image generation API to create multiple variations of images based on user inputs. Users can upload their photos, provide creative prompts, configure generation parameters (number of variations, aspect ratio), and receive AI-generated image variations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for UI components
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query v5** for server state management and API calls
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with custom design tokens
- **React Hook Form** with Zod validation for form handling

**Design Pattern:**
The frontend follows a component-based architecture with clear separation of concerns:
- **Pages** (`client/src/pages/`) - Route-level components
- **UI Components** (`client/src/components/ui/`) - Reusable shadcn/ui components
- **Custom Components** (`client/src/components/`) - Application-specific components (UploadZone, LoadingState, ImageCarousel)
- **Hooks** (`client/src/hooks/`) - Custom React hooks for shared logic
- **Library utilities** (`client/src/lib/`) - Query client configuration and utility functions

**Key Design Decisions:**
- Uses CSS variables for theming, supporting light/dark modes
- Implements optimistic UI updates with TanStack Query
- File uploads handled via react-dropzone integration
- Toast notifications for user feedback

## Backend Architecture

**Technology Stack:**
- **Express.js** as the web server framework
- **TypeScript** for type safety across the stack
- **Drizzle ORM** for database interactions with PostgreSQL
- **Neon Database** (@neondatabase/serverless) as the PostgreSQL provider
- **Multer** for handling multipart/form-data file uploads
- **Zod** for runtime schema validation

**Design Pattern:**
The backend follows a modular Express architecture:
- **Route handlers** (`server/routes.ts`) - API endpoint definitions
- **Storage abstraction** (`server/storage.ts`) - Database operations with an IStorage interface
- **Services** (`server/services/`) - Business logic (Gemini AI integration)
- **Shared schema** (`shared/schema.ts`) - Database models and validation schemas shared between frontend and backend

**Key Design Decisions:**
- In-memory storage implementation (MemStorage) with interface for future database migration
- API requests logged with timing information for debugging
- File uploads stored temporarily in `uploads/` directory
- Async/await pattern throughout for handling asynchronous operations
- Error handling with try-catch blocks and appropriate HTTP status codes

## Database Schema

**Tables:**
1. **users** - User authentication
   - id (UUID primary key)
   - username (unique text)
   - password (text)

2. **imageGenerations** - Image generation requests and results
   - id (UUID primary key)
   - mainPhotoUrl (text, required)
   - prop1Url (text, optional)
   - prop2Url (text, optional)
   - prompt (text, required, min 10 characters)
   - numVariations (integer, default 5, range 1-10)
   - aspectRatio (text, default "1:1", options: "1:1", "16:9", "9:16", "4:3")
   - generatedImages (text array for storing result URLs)
   - createdAt (timestamp)

**Design Rationale:**
- Uses Drizzle ORM with PostgreSQL dialect for type-safe database operations
- Schema defined in TypeScript with runtime validation via drizzle-zod
- Separation of insert schemas from select types for different validation rules
- Array field for storing multiple generated image URLs

## External Dependencies

**AI/ML Services:**
- **Google Gemini AI** (@google/genai v1.22.0)
  - Used for image generation via Gemini 2.5 Flash Image model
  - Requires GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable
  - Handles multimodal inputs (images + text prompts)

**Database:**
- **Neon Database** (@neondatabase/serverless v0.10.4)
  - Serverless PostgreSQL provider
  - Connection via DATABASE_URL environment variable
  - Configured through Drizzle ORM

**File Upload:**
- **Multer** (v2.0.0)
  - Handles multipart form data
  - 10MB file size limit enforced
  - Image-only file type validation
  - Temporary storage in uploads/ directory

**UI Component Libraries:**
- **Radix UI** - Comprehensive set of accessible, unstyled components
  - Provides primitives for dialogs, dropdowns, tooltips, and more
  - Ensures accessibility compliance
- **shadcn/ui** - Pre-built component system using Radix UI
  - Configured with "new-york" style variant
  - Custom theming via Tailwind CSS variables

**Development Tools:**
- **Replit-specific plugins:**
  - @replit/vite-plugin-runtime-error-modal - Development error overlay
  - @replit/vite-plugin-cartographer - Code navigation
  - @replit/vite-plugin-dev-banner - Development environment indicator

**Session Management:**
- **connect-pg-simple** (v10.0.0) - PostgreSQL session store for Express sessions

**Validation:**
- **Zod** - Runtime type validation for API requests and database schemas
- **@hookform/resolvers** - Connects React Hook Form with Zod validation