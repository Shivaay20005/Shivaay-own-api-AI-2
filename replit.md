# Shivaay AI - Advanced AI Assistant

## Overview

Shivaay AI is a full-stack web application that provides a privacy-focused AI chat interface with file analysis capabilities. The application supports multiple AI models and conversation modes, offering users a versatile AI assistant experience with support for image and PDF file uploads.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Handling**: Multer for multipart file uploads
- **Session Management**: PostgreSQL-based session storage

### Development Tools
- **Hot Reload**: Vite dev server with HMR
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Shared TypeScript schemas between client and server
- **Linting**: TypeScript compiler for type checking

## Key Components

### Chat System
- **Multi-Model Support**: 14 different AI models including Claude, GPT-4, and others
- **Conversation Modes**: 
  - General (Shivaay AI)
  - Friend Talk (casual conversations)
  - Shayar Mode (poetry & creativity)
  - Deep Search (research)
  - Deep Coding (programming help)
  - Mathematics (calculations)
- **Real-time Messaging**: HTTP-based chat API with form data support

### File Processing
- **Supported Formats**: PNG, JPEG, JPG, GIF, WebP images and PDF documents
- **File Size Limit**: 10MB per file
- **Processing**: In-memory file handling with base64 encoding
- **Preview**: Client-side image previews, PDF text extraction

### User Interface
- **Responsive Design**: Mobile-first approach with breakpoint-aware components
- **Dark Theme**: Custom color scheme optimized for extended use
- **Component Library**: Comprehensive UI components (buttons, dialogs, forms, etc.)
- **Accessibility**: Radix UI primitives ensure ARIA compliance

## Data Flow

### Chat Flow
1. User inputs message and optionally attaches files
2. Files are validated client-side and uploaded via FormData
3. Server processes files (PDF text extraction, image encoding)
4. Message and files are sent to external A3Z API
5. Response is returned to client and displayed
6. Conversation history is maintained in memory storage

### File Handling Flow
1. Client validates file type and size
2. Files are converted to base64 for display
3. Server receives files via multer middleware
4. Files are processed based on type (PDF text extraction)
5. Processed files are included in AI model requests

## External Dependencies

### UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Dynamic class generation

### Development and Build
- **Vite**: Build tool and dev server
- **esbuild**: Fast JavaScript bundler for production
- **TypeScript**: Type safety and developer experience

### Backend Services
- **Neon Database**: Serverless PostgreSQL for data persistence
- **A3Z API**: External AI model provider (configured in storage layer)

### File Processing
- **Multer**: Multipart form data handling
- **PDF parsing**: Planned integration for PDF text extraction

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express API
- **Hot Reload**: Full-stack hot reloading with Vite middleware
- **Environment**: NODE_ENV=development with development-specific features

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Drizzle migrations manage schema updates

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Sessions**: PostgreSQL-based session storage
- **CORS**: Configured for cross-origin requests in development

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```