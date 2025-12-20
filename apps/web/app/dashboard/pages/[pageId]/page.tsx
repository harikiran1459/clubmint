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

  // ───────────────────────────
  // LOAD PAGE
  // ───────────────────────────
  useEffect(() => {
    if (!pageId || !session?.accessToken) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/by-id/${pageId}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
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
  }, [pageId, session?.accessToken]);

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
      if (!session?.accessToken) return alert("Not logged in");
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
              Authorization: `Bearer ${session.accessToken}`,
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
          Authorization: `Bearer ${session?.accessToken}`,
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
          className="text-sm underline"
        >
          ← Back to Pages
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
                        <div className="flex justify-between mb-3">
                          <div
                            {...d.dragHandleProps}
                            className="cursor-grab text-neutral-400"
                          >
                            ☰
                          </div>
                          <button
                            onClick={() => removeBlock(block.id)}
                            className="text-xs text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                        {renderEditor(block)}
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
