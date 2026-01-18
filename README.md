# Comment System Client

A modern, feature-rich comment system UI application built with React and TypeScript. This application provides a user-friendly interface for managing comments, replies, likes, and dislikes, with real-time updates and a responsive design.

## Features

- **User Authentication**: Register and login functionality
- **Comment Management**: Create, edit, and delete comments
- **Nested Replies**: Support for threaded comment conversations
- **Interactions**: Like and dislike comments
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn-ui components
- **Sorting & Pagination**: Multiple sorting options and efficient pagination

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.x or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download Git](https://git-scm.com/)

## Installation

Follow these steps to set up and run the project locally:

### Step 1: Clone the Repository

```bash
git clone https://github.com/tasnimayan/comment-system-client
cd comment-system-client
```

### Step 2: Install Dependencies

Install all required dependencies using npm:

```bash
npm install
```

Or if you prefer using yarn:

```bash
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root of the `comment-system-client` directory.

Add the following environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

> **Note**: Update `VITE_API_URL` to match your backend API URL. If your API is running on a different port or domain, adjust accordingly.

### Step 4: Start the Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Available Scripts

- **`npm run dev`** - Start the development server with hot-reload
- **`npm run build`** - Build the application for production
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check code quality
- **`npm test`** - Run tests using Vitest

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be generated in the `dist` directory. You can preview the production build locally using:

```bash
npm run preview
```


## License

This project is part of the Techzu Assessment.
