# 📁 clubmint - Project Structure

*Generated on: 12/10/2025, 4:30:30 PM*

## 📋 Quick Overview

| Metric | Value |
|--------|-------|
| 📄 Total Files | 125 |
| 📁 Total Folders | 74 |
| 🌳 Max Depth | 7 levels |
| 🛠️ Tech Stack | React, TypeScript, CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🔷 **tsconfig.json** - TypeScript config
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🔷 **tsconfig.json** - TypeScript config
- 🟡 🐳 **docker-compose.yml** - Docker compose
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🔷 **tsconfig.json** - TypeScript config

## 📊 File Statistics

### By File Type

- ⚛️ **.tsx** (React TypeScript files): 55 files (44.0%)
- 🔷 **.ts** (TypeScript files): 31 files (24.8%)
- 📄 **.sql** (Other files): 16 files (12.8%)
- ⚙️ **.json** (JSON files): 13 files (10.4%)
- 🖼️ **.jpeg** (JPEG images): 2 files (1.6%)
- 🎨 **.svg** (SVG images): 2 files (1.6%)
- 🚫 **.gitignore** (Git ignore): 1 files (0.8%)
- ⚙️ **.toml** (TOML files): 1 files (0.8%)
- 📄 **.prisma** (Other files): 1 files (0.8%)
- 🎨 **.css** (Stylesheets): 1 files (0.8%)
- 📄 **.mjs** (Other files): 1 files (0.8%)
- ⚙️ **.yml** (YAML files): 1 files (0.8%)

### By Category

- **React**: 55 files (44.0%)
- **TypeScript**: 31 files (24.8%)
- **Other**: 18 files (14.4%)
- **Config**: 15 files (12.0%)
- **Assets**: 4 files (3.2%)
- **DevOps**: 1 files (0.8%)
- **Styles**: 1 files (0.8%)

### 📁 Largest Directories

- **root**: 125 files
- **apps**: 113 files
- **apps\web**: 65 files
- **apps\web\app**: 49 files
- **apps\api**: 48 files

## 🌳 Directory Structure

```
clubmint/
├── 📂 apps/
│   ├── 🔌 api/
│   │   ├── 🟡 🚫 **.gitignore**
│   │   ├── 🟡 🔒 **package-lock.json**
│   │   ├── 🔴 📦 **package.json**
│   │   ├── 📂 prisma/
│   │   │   ├── 📂 migrations/
│   │   │   │   ├── 📂 20251130220608_init/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251201105900_remove_platform_fk/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251205191040_add_telegram_group_id/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251205210111_telegram_integration_update/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251205214020_add_telegram_access/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251205232107_telegram_fix/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251206191040_tggroupid_unique/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251207081309_add_telegram_verification/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251207083226_add_telegram_verification/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251207090940_add_telegram_veification/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251209134950_add_product_matching/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251209135812_grace_period/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251209140851_autoadd/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251209164116_creator_page/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251209170523_page_update/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251209173856_add_theme_gradient/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   └── ⚙️ migration_lock.toml
│   │   │   └── 📄 schema.prisma
│   │   ├── 🔷 prisma.config.ts
│   │   ├── 📁 src/
│   │   │   ├── 📂 cron/
│   │   │   │   └── 🔷 subscriptionCheck.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 📂 integrations/
│   │   │   │   ├── 🔷 telegram.ts
│   │   │   │   └── 🔷 telegramChatMember.ts
│   │   │   ├── 📂 middleware/
│   │   │   │   └── 🔷 auth.ts
│   │   │   ├── 📂 routes/
│   │   │   │   ├── 🔷 auth.ts
│   │   │   │   ├── 🔷 checkout.ts
│   │   │   │   ├── 🔷 creator.ts
│   │   │   │   ├── 🔷 dashboard.ts
│   │   │   │   ├── 🔷 pages.ts
│   │   │   │   ├── 🔷 payments.ts
│   │   │   │   ├── 🔷 products.ts
│   │   │   │   ├── 🔷 public.ts
│   │   │   │   ├── 🔷 settings.ts
│   │   │   │   ├── 🔷 stats.ts
│   │   │   │   ├── 🔷 subscriptions.ts
│   │   │   │   ├── 🔷 telegram-webhook.ts
│   │   │   │   ├── 🔷 telegram.ts
│   │   │   │   └── 🔷 upload.ts
│   │   │   ├── 📂 stripe/
│   │   │   │   └── 🔷 webhook.ts
│   │   │   └── 🔧 utils/
│   │   │   │   ├── 🔷 auth.ts
│   │   │   │   ├── 🔷 logActivity.ts
│   │   │   │   └── 🔷 minio.ts
│   │   ├── 🟡 🔷 **tsconfig.json**
│   │   └── 📂 uploads/
│   │   │   ├── 🖼️ 1765350790843-yx4o0bn9id.jpeg
│   │   │   └── 🖼️ 1765350800695-orgybm5jjpb.jpeg
│   └── 📂 web/
│   │   ├── 🚀 app/
│   │   │   ├── 📂 [handle]/
│   │   │   │   └── 📂 [slug]/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 cancel/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 checkout/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 🧩 components/
│   │   │   │   ├── 📂 dashboard/
│   │   │   │   │   ├── ⚛️ MetricCard.tsx
│   │   │   │   │   ├── ⚛️ Sidebar.tsx
│   │   │   │   │   └── ⚛️ Topbar.tsx
│   │   │   │   ├── 📂 landing/
│   │   │   │   │   ├── ⚛️ Brands.tsx
│   │   │   │   │   ├── ⚛️ CTA.tsx
│   │   │   │   │   ├── ⚛️ Features.tsx
│   │   │   │   │   ├── ⚛️ Footer.tsx
│   │   │   │   │   ├── ⚛️ Hero.tsx
│   │   │   │   │   ├── ⚛️ HowItWorks.tsx
│   │   │   │   │   ├── ⚛️ Navbar.tsx
│   │   │   │   │   ├── ⚛️ Pricing.tsx
│   │   │   │   │   └── ⚛️ SectionWrapper.tsx
│   │   │   │   └── ⚛️ PageRenderer.tsx
│   │   │   ├── 📂 create/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 creator/
│   │   │   │   └── 📂 onboarding/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 creators/
│   │   │   │   └── 📂 dashboard/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 dashboard/
│   │   │   │   ├── 📂 integrations/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── ⚛️ layout.tsx
│   │   │   │   ├── 📂 page/
│   │   │   │   │   └── ⚛️ editor.tsx
│   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   ├── 📄 pages/
│   │   │   │   │   ├── 📂 [pageId]/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   │   ├── 🧩 components/
│   │   │   │   │   │   ├── ⚛️ AccessBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ FAQBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ FeaturesBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ HeroBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ PageRenderer.tsx
│   │   │   │   │   │   ├── ⚛️ PricingBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ RefundBlockEditor.tsx
│   │   │   │   │   │   └── ⚛️ TestimonialsBlockEditor.tsx
│   │   │   │   │   ├── 📂 new/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 payments/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 products/
│   │   │   │   │   ├── 📂 [productId]/
│   │   │   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   │   │   └── 📂 telegram/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 settings/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   └── 📂 subscribers/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ layout.tsx
│   │   │   ├── 📂 login/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 p/
│   │   │   │   └── 📂 [handle]/
│   │   │   │   │   ├── 📂 [slug]/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 providers/
│   │   │   │   └── ⚛️ AuthProvider.tsx
│   │   │   ├── 🌐 public/
│   │   │   │   ├── 🎨 grid.svg
│   │   │   │   └── 🎨 squiggly.svg
│   │   │   ├── 📂 signup/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 success/
│   │   │   │   └── ⚛️ page.tsx
│   │   ├── 🧩 components/
│   │   │   ├── ⚛️ ImageUploader.tsx
│   │   │   └── 📂 sections/
│   │   │   │   ├── ⚛️ AccessSection.tsx
│   │   │   │   ├── ⚛️ FAQSection.tsx
│   │   │   │   ├── ⚛️ FeaturesSection.tsx
│   │   │   │   ├── ⚛️ HeroSection.tsx
│   │   │   │   ├── ⚛️ PricingSection.tsx
│   │   │   │   ├── ⚛️ RefundSection.tsx
│   │   │   │   └── ⚛️ TestimonialsSection.tsx
│   │   ├── 🎨 globals.css
│   │   ├── 📚 lib/
│   │   │   └── 🔷 stripe.ts
│   │   ├── 🔷 next-env.d.ts
│   │   ├── 📄 next.config.mjs
│   │   ├── 🟡 🔒 **package-lock.json**
│   │   ├── 🔴 📦 **package.json**
│   │   ├── 📄 pages/
│   │   │   └── 🔌 api/
│   │   │   │   └── 📂 auth/
│   │   │   │   │   └── 🔷 [...nextauth].ts
│   │   └── 🟡 🔷 **tsconfig.json**
├── 🟡 🐳 **docker-compose.yml**
├── 🟡 🔒 **package-lock.json**
├── 🔴 📦 **package.json**
└── 📂 packages/
│   ├── 📂 shared/
│   │   ├── 🟡 🔒 **package-lock.json**
│   │   ├── 🔴 📦 **package.json**
│   │   ├── 📁 src/
│   │   │   └── 🔷 types.ts
│   │   ├── 🔷 telegram.ts
│   │   └── 🔷 types.ts
│   └── 📂 worker/
│   │   ├── 🟡 🔒 **package-lock.json**
│   │   ├── 🔴 📦 **package.json**
│   │   ├── 📁 src/
│   │   │   └── 🔷 worker.ts
│   │   └── 🟡 🔷 **tsconfig.json**
```

## 📖 Legend

### File Types
- 🚫 DevOps: Git ignore
- ⚙️ Config: JSON files
- 📄 Other: Other files
- ⚙️ Config: TOML files
- 🔷 TypeScript: TypeScript files
- 🖼️ Assets: JPEG images
- ⚛️ React: React TypeScript files
- 🎨 Assets: SVG images
- 🎨 Styles: Stylesheets
- ⚙️ Config: YAML files

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
