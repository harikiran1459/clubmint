// apps/web/app/dashboard/pages/[pageId]/page.tsx
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

// Editor UIs
import HeroBlockEditor from "../components/HeroBlockEditor";
import FeaturesBlockEditor from "../components/FeaturesBlockEditor";
import TestimonialsBlockEditor from "../components/TestimonialsBlockEditor";
import AccessBlockEditor from "../components/AccessBlockEditor";
import PricingBlockEditor from "../components/PricingBlockEditor";
import FAQBlockEditor from "../components/FAQBlockEditor";
import RefundBlockEditor from "../components/RefundBlockEditor";

// Live preview renderer
import PageRenderer from "../../../components/PageRenderer";

type Section = {
  id: string;
  type: string;
  data: any;
};

export default function PageEditorShell() {
  const router = useRouter();
  const params = useParams() as { pageId?: string };
  const { data: session, status } = useSession();
  console.log("🔎 SESSION INSIDE EDITOR:", session);


  const pageId = params?.pageId ?? null;

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<any | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [themeColorStart, setThemeColorStart] = useState("#6a11cb");
  const [themeColorEnd, setThemeColorEnd] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);

  // ───────────────────────────────────────────────
  // LOAD PAGE
  // ───────────────────────────────────────────────
  useEffect(() => {
  if (!pageId || !session?.accessToken) return;

  console.log("🔍 Loading page:", pageId);

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

      if (!json.ok) {
        console.warn("⚠️ No page found, starting blank.");
        setPage(null);
        return;
      }

      const p = json.page;
      setPage(p);
      setTitle(p.title);
      setSlug(p.slug);
      setThemeColorStart(p.themeColor1);
      setThemeColorEnd(p.themeColor2);
      setSections(p.sections ?? []);
      setPublished(Boolean(p.published));

    } catch (err) {
      console.error("Load page error:", err);
    } finally {
      setLoading(false);
    }
  })();
}, [pageId, session?.accessToken]);


  // ───────────────────────────────────────────────
  // SAVE PAGE
  // ───────────────────────────────────────────────
  const savePage = useCallback(async (opts?: { publish?: boolean }) => {
  if (!session?.accessToken) return alert("Not logged in");
  

  const effectiveCreatorId = session.user.creatorId;
  if (!effectiveCreatorId) {
    console.error("❌ No creatorId found in session");
    alert("Creator profile missing. Please re-login.");
    return;
  }

  if (!slug.trim()) {
    return alert("Slug is required");
  }

  if (!title.trim()) {
    return alert("Title is required");
  }

  setSaving(true);

  try {
    const body = {
      id: page?.id ?? undefined,   // undefined means CREATE in backend
      slug,
      title,
      themeColor1: themeColorStart,
      themeColor2: themeColorEnd,
      sections,
      published: opts?.publish ?? published
    };

    console.log("➡️ Saving page with body:", body);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!json.ok) {
      console.error("❌ Save failed:", json.error);
      alert("Save failed: " + json.error);
      return;
    }

    setPage(json.page);
    setPublished(Boolean(json.page.published));

  } catch (err) {
    console.error("❌ Save error:", err);
    alert("Save error—check console");
  } finally {
    setSaving(false);
  }
}, [
  page,
  slug,
  title,
  themeColorStart,
  themeColorEnd,
  sections,
  published,
  session
]);


  // ───────────────────────────────────────────────
  // PUBLISH
  // ───────────────────────────────────────────────
  const togglePublish = async () => {
  if (!page?.id) {
    await savePage();
    return;
  }

  if (!session?.accessToken) return alert("Not logged in");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pages/publish/${page.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ publish: !published }),
      }
    );

    const json = await res.json();

    if (!json.ok) {
      alert("Publish failed: " + json.error);
      return;
    }

    setPublished(Boolean(json.page.published));

  } catch (err) {
    console.error("Publish error:", err);
  }
};


  // ───────────────────────────────────────────────
  // DRAG & DROP
  // ───────────────────────────────────────────────
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const next = Array.from(sections);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setSections(next);
  };

  // ───────────────────────────────────────────────
  // BLOCK CREATION
  // ───────────────────────────────────────────────
  function createBlock(type: string): Section {
    return {
      id: uuidv4(),
      type,
      data:
        {
          hero: {
            headline: "Headline",
            subhead: "Subheadline",
            image: null,
            ctaText: "Get instant access",
          },
          features: { items: ["Feature 1", "Feature 2"] },
          testimonials: { items: [] },
          access: { platforms: ["telegram"] },
          pricing: { currency: "USD", plans: [{ amount: 9, interval: "monthly" }] },
          faq: { items: [{ q: "Question?", a: "Answer." }] },
          refund: { text: "14-day refund policy" },
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

  // ───────────────────────────────────────────────
  // BLOCK EDITOR ROUTER
  // ───────────────────────────────────────────────
  function renderEditor(block: Section) {
    const props = { block, onChange: (d: any) => updateBlock(block.id, d) };

    switch (block.type) {
      case "hero":
        return <HeroBlockEditor {...props} />;
      case "features":
        return <FeaturesBlockEditor {...props} />;
      case "testimonials":
        return <TestimonialsBlockEditor {...props} />;
      case "access":
        return <AccessBlockEditor {...props} />;
      case "pricing":
        return <PricingBlockEditor {...props} />;
      case "faq":
        return <FAQBlockEditor {...props} />;
      case "refund":
        return <RefundBlockEditor {...props} />;
      default:
        return <div className="text-red-400">Unknown block</div>;
    }
  }
  console.log("CREATOR HANDLE:", page?.creatorHandle);
  console.log("SESSION CREATOR ID:", session?.user?.creatorId);
  const creatorHandle = page?.creatorHandle;
  console.log("Final handle:", creatorHandle);



  // ───────────────────────────────────────────────
  // PAGE UI
  // ───────────────────────────────────────────────

  if (status === "loading" || loading)
    return (
      <div className="text-white p-10 text-center text-xl">Loading editor…</div>
    );
    console.log("LIVE PAGE DATA:", page);

  return (
    <div className="grid grid-cols-[260px_1fr_420px] gap-6 p-6 min-h-screen bg-0e0e0e text-black">

      {/* LEFT PANEL */}
      <aside className="bg-neutral-100 border border-neutral-300 rounded-2xl p-6 shadow-xl space-y-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-1 py-1 rounded-lg bg-purple-500 text-white border-neutral-700 hover:bg-purple-800 shadow-lg font-small"
        >
          ← Back to Dashboard
        </button>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-neutral-800 text-sm">Page Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-100 border border-neutral-400 text-neutral-700 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="text-neutral-800 text-sm">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-100 border border-neutral-400 text-neutral-700 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Gradient Start */}
        <div className="space-y-2">
          <label className="text-neutral-800 text-sm">Gradient Start</label>
          <input
            type="color"
            value={themeColorStart}
            onChange={(e) => setThemeColorStart(e.target.value)}
            className="h-12 w-full rounded-md bg-neutral-100 border border-neutral-700 cursor-pointer"
          />
        </div>

        {/* Gradient End */}
        <div className="space-y-2">
          <label className="text-neutral-800 text-sm">Gradient End</label>
          <input
            type="color"
            value={themeColorEnd}
            onChange={(e) => setThemeColorEnd(e.target.value)}
            className="h-12 w-full rounded-md bg-neutral-100 border border-neutral-700 cursor-pointer"
          />
        </div>
        

        {/* Save / Publish */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => savePage()}
            disabled={saving}
            className="px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-800 shadow-lg font-medium"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={togglePublish}
            className="px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-800"
          >
            {published ? "Unpublish" : "Publish"}
          </button>
        </div>

        {/* VIEW LIVE PAGE BUTTON */}
        
{slug && page?.creatorHandle &&(
  
  <a
    href={
      published
        ? `/${creatorHandle}/${slug}`
        : undefined
    }
    target="_blank"
    rel="noopener noreferrer"
    className={`
      block text-center mt-2 px-4 py-3 rounded-lg font-medium transition
      ${published
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-neutral-800 text-neutral-500 cursor-not-allowed pointer-events-none"
      }
    `}
  >
    {published ? "View Live Page" : "Publish to View"}
  </a>
)}


        {/* <div className="text-neutral-500 text-xs pt-4">
          Preview Link:
          <div className="mt-1 break-all text-neutral-300">
            {page
              ? `${process.env.NEXT_PUBLIC_APP_URL}/${page.creatorId}/${page.slug ?? slug}`
              : "—"}
          </div>
        </div> */}
      </aside>

      {/* CENTER LIVE PREVIEW */}
      <main className="rounded-xl bg-neutral-100 border border-neutral-300 shadow overflow-auto">
        <PageRenderer page={{ title, themeColor1: themeColorStart, themeColor2: themeColorEnd, sections }} editorMode />

      </main>

      {/* RIGHT PANEL */}
      <aside className="space-y-6">

        {/* Add Block */}
        <div className="bg-white rounded-xl p-5 border border-neutral-300 shadow space-y-4">
          <h3 className="font-semibold text-lg">Add Blocks</h3>

          <div className="flex flex-wrap gap-2">
            {[
              ["hero", "Hero"],
              ["features", "Features"],
              ["testimonials", "Testimonials"],
              ["faq", "FAQ"],
              ["pricing", "Pricing"],
              ["access", "Access"],
              ["refund", "Refund"],
            ].map(([type, label]) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="px-4 py-2 rounded-lg bg-purple-600 border text-white border-neutral-300 hover:bg-purple-900 text-sm"
              >
                + {label}
              </button>
            ))}
          </div>
        </div>

        {/* Block Editors */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="blocks-droppable">
            {(provided) => (
              <div
                className="space-y-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {sections.map((block, idx) => (
                  <Draggable key={block.id} draggableId={block.id} index={idx}>
                    {(dr) => (
                      <div
                        ref={dr.innerRef}
                        {...dr.draggableProps}
                        className="p-4 rounded-2xl bg-white border border-neutral-300 shadow-sm"
                        style={{ ...dr.draggableProps.style }}
                      >
                        {/* Block Header */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              {...dr.dragHandleProps}
                              className="text-neutral-400 hover:text-neutral-600 cursor-grab"
                            >
                              ☰
                            </div>

                            <div className="font-semibold capitalize text-neutral-700">
                              {block.type}
                            </div>
                          </div>

                          <button
                            onClick={() => removeBlock(block.id)}
                            className="px-2 py-1 rounded bg-red-50 text-red-600 border border-red-300 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Block Editor UI */}
                        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                          {renderEditor(block)}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </aside>
    </div>
  );
}
