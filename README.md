<h1 align="center">Movies Database</h1>

<p align="center">
  A full-featured movie database application built with Next.js, PostgreSQL, and Drizzle ORM.
</p>

## Overview

This project is a comprehensive movie database application that allows users to browse, rate, and review movies. The application features a modern, responsive UI with both light and dark modes, user authentication, and a dashboard for content management.

## Features

- **User Authentication**: Secure login via GitHub OAuth
- **Movie Browsing**: View movies with filtering by genre and pagination
- **Movie Details**: Detailed movie pages with descriptions and metadata
- **Rating System**: Rate movies on a 5-star scale
- **Reviews**: Add, edit, and delete reviews for movies
- **Actor & Director Management**: Browse actors and directors with their filmographies
- **Admin Dashboard**: Content management system for administrators
- **Search Functionality**: Search for movies, actors, and directors
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

- **Frontend**:
  - Next.js 15.x (React framework with App Router)
  - React 18.x
  - TypeScript
  - Tailwind CSS for styling
  - Framer Motion for animations
  - Lucide React for icons
  - TreMOR for data visualization

- **Backend**:
  - Next.js API routes and Server Actions
  - PostgreSQL database
  - Drizzle ORM for database operations
  - NextAuth.js for authentication

- **DevOps & Tools**:
  - Vercel for deployment
  - pnpm for package management
  - ESLint and Prettier for code quality
  - Drizzle Kit for database migrations

## Project Structure

```
app/
├── api/ - API routes and server endpoints
├── app/ - Admin dashboard application
│   └── (dashboard)/ - Protected dashboard routes
├── movies/ - Public movie browsing routes
│   └── [slug]/ - Dynamic movie detail pages
├── actors/ - Public actor browsing routes
├── directors/ - Public director browsing routes
├── (auth)/ - Authentication related routes
components/ - Reusable React components
├── form/ - Form-related components
lib/ - Utility functions and shared logic
├── actions.ts - Server actions for data mutations
├── auth.ts - Authentication configuration
├── db.ts - Database connection
├── fetchers.ts - Data fetching functions
├── schema.ts - Database schema definitions
├── search-functions.ts - Search functionality
├── utils.ts - Utility functions
public/ - Static assets
styles/ - Global CSS files
```

## Installation and Setup

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- GitHub OAuth application (for authentication)

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
POSTGRES_URL=postgresql://username:password@localhost:5432/moviedb

# Authentication
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Deployment
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
```

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movies-database.git
   cd movies-database
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   pnpm schema_sync
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: User accounts and authentication data
- **movies**: Movie information including title, description, and metadata
- **actor**: Actor information including name, image, and biography
- **director**: Director information including name, image, and biography
- **ratings**: User ratings for movies
- **reviews**: User reviews for movies
- **movie_actors**: Many-to-many relationship between movies and actors
- **movie_directors**: Many-to-many relationship between movies and directors

Key relationships:
- Movies have many Actors and Directors through junction tables
- Users can have many Ratings and Reviews
- Movies can have many Ratings and Reviews

## API and Server Actions

### Server Actions

The application uses React Server Actions for data mutations:

- **Movie Management**: Create, update, delete movies
- **Actor/Director Management**: Create, update, delete actors and directors
- **Ratings**: Add or update movie ratings
- **Reviews**: Add, update, delete movie reviews
- **Relationship Management**: Associate/disassociate actors and directors with movies

### Data Fetching

Data is fetched using server-side functions with caching:

- `getMoviesByRating`: Fetch movies with pagination, filtering, and sorting
- `getMovieData`: Fetch detailed movie information including ratings and reviews
- `getHomePageMovies`: Fetch featured movies for the homepage
- `getActorDataByName`: Fetch actor information by name
- `getDirectorDataByName`: Fetch director information by name

## Authentication System

Authentication is implemented using NextAuth.js with GitHub OAuth provider. The system features:

- JWT-based session management
- Protected routes for admin dashboard
- User role management (admin vs. regular users)
- Authentication middleware for route protection

## Component Architecture

### Core Components

- **SearchDropdown**: Reusable component for entity search with autocomplete
- **MovieCard**: Display movie information in a card layout
- **Form**: Dynamic form component for various data input needs
- **ClientNav**: Client-side navigation component with search functionality
- **MovieGallery**: Display a grid of movie cards
- **Rating System**: Star-based rating interface
- **Reviews**: Review display and management interface

### Page Components

- **MoviesPage**: Browse movies with filtering and pagination
- **MovieDetailPage**: Detailed view of a single movie
- **Dashboard**: Admin interface for content management

## Deployment

The application is configured for deployment on Vercel with the following features:

- Edge caching for improved performance
- Preview deployments for PRs
- Environment variable management
- Automatic database migrations (via build hooks)

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with default settings (Next.js project)
4. Set up a PostgreSQL database (Vercel Postgres or external provider)
5. Run database migrations during build or manually

## Performance Optimization

- Server components for reduced client-side JavaScript
- Image optimization with Next.js Image component
- Data caching with `unstable_cache`
- Pagination for large data sets
- Prefetching for improved navigation experience
- Debounced search for better user experience

