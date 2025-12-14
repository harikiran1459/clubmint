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

function resolveImage(src?: string) {
  if (!src) return null;

  if (src.startsWith("http")) return src;

  // uploaded via your API static route
  return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${src}`;
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
  const containerMax = "max-w-5xl";
  

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* HERO */}
      {sections
        .filter((s) => s.type === "hero")
        .map((s) => {
          const headline = s.data?.headline ?? "Headline";
          const sub = s.data?.subhead ?? "";
          const cta = s.data?.ctaText ?? "Get instant access";
          console.log("HERO IMAGE RAW VALUE:", s.data.image);
          const imageSrc = typeof s.data.image === "string"
            ? s.data.image.startsWith("http")
              ? s.data.image
              : `${process.env.NEXT_PUBLIC_API_URL}${s.data.image}`
            : null;

          return (
            <section
              key={s.id}
              style={{
                background: `linear-gradient(135deg, ${start}, ${end})`,
                color: heroTextColor,
                paddingTop: 96,
                paddingBottom: 120,
              }}
              className="relative overflow-hidden"
            >
              {/* decorative orbs */}
              <div
                ref={orbRef}
                className="pointer-events-none absolute -left-24 -top-40 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 40%)`,
                }}
              />
              <div
                className="pointer-events-none absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full blur-2xl opacity-20"
                style={{
                  background: `radial-gradient(circle at 70% 70%, rgba(0,0,0,0.14), rgba(0,0,0,0.02) 40%)`,
                }}
              />

              <div className="relative z-10 mx-auto px-6">
                <div
                  ref={heroRef}
                  className="mx-auto text-center transition-transform will-change-transform"
                  style={{ maxWidth: 980 }}
                >
                  <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
                    {headline}
                  </h1>

                  <p className="mt-4 text-lg md:text-xl opacity-95 max-w-2xl mx-auto leading-relaxed">
                    {sub}
                  </p>

                  <div className="mt-8 flex justify-center gap-4 items-center flex-wrap">
                    <a
                      href={`/checkout?productIds=${productIds.join(",")}`}
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/90 text-white font-semibold shadow-xl hover:scale-[1.02] transition-transform"
                    >
                      {cta}
                    </a>

                    <a
                      href="#features"
                      className="text-white/90 hover:text-white opacity-90 text-sm"
                    >
                      Learn more ↓
                    </a>
                  </div>

                  {/* optional hero image */}                
                {imageSrc && (  
                  <img
                    src={imageSrc}
                    alt=""
                    className="mx-auto mt-10 max-h-[420px] rounded-3xl shadow-2xl object-cover"
                  />
                )}


                </div>
              </div>
            </section>
          );
        })}

      {/* MAIN */}
      <div className={`mx-auto w-full ${containerMax} py-20 px-6 space-y-20`}>
        {/* FEATURES */}
        {sections
          .filter((s: any) => s.type === "features")
          .map((s: any) => (
            <section id="features" key={s.id} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Features</h2>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {s.data.items?.map((item: string, idx: number) => (
                  // gradient border wrapper: outer has gradient background + small padding
                  <li key={idx} className="rounded-2xl p-[2px]" style={{
                    background: `linear-gradient(135deg, ${start}, ${end})`
                  }}>
                    <div className="bg-white rounded-xl p-6 h-full shadow-sm hover:shadow-md transition">
                      <div className="text-lg font-semibold">{item}</div>
                      <div className="mt-3 text-neutral-600 text-sm">Short detail or benefit description goes here — keep it punchy.</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {/* ACCESS */}
        {sections
          .filter((s: any) => s.type === "access")
          .map((s: any) => (
            <section key={s.id} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Access</h2>

              <div className="flex flex-wrap gap-4">
                {s.data.platforms?.map((p: string) => (
                  <div key={p} className="rounded-2xl p-3 px-5 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 shadow-sm">
                    <div className="font-semibold text-sm">{p.toUpperCase()}</div>
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
      <section key={s.id} className="space-y-8">
        <h2 className="text-3xl font-bold">Pricing</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {ids.map((pid: string) => {
            const product = productsById[pid];
            if (!product) return null;

            return (
              <div key={pid} className="rounded-2xl border p-6 bg-white shadow">
                <div className="text-sm uppercase font-semibold">
                  {product.billingInterval ?? product.title}
                </div>

                <div className="text-4xl font-bold mt-2">
                  {(product.priceCents / 100).toFixed(2)}{" "}
                  {product.currency?.toUpperCase()}
                </div>
<button
  onClick={async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/checkout/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: s.data.productIds,
        }),
      }
    );

    const json = await res.json();
    if (json.url) window.location.href = json.url;
  }}
  className="mt-6 inline-block px-5 py-3 rounded-full bg-black text-white"
>
  Buy now
</button>

              </div>
            );
          })}
        </div>
      </section>
    );
  })}
        {/* TESTIMONIALS - prettier cards */}
        {sections
          .filter((s: any) => s.type === "testimonials")
          .map((s: any) => (
            <section key={s.id} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Testimonials</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {s.data.items?.map((t: any, idx: number) => (
                  <div key={idx} className="rounded-2xl p-[2px]" style={{ background: `linear-gradient(135deg, ${start}, ${end})` }}>
                    <div className="bg-white rounded-xl p-6 shadow-md flex gap-4">
                      <div className="min-w-[56px] min-h-[56px] rounded-full bg-neutral-100 flex items-center justify-center text-lg font-semibold overflow-hidden">
                        {/* avatar fallback: initials */}
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-neutral-800">{(t.name || "U").split(" ").map((p: string)=>p.charAt(0)).slice(0,2).join("")}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-semibold">{t.name || "Anonymous"}</div>
                          <div className="text-sm text-neutral-500">⭐ {t.rating ?? 5}</div>
                        </div>

                        <p className="mt-3 text-neutral-700 leading-relaxed">{t.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

        {/* FAQ */}
        {sections
          .filter((s: any) => s.type === "faq")
          .map((s: any) => (
            <section key={s.id} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">FAQ</h2>

              <div className="space-y-3">
                {s.data.items?.map((faq: any, idx: number) => (
                  <details key={idx} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
                    <summary className="font-semibold cursor-pointer">{faq.q}</summary>
                    <p className="mt-2 text-neutral-700">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

        {/* REFUND */}
        {sections
          .filter((s: any) => s.type === "refund")
          .map((s: any) => (
            <section key={s.id} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Refund Policy</h2>
              <p className="text-neutral-700">{s.data.text}</p>
            </section>
          ))}
      </div>

      {/* small footer */}
      <footer className="py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} — Built with ❤️
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
