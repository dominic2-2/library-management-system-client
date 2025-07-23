# Library Management System Client

This is a [Next.js](https://nextjs.org) project for the Library Management System frontend, built with TypeScript and Material-UI.

## Features

- 📚 Book management with OData integration
- 🔍 Advanced search and filtering
- 📱 Responsive design with Material-UI
- 🔐 Role-based access control
- 📊 Dashboard with analytics

## Prerequisites

- Node.js 18+
- .NET 8+ backend running with OData support
- Environment configuration

## Environment Setup

Create a `.env.local` file in the root directory with the following configuration:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5027

# Example for production (update as needed)
# NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Integration

This application integrates with a .NET OData backend. The main endpoints are:

- **Books**: `/manage/Book` - CRUD operations for books
- **Categories**: `/manage/Category` - Book categories
- **Authors**: `/manage/Author` - Book authors

### OData Features Used

- `$expand` - Include related entities (authors, volumes, variants)
- `$filter` - Filter results by various criteria
- `$search` - Full-text search across multiple fields
- `$orderby` - Sort results
- `$top` & `$skip` - Pagination support
- `$count` - Get total count for pagination

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
