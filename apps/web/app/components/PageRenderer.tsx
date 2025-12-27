"use client";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/**
 * Premium PageRenderer with:
 * - Hero parallax + orb accents
 * - Animated counters
 * - Gradient borders on cards
 * - Polished testimonial cards with avatars & star rating
 * - Smooth entrance animations
 *
 * Usage: drop-in replacement for existing PageRenderer
 */

// small helper: choose readable text color based on hex luminance

function getReadableTextColor(hex: string) {
  try {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#111" : "#fff";
  } catch {
    return "#fff";
  }
}

function AnimatedPrice({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) {
  const value = useAnimatedNumber(amount, 900);

  return (
    <div className="flex items-baseline gap-2">
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-lg text-neutral-600">{currency}</div>
    </div>
  );
}

export function resolveImage(src?: string): string | undefined {
  if (!src) return undefined;

  // Absolute URLs (R2, S3, external)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Legacy local uploads (dev only)
  if (src.startsWith("/uploads")) {
    return `${process.env.NEXT_PUBLIC_API_URL}${src}`;
  }

  return undefined;
}


function pageBackgroundFromTheme(start?: string, end?: string) {
  const c1 = start ?? "#6a11cb";
  const c2 = end ?? "#ec4899";

  return `
    radial-gradient(circle at 15% 10%, ${c1}22, transparent 42%),
    radial-gradient(circle at 85% 30%, ${c2}1f, transparent 45%),
    radial-gradient(circle at 50% 80%, ${c1}14, transparent 50%),
    linear-gradient(to bottom, #fafafa, #ffffff)
  `;
}


function resolveYouTubeEmbed(url: string) {
  try {
    if (url.includes("youtube.com/embed")) return url;

    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function resolveMediaUrl(url?: string) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}



// Animate a number from 0->target using requestAnimationFrame
function useAnimatedNumber(target: number | undefined, duration = 900) {
  const [value, setValue] = useState<number>(target ? 0 : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== "number") return;
    const start = performance.now();
    const from = 0;
    const to = target;

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      setValue(cur);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

export default function PageRenderer({
  page,
  editorMode = false,
}: {
  page: any;
  editorMode?: boolean;
}) {
  const sections = page?.sections ?? [];
  const start = page.themeColor1 ?? "#6a11cb";
  const end = page.themeColor2 ?? "#2575fc";
  const heroTextColor = getReadableTextColor(start);
  const [productsById, setProductsById] = useState<Record<string, any>>({});
  const productIds = Array.from(
  new Set(
    (page.sections ?? [])
      .filter((s: any) => s.type === "pricing")
      .flatMap((s: any) => s.data?.productIds || [])
  )
);

  // Parallax refs
  const heroRef = useRef<HTMLDivElement | null>(null);
  const orbRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // simple parallax effect: translateY on hero content and orbs
    function onScroll() {
      const y = window.scrollY;
      if (heroRef.current) {
        // small translate on hero inner content
        const t = Math.min(y * 0.15, 60);
        heroRef.current.style.transform = `translateY(${t}px)`;
      }
      if (orbRef.current) {
        const t2 = Math.min(y * 0.08, 80);
        orbRef.current.style.transform = `translateY(${t2}px) rotate(${t2 / 6}deg)`;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  
 useEffect(() => {
  if (productIds.length === 0) return;

  let cancelled = false;

  async function loadProducts() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/by-ids`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        }
      );

      const json = await res.json();
      if (!json.ok) return;

      if (!cancelled) {
        const map: Record<string, any> = {};
        json.products.forEach((p: any) => {
          map[p.id] = p;
        });
        setProductsById(map);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  loadProducts();
  return () => {
    cancelled = true;
  };
}, [productIds.join(","), editorMode]);



  // layout utilities
  const containerMax = "max-w-8xl";
  

  return (
    <div
  className="w-full min-h-screen text-neutral-900"
  style={{
    background: pageBackgroundFromTheme(
      page.themeColor1,
      page.themeColor2
    ),
  }}
>
<div
  className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
  style={{
    backgroundImage:
      "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==)",
  }}
/>

      {/* HERO */}
{sections
  .filter((s) => s.type === "hero")
  .map((s) => {
    const d = s.data || {};
    
    function handleHeroCTA() {
  if (s.data?.ctaAction === "scroll_to_features") {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  } else if (s.data?.ctaAction === "external_link") {
    window.open(s.data?.ctaUrl, "_blank");
  } else {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  }
}


    const bgStyle =
      d.backgroundType === "image" && d.backgroundImage
        ? {
            backgroundImage: `url(${d.backgroundImage.startsWith("http")
              ? d.backgroundImage
              : `${process.env.NEXT_PUBLIC_API_URL}${d.backgroundImage}`
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : {
            background: `linear-gradient(135deg, ${start}, ${end})`,
          };

    const heroImg =
      d.heroImage &&
      (d.heroImage.startsWith("http")
        ? d.heroImage
        : `${process.env.NEXT_PUBLIC_API_URL}${d.heroImage}`);
    const hasHeroImage = Boolean(heroImg);
    const imageAlign = d.heroImageAlign ?? "right"; // left | right | center
    const isStacked = !hasHeroImage || imageAlign === "center";


    return (
      <section
  key={s.id}
  className="relative overflow-hidden"
  style={{ ...bgStyle, paddingTop: 48, paddingBottom: 96 }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Topbar */}
  <div className="relative z-20 max-w-[1400px] mx-auto px-4 flex items-center justify-between">
    <div className="text-2xl font-bold text-white tracking-tight">
      {page.creatorCompany ?? page.title}
    </div>

    <div className="flex items-center gap-6">
  <nav className="hidden md:flex gap-8 text-white/90 text-base font-medium">
    {(d.links ?? []).map((l: any, i: number) => (
      <a key={i} href={l.href} className="hover:text-white transition">
        {l.label}
      </a>
    ))}
  </nav>

  {!editorMode && (
    <a
  href="/login"
  target="_blank"
  rel="noopener noreferrer"
  className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition"
>
  Login
</a>
  )}
</div>

  </div>

  {/* Hero content */}
  <div
  className={clsx(
    "relative z-10 max-w-[1400px] mx-auto px-4 mt-20 gap-12 items-center",
    {
      // No image OR center image → stacked + centered
      "grid grid-cols-1 text-center place-items-center":
        isStacked,

      // Left / right image → 2 column layout
      "grid grid-cols-1 md:grid-cols-2":
        hasHeroImage && !isStacked,
    }
  )}
>


    {/* Text */}
    <div
  className={clsx(
    "flex flex-col gap-6",
    {
      "items-center justify-center min-h-[420px]":
        !hasHeroImage,

      "text-center items-center":
        imageAlign === "center",

      "items-start text-left":
        hasHeroImage && imageAlign !== "center",
    }
  )}
>


      <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
        {d.headline}
      </h1>

      <p className="mt-5 text-xl text-white/90 max-w-xl">
        {d.subhead}
      </p>

      <div className="mt-8">
        <button
  onClick={handleHeroCTA}
  className="px-7 py-4 rounded-full bg-white text-black text-lg font-semibold shadow-xl"
>
  {d.ctaText}
</button>

      </div>
    </div>

    {/* Image */}
    {hasHeroImage && (
  <div
    className={clsx({
      "md:order-1": imageAlign === "left",
      "md:order-2": imageAlign === "right",
      "order-2": imageAlign === "center",
    })}
  >
    <img
      src={heroImg}
      className="w-full max-h-[520px] rounded-3xl shadow-2xl mx-auto"
      style={{ objectFit: d.heroImageFit ?? "contain" }}
    />
  </div>
)}

  </div>
</section>

    );
  })}

      {/* MAIN */}
      <div className={`mx-auto w-full ${containerMax} py-16 px-4 sm:px-6 lg:px-8 space-y-16`}>

      {/* ABOUT */ }
      {sections.filter((s:any)=>s.type==="about").map((s:any)=> {
  const mediaUrl = s.data.mediaUrl;
  const ytEmbed = mediaUrl ? resolveYouTubeEmbed(mediaUrl) : null;
  const isLocalVideo = mediaUrl?.endsWith(".mp4") || mediaUrl?.endsWith(".webm");
  const imgSrc =
  s.data?.mediaType === "image"
    ? resolveImage(s.data?.mediaUrl)
    : null;

  const ytvideoSrc = resolveYouTubeEmbed(s.data?.video);
  const videoSrc = resolveMediaUrl(s.data?.video);

  return (
    <section key={s.id} className="py-0">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="py-0 text-4xl md:text-5xl text-center font-extrabold tracking-tight">
          {s.data.headline}
        </h2>

        <p className="mt-6 text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto">
          {s.data.text}
        </p>

        {/* MEDIA BELOW TEXT */}
        <div className="mt-12">
          {ytEmbed && (
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src={ytEmbed}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
          

          {!ytEmbed && isLocalVideo && videoSrc &&(
            <video
              src={videoSrc}
              controls
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl"
            />
          )}

          {!ytEmbed && !isLocalVideo && mediaUrl && imgSrc &&(
            <img
              src={imgSrc}
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
})}


        {/* FEATURES */}
          {sections
  .filter((s: any) => s.type === "features")
  .map((s: any) => {
    const layout = s.data?.layout ?? "grid";
    const items = s.data?.items ?? [];

    return (
      <section
        id="features"
        key={s.id}
        className="space-y-16"
      >
        <h2 className="py-10 text-4xl md:text-5xl text-center font-extrabold tracking-tight">
            Features
        </h2>

        {/* GRID LAYOUT */}
        {layout === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item: any, idx: number) => (
              <li
  key={idx}
  className="rounded-2xl p-[2px]"
  style={{
    background: `linear-gradient(135deg, ${start}, ${end})`,
  }}
>
  <div className="bg-white rounded-xl p-6 h-full shadow-sm">
    {/* IMAGE (NEW – THIS IS THE FIX) */}
    {item.image && (
      <img
        src={
          item.image.startsWith("http")
            ? item.image
            : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`
        }
        alt=""
        className="w-auto h-auto object-cover rounded-xl mb-4"
      />
    )}

    <h3 className="text-xl font-semibold text-neutral-900">
      {item.title}
    </h3>

    {item.description && (
      <p className="mt-3 text-neutral-600 leading-relaxed">
        {item.description}
      </p>
    )}
  </div>
</li>

            ))}
          </div>
        )}

        {/* SPLIT LAYOUT */}
        {layout === "split" && (
          <div className="space-y-24">
            {items.map((item: any, idx: number) => {
              const reverse = idx % 2 === 1;
              const imgSrc =
                typeof item.image === "string" && item.image
                  ? item.image.startsWith("http")
                    ? item.image
                    : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`
                  : null;

              return (
                <div
                  key={idx}
                  className={`grid md:grid-cols-2 gap-10 items-center ${
                    reverse ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* TEXT */}
                  <div
                    className={`space-y-4 ${
                      reverse ? "md:order-2" : ""
                    } animate-fade-in`}
                  >
                    <h3 className="text-4xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-xl text-neutral-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* IMAGE */}
                  {imgSrc && (
                    <div
                      className={`rounded-3xl overflow-hidden shadow-xl ${
                        reverse ? "md:order-1" : ""
                      } animate-fade-in`}
                    >
                      <img
                        src={imgSrc}
                        alt=""
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  })}

        {/* ACCESS */}
        {sections
          .filter((s: any) => s.type === "access")
          .map((s: any) => (
            <section key={s.id} className="space-y-8 ">
      <div >
            <h2 className="py-10 text-4xl md:text-5xl text-center font-extrabold tracking-tight">
                {s.data.headline ?? "Instant Access"}
            </h2>
        <p className="mt-3 text-center text-neutral-600 text-lg">
          {s.data.subtext ?? "Get access immediately after purchase"}
        </p>
      </div>

  <div className="flex flex-wrap gap-4 items-center justify-center">
    {s.data.platforms?.map((p: string) => (
      <div
        key={p}
        className="flex items-center gap-3 px-5 py-4 rounded-2xl
                   bg-white border shadow-sm"
        style={{
          borderImage: `linear-gradient(135deg, ${start}, ${end}) 1`,
        }}
      >
        <div className="text-lg font-semibold">
          {p.toUpperCase()}
        </div>
        <div className="text-sm text-neutral-500">
          Instant • Secure
        </div>
      </div>
    ))}
  </div>
</section>

          ))}

        {/* PRICING with animated counters */}
       {sections
  .filter((s) => s.type === "pricing")
  .map((s) => {
    const ids = s.data?.productIds || [];
    if (ids.length === 0) return null;

    return (
      <section key={s.id} className="space-y-10">
        <h2 className="py-10 text-4xl md:text-5xl text-center font-extrabold tracking-tight">
            Pricing
        </h2>

        <div className="flex grid-cols-1 md:grid-cols-3 gap-8 items-center justify-center">
          {ids.map((pid: string, idx: number) => {
            const product = productsById[pid];
            if (!product) return null;

            const isFeatured = idx === 1; // middle plan highlighted

            return (
              <div
                key={pid}
                className={`relative w-full md:w-1/3 rounded-3xl p-[2px] ${
                  isFeatured ? "scale-[1.03]" : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, ${start}, ${end})`,
                }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl h-full flex flex-col">
                  {isFeatured && (
                    <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-purple-600">
                      Most Popular
                    </div>
                  )}

                  <div className="text-2xl font-semibold text-neutral-900">
                    {product.title}
                  </div>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-extrabold">
                      ${(product.priceCents / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-neutral-500 mb-1">
                      /{product.billingInterval ?? "month"}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                    {s.data?.benefits?.map((b: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={async () => {
  const ids = s.data?.productIds;

  if (!Array.isArray(ids) || ids.length === 0) {
    alert("No products linked to this pricing block");
    return;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/checkout/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    }
  );

  const json = await res.json();

  if (!json.ok) {
    alert(json.error || "Checkout failed");
    return;
  }

  // Razorpay flow continues here
  console.log("Checkout created:", json);
  const options = {
  key: json.key,
  amount: json.amount,
  currency: json.currency,
  name: "ClubMint",
  description: json.productTitles.join(", "),
  order_id: json.orderId,

  handler: function () {
    // success handled via webhook
    window.location.href = "/success";
  },

  theme: {
    color: "#7c3aed",
  },
};

const rzp = new (window as any).Razorpay(options);
rzp.open();
}}
                    className={`mt-8 w-auto py-3 rounded-full font-semibold transition ${
                      isFeatured
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    Get Access
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  })}

  
        {/* TESTIMONIALS */}
{sections
  .filter((s: any) => s.type === "testimonials")
  .map((s: any) => (
    <section key={s.id} className="w-full">
      <h2 className="text-4xl md:text-5xl py-10 text-center font-extrabold tracking-tight">
            Testimonials
        </h2>
      <div className=" relative overflow-hidden rounded-3xl">
        <div className="flex overflow-x-auto snap-x snap-mandatory">
          {s.data.items?.map((t: any, idx: number) => {
            const avatarSrc =
  typeof t.avatar === "string" && t.avatar.length > 0
    ? resolveImage(t.avatar)
    : undefined;


            const bg = t.theme ?? "#ef4444";

            return (
              <div
                key={idx}
                className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] snap-start p-10 text-black relative"
                style={{ background: bg }}
              >

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/30">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg">
                        {(t.name || "U")
                          .split(" ")
                          .map((p: string) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-xl">
                      {t.name}
                    </div>
                   
                  </div>
                </div>

                {/* Quote */}
                <p className="text-lg leading-relaxed max-w-md">
                  “{t.text}”
                </p>

                {/* Rating */}
                <div className="mt-6 flex gap-1 text-xl">
                  {Array.from({ length: t.rating ?? 5 }).map(
                    (_, i) => (
                      <span key={i}>⭐</span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll hint */}
        {/* <div className="absolute bottom-4 right-6 text-sm opacity-70">
          ← swipe →
        </div> */}
      </div>
    </section>
  ))}


        {/* FAQ */}
        {sections
          .filter((s: any) => s.type === "faq")
          .map((s: any) => (
            <section key={s.id} className="space-y-6">
  <h2 className="py-10 text-4xl md:text-5xl text-center font-extrabold tracking-tight">
    Frequently Asked Questions
  </h2>

  <div className="space-y-4">
    {s.data.items?.map((faq: any, idx: number) => (
      <details
        key={idx}
        className="group rounded-2xl border bg-white p-6"
      >
        <summary className="cursor-pointer list-none flex items-center justify-between">
          <span className="text-lg font-semibold">
            {faq.q}
          </span>
          <span className="text-neutral-400 group-open:rotate-180 transition">
            ▼
          </span>
        </summary>

        <p className="mt-4 text-neutral-600 leading-relaxed">
          {faq.a}
        </p>
      </details>
    ))}
  </div>
</section>

          ))}

        {/* REFUND */}
        {sections
          .filter((s: any) => s.type === "refund")
          .map((s: any) => (
            <section key={s.id} className="space-y-2">
              <h2 className="py-10 text-4xl md:text-5xl text-center font-extrabold tracking-tight">Refund Policy</h2>
              <p className="text-neutral-700 text-center text-xl">{s.data.text}</p>
            </section>
          ))}


            {/* Contact Us */}
      {sections
  .filter((s: any) => s.type === "contact")
  .map((s: any) => (
    <section key={s.id} className="space-y-3">
      <h2 className="py-10 text-4xl md:text-5xl text-center font-extrabold tracking-tight">
        {s.data.headline}
      </h2>

      <div className="space-y-3 text-lg items-center justify-center text-center">
        {s.data.email && (
          <div>
            📧{" "}
            <a
              href={`mailto:${s.data.email}`}
              className="text-purple-600 underline"
            >
              {s.data.email}
            </a>
          </div>
        )}

        {s.data.phone && <div>📞 {s.data.phone}</div>}

        {s.data.address && (
          <div className="text-neutral-600">
            📍 {s.data.address}
          </div>
        )}
      </div>
    </section>
  ))}

      </div>

      




      {/* small footer */}
      <footer className="py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} — Built with ❤️ by Clubmint
      </footer>

      {/* Minimal animations (Tailwind utilities assumed, but fallback works) */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeUp 520ms ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
