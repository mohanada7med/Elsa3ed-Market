# 📜 Elsa3ed Market (سوق الصعيد) — Production Readiness & Deployment Guide

This document outlines the architecture, security safeguards, performance optimizations, and deployment procedures implemented for **Elsa3ed Market** in **Phase 6: Production Readiness**.

---

## 1. ⚙️ Environment Configuration

All server-side configuration is strictly validated at application boot by `server/config/env.ts`.

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Deployment environment (`development` \| `production` \| `test`) |
| `PORT` | Yes | `3000` | Server binding port (required for Cloud Run reverse proxy) |
| `APP_URL` | Optional | `http://localhost:3000` | Public base URL used for Sitemap and Open Graph tags |
| `MONGODB_URI` | Recommended | `mongodb+srv://ahmdmohanad28_db_user:<db_password>@cluster0.je3wwaw.mongodb.net/?appName=Cluster0` (in-memory fallback) | MongoDB Atlas connection string |
| `MONGODB_DB` | Optional | `Elsa3ed_market` | Database name |
| `AUTH_SECRET` | Required (Prod) | Secure fallback in dev | Secret for signature and token encryption |
| `ENABLE_RATE_LIMITING`| Optional | `true` | Enables sliding window rate limiting |
| `CACHE_TTL_SECONDS` | Optional | `300` | Default TTL for in-memory cache |
| `MAX_UPLOAD_SIZE_MB` | Optional | `5` | Maximum upload size in megabytes |

---

## 2. 🛡️ Security Hardening

### 2.1 Security Headers (`server/middleware/security.ts`)
* `X-Content-Type-Options: nosniff` — Prevents MIME confusion attacks.
* `X-XSS-Protection: 1; mode=block` — Mitigates reflected script injections.
* `Referrer-Policy: strict-origin-when-cross-origin` — Protects referral URLs.
* `Permissions-Policy: camera=(), microphone=(), geolocation=()` — Locks down browser API access.
* `X-Powered-By` header stripped to minimize server fingerprinting.

### 2.2 Rate Limiting (`server/middleware/rateLimiter.ts`)
* **Standard API**: 120 req / minute per IP.
* **Authentication**: 25 req / minute per IP (guards against brute-force attacks).
* **Mutations & Orders**: 30 req / minute per IP.
* **Uploads**: 20 req / minute per IP.
* Standard `429 Too Many Requests` responses returned in Arabic with `Retry-After` header.

### 2.3 IDOR & Privilege Escalation Protection
* Identity and roles are strictly verified server-side.
* Sellers can only view/modify products and orders tied to their `sellerId`.
* Buyers can only view/cancel their own orders (`buyerId`).
* Unapproved products are strictly hidden from public endpoints and search engines.

---

## 3. 🖼️ File Upload & Storage Management

* **Provider Abstraction** (`server/services/storage/storageProvider.ts`): Pluggable `IStorageProvider` interface supporting local disk storage with automatic Data-URI fallback.
* **MIME & Magic Byte Validation** (`server/utils/imageValidator.ts`): Enforces JPEG, PNG, WebP, GIF, SVG formats; verifies binary headers to reject disguised executables or corrupt files.
* **Path Traversal Shield**: All incoming filenames are sanitized to prevent directory traversal (`../`).
* **Optimized Image Component** (`src/components/common/OptimizedImage.tsx`):
  * Skeleton shimmer while loading.
  * Lazy loading (`loading="lazy"`).
  * Graceful fallback when remote images fail to load.

---

## 4. 🗄️ Database & Query Performance

* **Connection Pooling**: Configured with `maxPoolSize: 10`, `minPoolSize: 2`, `maxIdleTimeMS: 30000`.
* **Automated Production Indexes** created on startup:
  * `products`: `{ approvalStatus: 1, categoryId: 1, sellerGovernorate: 1, price: 1 }`
  * `products`: `{ sellerId: 1, createdAt: -1 }`
  * `orders`: `{ buyerId: 1, createdAt: -1 }`
  * `orders`: `{ sellerIds: 1, createdAt: -1 }`
  * `reviews`: `{ productId: 1, status: 1, createdAt: -1 }`
  * `categories`: `{ slug: 1 }` (unique)
  * `sellers`: `{ id: 1 }` (unique)

---

## 5. ⚡ Caching & Revalidation (`server/services/cacheService.ts`)

* In-memory TTL cache with tag-based invalidation.
* **Cached Endpoints**:
  * Public categories list (`categories:public`, TTL: 10 mins)
  * Approved catalog search queries (`products:public:*`, TTL: 3 mins)
  * Product details (`product:${id}`, TTL: 5 mins)
* **Automatic Invalidation Events**:
  * Admin approvals / rejections / edits -> Flushes `products` tag.
  * Category creations / updates -> Flushes `categories` tag.
  * Seller profile changes -> Flushes `sellers` tag.

---

## 6. 🌐 SEO, Sitemap & Robots

* **Dynamic XML Sitemap** (`GET /sitemap.xml`): Automatically indexes all approved products, active categories, and approved sellers while excluding private buyer/seller/admin paths.
* **Robots Directives** (`GET /robots.txt`): Allows indexing of public routes, blocks `/admin`, `/seller`, `/checkout`, `/orders`, `/api/`.
* **Structured Data (Schema.org)**:
  * `Product` and `Offer` Schema for Google Rich Snippets on product pages.
  * `Store` / `LocalBusiness` Schema for artisanal workshops.

---

## 7. 🚨 Error Handling & Monitoring

* **Centralized Error Middleware** (`server/middleware/errorHandler.ts`):
  * Attaches unique correlation `x-request-id` to every request.
  * Logs structured errors with sensitive data redaction.
  * Delivers user-friendly Arabic messages without leaking database or server internals.
* **React Error Boundary** (`src/components/common/ErrorBoundary.tsx`): Catches runtime UI errors with retry and home recovery actions.
* **Health & Diagnostics** (`GET /api/health`): Returns system uptime, memory usage, database connection state, and cache metrics.

---

## 8. 🚀 Deployment Instructions

1. Configure `.env` based on `.env.example`.
2. Run `npm run build` to compile both the frontend bundle and backend server.
3. Start the application with `npm start` (which runs `node dist/server.cjs`).
4. Ensure port `3000` is exposed.
