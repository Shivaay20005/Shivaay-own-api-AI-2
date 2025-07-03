# Shivaay AI - Local Development & Vercel Deployment Guide

## Local Development in VS Code

### Prerequisites
- Node.js 18+ installed
- VS Code with recommended extensions
- Git installed

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd shivaay-ai

# Install dependencies
npm install

# Install development dependencies
npm install -D @types/node tsx esbuild vite
```

### Step 2: Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
DATABASE_URL=your_database_url_here
```

### Step 3: Run Development Server
```bash
# Start development server
npm run dev

# Server will run on http://localhost:5000
```

## Vercel Deployment

### Step 1: Prepare for Deployment
1. Make sure your code is in a Git repository
2. Push your code to GitHub/GitLab/Bitbucket

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy to Vercel
```bash
# First deployment
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: shivaay-ai
# - Directory: ./
# - Override settings? No

# For subsequent deployments
vercel --prod
```

### Step 5: Set Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `your_database_url`

### Alternative: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

## Project Structure for Deployment
```
shivaay-ai/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types/schemas
├── dist/            # Built files (auto-generated)
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies and scripts
```

## Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server locally
npm start

# Type checking
npm run check
```

## Troubleshooting

### Common Issues:
1. **Build Errors**: Ensure all dependencies are installed
2. **Environment Variables**: Double-check your `.env` file
3. **Database Connection**: Verify your DATABASE_URL is correct
4. **Port Issues**: Make sure port 5000 is available

### Vercel-specific Issues:
1. **Serverless Function Timeout**: Functions have 10s limit on Hobby plan
2. **Cold Starts**: First request may be slower
3. **File Size Limits**: 50MB limit for deployments

## Mobile Responsiveness
The app is now fully responsive with:
- Mobile-optimized chat interface
- Responsive sidebar navigation
- Touch-friendly input areas
- Optimized message layouts

## Features
- Real-time streaming responses
- Web search integration
- Code highlighting with copy functionality
- File upload support (images, PDFs)
- 14 AI models with auto-selection
- Password-protected admin panel
- Mobile-responsive design

## Performance Tips
- Use environment variables for configuration
- Optimize images for web
- Enable gzip compression
- Use CDN for static assets
- Monitor Vercel analytics