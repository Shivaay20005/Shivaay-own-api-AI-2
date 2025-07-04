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

## Recent Updates

### January 03, 2025 - Admin Panel & Enhanced Features
- ✓ Integrated A3Z API with 14 AI models (claude-sonnet-4, gpt-4.1, gemini-2.5-pro, etc.)
- ✓ Added intelligent auto-model selection based on conversation mode
- ✓ Implemented 8 specialized conversation modes:
  - General (Shivaay AI) - Smart reasoning with auto-model selection
  - Friend Talk - Casual conversations with empathy
  - Deep Search - Advanced research with web search capabilities
  - Deep Coding - Programming help with best practices
  - Mathematics - Step-by-step problem solving
  - Code Search - Programming resource finder
  - ShivaayPro Coder - Elite programming solutions
  - Image Generation - AI art creation assistance
- ✓ Added Admin Panel (Password: Shivaay20005) with features:
  - Toggle model name visibility in chat messages
  - System settings control
  - Protected admin access
- ✓ Added "New Chat" button for clearing conversation history
- ✓ Enhanced PDF text extraction using pdf-parse library
- ✓ User-friendly model names (hides technical model names from users)
- ✓ Smart model routing (DeepSeek for coding, O3 for math, Grok for research, etc.)
- ✓ Real-time web search indicator and status
- ✓ Removed Shayar, Girlfriend, and Engineer modes as requested
- ✓ Fixed file upload errors and improved error handling

### July 03, 2025 - Real-time Enhancements & Web Search
- ✓ Implemented real-time streaming responses with word-by-word display
- ✓ Removed "New Chat" button from header as requested
- ✓ Added live web search functionality for Deep Search, Deep Coding, and Code Search modes
- ✓ Enhanced code highlighting with syntax highlighting and copy functionality
- ✓ Implemented higher character limits (50,000 chars) for deep modes vs 8,000 for regular modes
- ✓ Added ReactMarkdown with code block support and copy-to-clipboard features
- ✓ Enhanced admin panel with password authentication (Shivaay20005)
- ✓ Added real-time web search indicators in UI
- ✓ Improved message rendering with markdown support
- ✓ Added web search status indicators in sidebar and chat header
- ✓ Enhanced API to perform DuckDuckGo searches for research queries
- ✓ Smart web search integration for search, coding, and codesearch modes

### July 05, 2025 - Comprehensive AI Enhancement & Full Feature Migration
- ✓ Successfully completed comprehensive migration from Replit Agent to Replit environment
- ✓ Implemented multiple AI provider integrations (OpenAI, Gemini, DeepSeek, Blackbox AI)
- ✓ Added intelligent conversation memory system with context-aware responses
- ✓ Created enhanced admin panel with API key management (password: Shivaay20005)
- ✓ Implemented user and admin API key management system
- ✓ Added proper dark/light theme toggle with CSS variable support
- ✓ Created Full Stack Developer mode for elite programming assistance (admin-only)
- ✓ Enhanced mobile responsiveness with improved layout and touch interactions
- ✓ Added comprehensive markdown response formatting with bold, italic, underline support
- ✓ Implemented RTMS protection preventing AI model information disclosure
- ✓ Enhanced @ShivaayAI branding across all responses and modes
- ✓ Added memory persistence with conversation context for related questions
- ✓ Created intelligent model routing based on conversation mode and content type
- ✓ Enhanced security with proper session management and admin authentication
- ✓ Improved chat streaming with word-by-word display and better UX
- ✓ Added comprehensive error handling and fallback responses
- ✓ Implemented theme provider with localStorage persistence
- ✓ Enhanced database schema with user preferences and API key storage
- ✓ Added memory manager for conversation context and intelligent responses
- ✓ Created comprehensive AI router supporting multiple providers
- ✓ Enhanced admin panel with tabbed interface for better organization
- ✓ Removed Engineering mode and created dedicated Admin Settings Panel
- ✓ Added comprehensive admin settings with system configuration, API keys, user management, AI model controls, and security features

### July 03, 2025 - Initial Setup
- Basic chat interface with dark theme
- File upload capabilities
- Multiple conversation modes

## User Preferences

```
Preferred communication style: Simple, everyday language.
```