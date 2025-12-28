# 📁 clubmint - Project Structure

*Generated on: 12/28/2025, 7:39:49 PM*

## 📋 Quick Overview

| Metric | Value |
|--------|-------|
| 📄 Total Files | 267 |
| 📁 Total Folders | 105 |
| 🌳 Max Depth | 7 levels |
| 🛠️ Tech Stack | React, TypeScript, CSS, Tailwind CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🔷 **tsconfig.json** - TypeScript config
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🎨 **tailwind.config.js** - Tailwind config
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

- ⚛️ **.tsx** (React TypeScript files): 79 files (29.6%)
- 🖼️ **.png** (PNG images): 59 files (22.1%)
- 🔷 **.ts** (TypeScript files): 55 files (20.6%)
- 📄 **.sql** (Other files): 37 files (13.9%)
- ⚙️ **.json** (JSON files): 13 files (4.9%)
- 🖼️ **.jpeg** (JPEG images): 9 files (3.4%)
- 🎨 **.svg** (SVG images): 4 files (1.5%)
- 🖼️ **.jpg** (JPEG images): 2 files (0.7%)
- 📜 **.js** (JavaScript files): 2 files (0.7%)
- 🚫 **.gitignore** (Git ignore): 1 files (0.4%)
- ⚙️ **.toml** (TOML files): 1 files (0.4%)
- 📄 **.prisma** (Other files): 1 files (0.4%)
- 🎨 **.css** (Stylesheets): 1 files (0.4%)
- 📄 **.mjs** (Other files): 1 files (0.4%)
- 🖼️ **.ico** (Icon files): 1 files (0.4%)
- ⚙️ **.yml** (YAML files): 1 files (0.4%)

### By Category

- **React**: 79 files (29.6%)
- **Assets**: 75 files (28.1%)
- **TypeScript**: 55 files (20.6%)
- **Other**: 39 files (14.6%)
- **Config**: 15 files (5.6%)
- **JavaScript**: 2 files (0.7%)
- **DevOps**: 1 files (0.4%)
- **Styles**: 1 files (0.4%)

### 📁 Largest Directories

- **root**: 267 files
- **apps**: 254 files
- **apps\api**: 156 files
- **apps\web**: 98 files
- **apps\web\app**: 74 files

## 🌳 Directory Structure

```
clubmint/
├── 🟡 🚫 **.gitignore**
├── 📂 apps/
│   ├── 🔌 api/
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
│   │   │   │   ├── 📂 20251211191037_creatorpage_update/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251211191110_creatorpage_update/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251211202051_colour_update/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251214141308_page_product_relation/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251215135307_add_creator_plans/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251215151409_add_creator_billing/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251216205453_add_alerts/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251218182332_add_razorpay_account/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251218190657_add_razorpay_account_2/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251218192501_add_payments/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251219183412_add_image/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251220183207_add_creator_ledger/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251220205100_add_bank/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251221061613_make_payment_user_optional/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251225191932_add_is_system_to_creator/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251225204140_add_is_system_to_creator_2/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251225205318_add_is_system_to_creator_3/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251226180713_add_analytics_core/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251227171421_creatorearnings/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251228063725_telegramgroup/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   ├── 📂 20251228084535_user_tokenversion_change/
│   │   │   │   │   └── 📄 migration.sql
│   │   │   │   └── ⚙️ migration_lock.toml
│   │   │   └── 📄 schema.prisma
│   │   ├── 🔷 prisma.config.ts
│   │   ├── 📂 scripts/
│   │   │   └── 🔷 create-razorpay-plans.ts
│   │   ├── 📁 src/
│   │   │   ├── 📂 admin/
│   │   │   │   └── 🔷 payouts.ts
│   │   │   ├── 📂 analytics/
│   │   │   │   └── 🔷 events.ts
│   │   │   ├── ⚙️ config/
│   │   │   │   ├── 🔷 planLimits.ts
│   │   │   │   └── 🔷 plans.ts
│   │   │   ├── 📂 cron/
│   │   │   │   ├── 🔷 analyticsDaily.ts
│   │   │   │   └── 🔷 subscriptionCheck.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 📂 integrations/
│   │   │   │   ├── 🔷 telegram.ts
│   │   │   │   └── 🔷 telegramChatMember.ts
│   │   │   ├── 📚 lib/
│   │   │   │   ├── 🔷 creator.ts
│   │   │   │   ├── 🔷 r2.ts
│   │   │   │   └── 🔷 razorpay.ts
│   │   │   ├── 📂 middleware/
│   │   │   │   ├── 🔷 auth.ts
│   │   │   │   └── 🔷 rateLimit.ts
│   │   │   ├── 📂 routes/
│   │   │   │   ├── 🔷 access.ts
│   │   │   │   ├── 🔷 analytics.ts
│   │   │   │   ├── 🔷 auth.ts
│   │   │   │   ├── 🔷 billing.ts
│   │   │   │   ├── 🔷 checkout.ts
│   │   │   │   ├── 🔷 creator.ts
│   │   │   │   ├── 🔷 dashboard.ts
│   │   │   │   ├── 🔷 earnings.ts
│   │   │   │   ├── 🔷 me.ts
│   │   │   │   ├── 🔷 pages.ts
│   │   │   │   ├── 🔷 payments.ts
│   │   │   │   ├── 🔷 payouts.ts
│   │   │   │   ├── 🔷 products.ts
│   │   │   │   ├── 🔷 public.ts
│   │   │   │   ├── 🔷 razorpay-webhook.ts
│   │   │   │   ├── 🔷 settings.ts
│   │   │   │   ├── 🔷 stats.ts
│   │   │   │   ├── 🔷 subscribers.ts
│   │   │   │   ├── 🔷 subscriptions.ts
│   │   │   │   ├── 🔷 telegram-dashboard.ts
│   │   │   │   ├── 🔷 telegram-webhook.ts
│   │   │   │   └── 🔷 upload.ts
│   │   │   ├── 📂 stripe/
│   │   │   │   └── 🔷 webhook.ts
│   │   │   ├── 📂 types/
│   │   │   │   ├── 🔷 express.d.ts
│   │   │   │   └── 🔷 global.d.ts
│   │   │   └── 🔧 utils/
│   │   │   │   ├── 🔷 auth.ts
│   │   │   │   ├── 🔷 createAlert.ts
│   │   │   │   ├── 🔷 logActivity.ts
│   │   │   │   ├── 🔷 minio.ts
│   │   │   │   └── 🔷 trackEvent.ts
│   │   ├── 🟡 🔷 **tsconfig.json**
│   │   └── 📂 uploads/
│   │   │   ├── 🖼️ 1765350790843-yx4o0bn9id.jpeg
│   │   │   ├── 🖼️ 1765350800695-orgybm5jjpb.jpeg
│   │   │   ├── 🖼️ 1765480367339-Screenshot_(11).png
│   │   │   ├── 🖼️ 1765563260423-Screenshot_(11).png
│   │   │   ├── 🖼️ 1765608281166-WhatsApp_Image_2025-09-13_at_11.01.33_PM.jpeg
│   │   │   ├── 🖼️ 1765608911363-WhatsApp_Image_2025-11-01_at_12.51.35_PM.jpeg
│   │   │   ├── 🖼️ 1765609103617-WhatsApp_Image_2025-11-01_at_12.51.35_PM.jpeg
│   │   │   ├── 🖼️ 1765609120298-WhatsApp_Image_2025-09-13_at_11.01.33_PM.jpeg
│   │   │   ├── 🖼️ 1765727807987-WhatsApp_Image_2025-09-13_at_11.01.33_PM.jpeg
│   │   │   ├── 🖼️ 1765727821845-WhatsApp_Image_2025-09-13_at_11.01.33_PM.jpeg
│   │   │   ├── 🖼️ 1765729474497-WhatsApp_Image_2025-11-01_at_12.51.35_PM.jpeg
│   │   │   ├── 🖼️ 1766090299070-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766090723109-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766090745389-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766168031210-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766168385487-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766168405165-Screenshot_(71).png
│   │   │   ├── 🖼️ 1766168465814-Screenshot_(70).png
│   │   │   ├── 🖼️ 1766168989830-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766169139264-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766169294987-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766169771611-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766169940801-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766170048631-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766170341876-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766172899066-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766208423369-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766209623018-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766210335553-7650228.png
│   │   │   ├── 🖼️ 1766210351419-1087741.jpg
│   │   │   ├── 🖼️ 1766211565212-Screenshot_(63).png
│   │   │   ├── 🖼️ 1766211593432-Screenshot_(71).png
│   │   │   ├── 🖼️ 1766212029880-Screenshot_(71).png
│   │   │   ├── 🖼️ 1766212083262-Screenshot_(75).png
│   │   │   ├── 🖼️ 1766212462153-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766212589013-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766213030434-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766213040442-Screenshot_(13).png
│   │   │   ├── 🖼️ 1766213165620-7650228.png
│   │   │   ├── 🖼️ 1766214361360-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766215748160-Screenshot_(125).png
│   │   │   ├── 🖼️ 1766215761237-Screenshot_(13).png
│   │   │   ├── 🖼️ 1766217810609-7650228.png
│   │   │   ├── 🖼️ 1766217871531-7650228.png
│   │   │   ├── 🖼️ 1766217919547-Screenshot_(14).png
│   │   │   ├── 🖼️ 1766218351900-7650228.png
│   │   │   ├── 🖼️ 1766218382190-1087741.jpg
│   │   │   ├── 🖼️ 1766218444805-Screenshot_(1).png
│   │   │   ├── 🖼️ 1766219144693-Screenshot_(124).png
│   │   │   ├── 🖼️ 1766219915251-Screenshot_(70).png
│   │   │   ├── 🖼️ 1766219939436-Screenshot_(125).png
│   │   │   ├── 🖼️ 1766220247439-Screenshot_(71).png
│   │   │   ├── 🖼️ 1766220461783-Screenshot_(13).png
│   │   │   ├── 🖼️ 1766223744597-Screenshot_(239).png
│   │   │   ├── 🖼️ 1766225205304-7650228.png
│   │   │   ├── 🖼️ 1766835777752-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766835839301-7650228.png
│   │   │   ├── 🖼️ 1766840411458-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766840674125-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766841358939-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766841363946-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766841729593-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766841741849-Screenshot_(71).png
│   │   │   ├── 🖼️ 1766841883131-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766842002532-Screenshot_(11).png
│   │   │   ├── 🖼️ 1766842022593-Screenshot_(12).png
│   │   │   ├── 🖼️ 1766842082218-Screenshot_(70).png
│   │   │   └── 🖼️ 1766842159734-Screenshot_(11).png
│   └── 📂 web/
│   │   ├── 🚀 app/
│   │   │   ├── 📂 [handle]/
│   │   │   │   └── 📂 [slug]/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 cancel/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 checkout/
│   │   │   │   ├── ⚛️ CheckoutClient.tsx
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 🧩 components/
│   │   │   │   ├── 📂 dashboard/
│   │   │   │   │   ├── ⚛️ FunnelChart.tsx
│   │   │   │   │   ├── ⚛️ MetricCard.tsx
│   │   │   │   │   ├── ⚛️ PageFunnelChart.tsx
│   │   │   │   │   ├── ⚛️ PageProductTable.tsx
│   │   │   │   │   ├── ⚛️ PageSelector.tsx
│   │   │   │   │   ├── ⚛️ RevenueChart.tsx
│   │   │   │   │   ├── ⚛️ SectionHeader.tsx
│   │   │   │   │   ├── ⚛️ Sidebar.tsx
│   │   │   │   │   ├── ⚛️ SkeletonCard.tsx
│   │   │   │   │   └── ⚛️ Topbar.tsx
│   │   │   │   ├── 📂 landing/
│   │   │   │   │   ├── ⚛️ Brands.tsx
│   │   │   │   │   ├── ⚛️ CTA.tsx
│   │   │   │   │   ├── ⚛️ Features.tsx
│   │   │   │   │   ├── ⚛️ Footer.tsx
│   │   │   │   │   ├── ⚛️ Hero.tsx
│   │   │   │   │   ├── ⚛️ HowItWorks.tsx
│   │   │   │   │   ├── ⚛️ LogoStrip.tsx
│   │   │   │   │   ├── ⚛️ Navbar.tsx
│   │   │   │   │   ├── ⚛️ Pricing.tsx
│   │   │   │   │   ├── ⚛️ SectionWrapper.tsx
│   │   │   │   │   └── ⚛️ Testimonials.tsx
│   │   │   │   ├── ⚛️ PageRenderer.tsx
│   │   │   │   └── ⚛️ PricingCards.tsx
│   │   │   ├── 📂 create/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 dashboard/
│   │   │   │   ├── 📂 admin/
│   │   │   │   │   └── 📂 payouts/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 earnings/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 integrations/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── ⚛️ layout.tsx
│   │   │   │   ├── 📂 page/
│   │   │   │   │   ├── ⚛️ editor.tsx
│   │   │   │   │   └── 📂 preview/
│   │   │   │   │   │   ├── ⚛️ AccessPreview.tsx
│   │   │   │   │   │   ├── ⚛️ FAQPreview.tsx
│   │   │   │   │   │   ├── ⚛️ FeaturesPreview.tsx
│   │   │   │   │   │   ├── ⚛️ HeroPreview.tsx
│   │   │   │   │   │   ├── ⚛️ PricingPreview.tsx
│   │   │   │   │   │   ├── ⚛️ RefundPreview.tsx
│   │   │   │   │   │   └── ⚛️ TestimonialsPreview.tsx
│   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   ├── 📄 pages/
│   │   │   │   │   ├── 📂 [pageId]/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   │   ├── 🧩 components/
│   │   │   │   │   │   ├── ⚛️ AboutBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ AccessBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ BlockContainer.tsx
│   │   │   │   │   │   ├── ⚛️ ContactBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ FAQBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ FeaturesBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ HeroBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ PricingBlockEditor.tsx
│   │   │   │   │   │   ├── ⚛️ RefundBlockEditor.tsx
│   │   │   │   │   │   └── ⚛️ TestimonialsBlockEditor.tsx
│   │   │   │   │   ├── 📂 new/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 payments/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 payouts/
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
│   │   │   ├── 🎨 globals.css
│   │   │   ├── ⚛️ layout.tsx
│   │   │   ├── 📂 login/
│   │   │   │   ├── ⚛️ LoginClient.tsx
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 my-access/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 p/
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 post-login/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 pricing/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 providers/
│   │   │   │   └── ⚛️ AuthProvider.tsx
│   │   │   ├── 🌐 public/
│   │   │   │   ├── 🎨 grid.svg
│   │   │   │   └── 🎨 squiggly.svg
│   │   │   ├── 📂 signup/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 success/
│   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   └── ⚛️ success-client.tsx
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
│   │   ├── 📚 lib/
│   │   │   ├── 🔷 plans.ts
│   │   │   └── 🔷 stripe.ts
│   │   ├── 🔷 next-env.d.ts
│   │   ├── 📄 next.config.mjs
│   │   ├── 🟡 🔒 **package-lock.json**
│   │   ├── 🔴 📦 **package.json**
│   │   ├── 📄 pages/
│   │   │   └── 🔌 api/
│   │   │   │   └── 📂 auth/
│   │   │   │   │   └── 🔷 [...nextauth].ts
│   │   ├── 📜 postcss.config.js
│   │   ├── 🌐 public/
│   │   │   ├── 🖼️ favicon.ico
│   │   │   ├── 🎨 logo.svg
│   │   │   ├── 🖼️ logo2.png
│   │   │   ├── 🎨 logo2.svg
│   │   │   └── 🖼️ og.png
│   │   ├── 🟡 🎨 **tailwind.config.js**
│   │   ├── 🟡 🔷 **tsconfig.json**
│   │   └── 📂 types/
│   │   │   └── 🔷 next-auth.d.ts
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
- 🖼️ Assets: PNG images
- 🖼️ Assets: JPEG images
- ⚛️ React: React TypeScript files
- 🎨 Styles: Stylesheets
- 🎨 Assets: SVG images
- 📜 JavaScript: JavaScript files
- 🖼️ Assets: Icon files
- ⚙️ Config: YAML files

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
