# Pawnest

Premium dog & cat products storefront — food, toys, beds and accessories with fast, secure shipping to the USA, Canada, Australia and New Zealand.

## Features

- Product catalog with categories, subcategories, search and filters
- Product detail pages with image galleries, reviews and wishlist
- Cart, checkout and coupon support with multiple payment methods
- Order placement, tracking and email notifications
- Blog with rich-text editor, SEO-friendly slugs and excerpts
- Admin dashboard: products, bulk import (CSV / XLSX), orders, shipping, coupons, payments, live chat and site content
- Inline content editing, testimonials and newsletter signup
- Responsive dark UI with a fixed mobile tab bar
- SEO: per-route metadata, JSON-LD structured data and a dynamic sitemap

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui
- Framer Motion
- Supabase (database, auth, storage, edge functions)

## Getting Started

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:8080`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite |

## Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## Deployment

Run `npm run build` and upload the contents of `dist/` to your web host. For Apache/cPanel hosting, keep `.htaccess` and `image-proxy.php` at the document root so SPA routing and image proxying work.

## License

Proprietary — all rights reserved.
