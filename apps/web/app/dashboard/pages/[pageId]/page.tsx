"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";

// Block editors
import HeroBlockEditor from "../components/HeroBlockEditor";
import FeaturesBlockEditor from "../components/FeaturesBlockEditor";
import TestimonialsBlockEditor from "../components/TestimonialsBlockEditor";
import AccessBlockEditor from "../components/AccessBlockEditor";
import PricingBlockEditor from "../components/PricingBlockEditor";
import FAQBlockEditor from "../components/FAQBlockEditor";
import RefundBlockEditor from "../components/RefundBlockEditor";
import ContactBlockEditor from "../components/ContactBlockEditor";
import AboutBlockEditor from "../components/AboutBlockEditor";


// Live preview
import PageRenderer from "../../../components/PageRenderer";

type Section = {
  id: string;
  type: string;
  data: any;
};

export default function PageEditorShell() {
  const router = useRouter();
  const { pageId } = useParams() as { pageId?: string };
  const { data: session, status } = useSession();
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<any | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [themeColorStart, setThemeColorStart] = useState("#6a11cb");
  const [themeColorEnd, setThemeColorEnd] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);

  const creatorHandle =
    page?.creatorHandle ?? session?.user?.creatorHandle ?? null;

    const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  access: "Access / CTA",
  faq: "FAQ",
  refund: "Refund Policy",
  contact: "Contact",
};

function toggleCollapse(id: string) {
  setCollapsedBlocks((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
}


  // ───────────────────────────
  // LOAD PAGE
  // ───────────────────────────
  useEffect(() => {
    if (!pageId || !session?.user?.accessToken) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/by-id/${pageId}`,
          {
            headers: {
              Authorization: `Bearer ${session.user?.accessToken}`,
            },
          }
        );

        const json = await res.json();
        if (!json.ok) return;

        const p = json.page;
        setPage(p);
        setTitle(p.title ?? "");
        setSlug(p.slug ?? "");
        setThemeColorStart(p.themeColor1 ?? "#6a11cb");
        setThemeColorEnd(p.themeColor2 ?? "#000000");
        const normalizedSections = (p.sections ?? []).map((s: any) => {
  if (s.type === "features") {
    return {
      ...s,
      data: {
        layout: s.data?.layout ?? "grid",
        items: s.data?.items ?? [],
      },
    };
  }
  return s;
});

setSections(normalizedSections);

        setPublished(Boolean(p.published));
      } catch (err) {
        console.error("Load page error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [pageId, session?.user?.accessToken]);

  // ───────────────────────────
  // AUTO SLUG (first time only)
  // ───────────────────────────
  useEffect(() => {
    if (!page && title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [title]);

  // ───────────────────────────
  // SAVE PAGE
  // ───────────────────────────
  const savePage = useCallback(
    async (opts?: { publish?: boolean }) => {
      if (!session?.user?.accessToken) return alert("Not logged in");
      if (!title.trim()) return alert("Title is required");
      if (!slug.trim()) return alert("Slug is required");

      setSaving(true);
      try {
        const body = {
          id: page?.id,
          title,
          slug,
          themeColor1: themeColorStart,
          themeColor2: themeColorEnd,
          sections,
          published: opts?.publish ?? published,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.user?.accessToken}`,
            },
            body: JSON.stringify(body),
          }
        );

        const json = await res.json();
        if (!json.ok) {
          alert("Save failed");
          return;
        }

        setPage(json.page);
        setPublished(Boolean(json.page.published));
      } catch (err) {
        console.error("Save error:", err);
        alert("Save error");
      } finally {
        setSaving(false);
      }
    },
    [
      page,
      title,
      slug,
      themeColorStart,
      themeColorEnd,
      sections,
      published,
      session,
    ]
  );

  // ───────────────────────────
  // PUBLISH
  // ───────────────────────────
  async function togglePublish() {
    if (!page?.id) {
      await savePage({ publish: true });
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pages/publish/${page.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ publish: !published }),
      }
    );

    const json = await res.json();
    if (json.ok) setPublished(Boolean(json.page.published));
  }

  // ───────────────────────────
  // DRAG & DROP
  // ───────────────────────────
  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const next = Array.from(sections);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setSections(next);
  }

  // ───────────────────────────
  // BLOCK MANAGEMENT
  // ───────────────────────────
  function createBlock(type: string): Section {
    return {
      id: uuidv4(),
      type,
      data:
        {
          hero: {
            headline: "Headline",
            subhead: "Short subheading",
            ctaText: "Get instant access",
          },
          about: {},
          features: { items: ["Feature 1", "Feature 2"] },
          testimonials: { items: [] },
          pricing: { currency: "USD", plans: [] },
          access: {},
          faq: { items: [] },
          refund: { text: "14-day refund policy" },
          contact: {},
        }[type] ?? {},
    };
  }

  function addBlock(type: string) {
    setSections((prev) => [...prev, createBlock(type)]);
  }

  function updateBlock(id: string, data: any) {
    setSections((prev) =>
      prev.map((b) => (b.id === id ? { ...b, data } : b))
    );
  }

  function removeBlock(id: string) {
    setSections((prev) => prev.filter((b) => b.id !== id));
  }

  function renderEditor(block: Section) {
    const props = { block, onChange: (d: any) => updateBlock(block.id, d) };
    switch (block.type) {
      case "hero":
        return <HeroBlockEditor {...props} />;
      case "about":
        return <AboutBlockEditor {...props} />;
      case "features":
        return <FeaturesBlockEditor {...props} />;
      case "testimonials":
        return <TestimonialsBlockEditor {...props} />;
      case "pricing":
        return <PricingBlockEditor {...props} />;
      case "access":
        return <AccessBlockEditor {...props} />;
      case "faq":
        return <FAQBlockEditor {...props} />;
      case "refund":
        return <RefundBlockEditor {...props} />;
      case "contact":
        return <ContactBlockEditor {...props} />;
            default:
        return null;
    }
  }

  if (loading || status === "loading") {
    return <div className="p-10 text-center">Loading editor…</div>;
  }

  // ───────────────────────────
  // UI
  // ───────────────────────────
  return (
    <div className="grid grid-cols-[280px_1fr_420px] gap-6 p-6 min-h-screen bg-neutral-100 text-neutral-900">
      {/* LEFT: SETTINGS */}
      <aside className="space-y-6">
        <button
  onClick={() => router.push("/dashboard/pages")}
  className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-xs hover:shadow-sm hover:border-gray-300 transition-all duration-300 flex items-center gap-2.5 group hover:-translate-y-0.5"
>
  <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-200">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  </div>
  <span>Back to Pages</span>
</button>

        <div className="bg-white text-neutral-900 rounded-xl p-4 border border-neutral-200 shadow-sm space-y-4">
          <h4 className="font-semibold">Basics</h4>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
            className="w-full p-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="page-slug"
            className="w-full p-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="bg-white text-neutral-900 rounded-xl p-4 border border-neutral-200 shadow-sm space-y-4">
          <h4 className="font-semibold">Theme</h4>

          <input
            type="color"
            value={themeColorStart}
            onChange={(e) => setThemeColorStart(e.target.value)}
            className="w-full h-10"
          />

          <input
            type="color"
            value={themeColorEnd}
            onChange={(e) => setThemeColorEnd(e.target.value)}
            className="w-full h-10"
          />
        </div>

        <div className="bg-white text-neutral-900 rounded-xl p-4 border border-neutral-200 shadow-sm space-y-3">
          <button
            onClick={() => savePage()}
            className="w-full py-3 rounded-lg bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
          >
            Save Draft
          </button>

          <button
            onClick={togglePublish}
            className={`w-full py-3 rounded-lg text-white ${
  published ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
}`}
          >
            {published ? "Unpublish" : "Publish"}
          </button>

          {published && creatorHandle && (
            <a
              href={`/${creatorHandle}/${slug}`}
              target="_blank"
              className="block text-center text-green-600 text-sm hover:text-blue-900"
            >
              View Live Page
            </a>
          )}
        </div>
      </aside>

      {/* CENTER: LIVE PREVIEW */}
      <main className="rounded-xl bg-white border shadow overflow-auto">
        <div className="sticky top-0 bg-neutral-200 border-b border-neutral-200 px-4 py-2 font-medium text-neutral-700">
          Live Preview
        </div>
        <PageRenderer
          page={{
            title,
            themeColor1: themeColorStart,
            themeColor2: themeColorEnd,
            sections,
          }}
          editorMode
        />
      </main>

      {/* RIGHT: BLOCKS */}
      <aside className="space-y-6">
        <div className="bg-white text-neutral-900 rounded-xl p-4 border border-neutral-200 shadow-sm space-y-4">

          <h4 className="font-semibold mb-3">Add Sections</h4>
          <div className="flex flex-wrap gap-2">
            {[
              ["hero", "Hero"],
              ["about", "About"],
              ["features", "Features"],
              ["testimonials", "Testimonials"],
              ["pricing", "Pricing"],
              ["access", "Access"],
              ["faq", "FAQ"],
              ["refund", "Refund"],
              ["contact", "Contact"],
            ].map(([type, label]) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm"
              >
                + {label}
              </button>
            ))}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="blocks">
            {(p) => (
              <div ref={p.innerRef} {...p.droppableProps} className="space-y-4">
                {sections.map((block, idx) => (
                  <Draggable key={block.id} draggableId={block.id} index={idx}>
                    {(d) => (
                      <div
                        ref={d.innerRef}
                        {...d.draggableProps}
                        className="bg-white text-neutral-900 rounded-xl p-4 border border-neutral-200 shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              {...d.dragHandleProps}
                              className="cursor-grab text-neutral-400"
                            >
                              ☰
                            </div>

                            <span className="font-semibold text-m px-2 rounded-full">
                              {SECTION_LABELS[block.type] ?? block.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                          <button
  onClick={() => removeBlock(block.id)}
  className="p-2 text-red-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
  title="Delete"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
</button>
                          <button
                            onClick={() => toggleCollapse(block.id)}
                            className="text-s text-neutral-500 hover:text-neutral-800"
                          >
                            {collapsedBlocks[block.id] ? "▼" : "▲"}
                          </button>
                          </div>

                        </div>
                          {!collapsedBlocks[block.id] && (
                            <div className="pt-2">
                              {renderEditor(block)}
                            </div>
                          )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {p.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </aside>
    </div>
  );
}


