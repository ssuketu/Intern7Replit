# InternVacancy Platform

An AI-powered internship matchmaking platform connecting students with employers using resume parsing and intelligent matching algorithms.

## Features

- AI-powered resume parsing and analysis
- Intelligent matching algorithms
- Student, Employer, and College portals
- Career path recommendations
- Skill gap analysis
- Pre-campus placement tools

## Deployment Instructions

### Deploying to Vercel

1. Connect your GitHub repository to Vercel
2. In the Vercel deployment settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

3. Environment Variables:
   - Add your `DATABASE_URL` for your Postgres database
   - Add any other required environment variables

4. Deploy!

### Database Setup

This application requires a PostgreSQL database. You can provision one through:
- Vercel Postgres
- Neon
- Any other PostgreSQL provider

After setting up your database, make sure to:
1. Set the `DATABASE_URL` environment variable in your Vercel deployment
2. Run the database migrations before deploying (or set up automatic migrations)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`