// "use client";

// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import update from "immutability-helper";

// // Block Editors
// import HeroBlockEditor from "../pages/components/HeroBlockEditor";
// import FeaturesBlockEditor from "../pages/components/FeaturesBlockEditor";
// import TestimonialsBlockEditor from "../pages/components/TestimonialsBlockEditor";
// import FAQBlockEditor from "../pages/components/FAQBlockEditor";
// import PricingBlockEditor from "../pages/components/PricingBlockEditor";
// import AccessBlockEditor from "../pages/components/AccessBlockEditor";
// import RefundBlockEditor from "../pages/components/RefundBlockEditor";

// // Preview Components
// import HeroPreview from "./preview/HeroPreview";
// import FeaturesPreview from "./preview/FeaturesPreview";
// import TestimonialsPreview from "./preview/TestimonialsPreview";
// import FAQPreview from "./preview/FAQPreview";
// import PricingPreview from "./preview/PricingPreview";
// import AccessPreview from "./preview/AccessPreview";
// import RefundPreview from "./preview/RefundPreview";

// type Section = {
//   id: string;
//   type: string;
//   data: any;
// };

// export default function PageEditor() {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const userId = (session?.user as any)?.userId;

//   const [page, setPage] = useState<any | null>(null);
//   const [sections, setSections] = useState<Section[]>([]);
//   const [saving, setSaving] = useState(false);
//   const [title, setTitle] = useState("");
//   const [slug, setSlug] = useState("");
//   const [color, setColor] = useState("#ff3cac");
//   const [published, setPublished] = useState(false);

//   // LOAD PAGE
//   useEffect(() => {
//     if (!userId) return;

//     (async () => {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/pages/by-creator/${userId}`
//         );
//         const json = await res.json();

//         if (json.ok && json.page) {
//           setPage(json.page);
//           setSections(json.page.sections ?? []);
//           setTitle(json.page.title ?? "");
//           setSlug(json.page.slug ?? "");
//           setColor(json.page.color ?? "#ff3cac");
//           setPublished(Boolean(json.page.published));
//         } else {
//           setSections([]);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//   }, [userId]);

//   // BLOCK CRUD ----------------------------------------------------
//   function addBlock(type: string) {
//     const newBlock: Section = {
//       id: Math.random().toString(36).substring(2, 9),
//       type,
//       data:
//         type === "hero"
//           ? {
//               headline: "Your headline",
//               subhead: "Subheadline",
//               ctaText: "Get instant access",
//               image: null,
//             }
//           : type === "features"
//           ? { items: ["Feature 1", "Feature 2"] }
//           : type === "testimonials"
//           ? { items: [] }
//           : type === "faq"
//           ? { items: [] }
//           : type === "pricing"
//           ? { plans: [] }
//           : type === "access"
//           ? { items: [] }
//           : type === "refund"
//           ? { text: "30-day money-back guarantee" }
//           : {},
//     };

//     setSections((s) => [...s, newBlock]);
//   }

//   function removeBlock(id: string) {
//     setSections((s) => s.filter((b) => b.id !== id));
//   }

//   function moveBlock(from: number, to: number) {
//     const item = sections[from];
//     const next = update(sections, {
//       $splice: [
//         [from, 1],
//         [to, 0, item],
//       ],
//     });
//     setSections(next);
//   }

//   // SAVE ----------------------------------------------------------
//   async function savePage() {
//     if (!userId) return alert("Not signed in");

//     setSaving(true);
//     try {
//       const body = {
//         id: page?.id,
//         creatorId: page?.creatorId,
//         slug,
//         title,
//         color,
//         sections,
//         published: page?.published || false,
//       };

//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session?.accessToken}`,
//         },
//         body: JSON.stringify(body),
//       });

//       const json = await res.json();
//       if (json.ok) setPage(json.page);
//       else alert(json.error);
//     } catch (err) {
//       console.error(err);
//       alert("Save failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // PUBLISH --------------------------------------------------------
//   async function togglePublish() {
//     if (!page?.id) await savePage();

//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/pages/publish/${page?.id}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ publish: !published }),
//         }
//       );

//       const json = await res.json();
//       if (json.ok) setPublished(Boolean(json.page.published));
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // LIVE PREVIEW ---------------------------------------------------
//   function LivePreview() {
//     return (
//       <div className="p-10 text-white space-y-16">
//         <header className="text-center">
//           <h1 className="text-4xl font-bold">{title || "Your Page Title"}</h1>
//         </header>

//         {/* Blocks Render */}
//         {sections.map((section) => {
//           switch (section.type) {
//             case "hero":
//               return <HeroPreview key={section.id} data={section.data} />;
//             case "features":
//               return <FeaturesPreview key={section.id} data={section.data} />;
//             case "testimonials":
//               return (
//                 <TestimonialsPreview key={section.id} data={section.data} />
//               );
//             case "faq":
//               return <FAQPreview key={section.id} data={section.data} />;
//             case "pricing":
//               return <PricingPreview key={section.id} data={section.data} />;
//             case "access":
//               return <AccessPreview key={section.id} data={section.data} />;
//             case "refund":
//               return <RefundPreview key={section.id} data={section.data} />;
//             default:
//               return null;
//           }
//         })}
//       </div>
//     );
//   }

//   // ---------------------------------------------------------------
//   // MAIN UI --------------------------------------------------------
//   // ---------------------------------------------------------------
//   return (
//     <div className="cm-builder-root">

//       <div className="cm-builder grid grid-cols-[240px_1fr_360px] gap-6 p-6 min-h-screen bg-neutral-100 text-black">

//         {/* LEFT PANEL ------------------------------------------------ */}
//         <div className="space-y-6">

//   <button
//     onClick={() => router.push("/dashboard")}
//     className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
//   >
//     ← Back
//   </button>

//   <div className="
//     bg-neutral-900 border border-neutral-800 shadow-xl 
//     rounded-2xl p-6 space-y-5
//   ">
//     <h3 className="text-xl font-semibold text-white">Page Settings</h3>

//     <div className="space-y-2">
//       <label className="text-sm text-neutral-400">Page Title</label>
//       <input
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="
//           w-full p-3 rounded-lg 
//           bg-neutral-800 border border-neutral-700
//           text-white placeholder-neutral-500
//           focus:ring-2 focus:ring-purple-500
//         "
//       />
//     </div>

//     <div className="space-y-2">
//       <label className="text-sm text-neutral-400">Slug</label>
//       <input
//         value={slug}
//         onChange={(e) => setSlug(e.target.value)}
//         className="
//           w-full p-3 rounded-lg 
//           bg-neutral-800 border border-neutral-700
//           text-white placeholder-neutral-500
//           focus:ring-2 focus:ring-purple-500
//         "
//       />
//     </div>

//     <div className="space-y-2">
//       <label className="text-sm text-neutral-400">Accent Color</label>
//       <input
//         type="color"
//         value={color}
//         onChange={(e) => setColor(e.target.value)}
//         className="
//           h-12 w-20 rounded-lg 
//           bg-neutral-800 border border-neutral-700
//           cursor-pointer
//         "
//       />
//     </div>

//     <div className="flex gap-3 pt-2">
//       <button
//         onClick={savePage}
//         disabled={saving}
//         className="
//           px-4 py-3 rounded-lg bg-purple-600 text-white 
//           hover:bg-purple-700 shadow-lg font-medium transition
//         "
//       >
//         {saving ? "Saving…" : "Save"}
//       </button>

//       <button
//         onClick={togglePublish}
//         className="
//           px-4 py-3 rounded-lg 
//           bg-neutral-800 text-neutral-300
//           hover:bg-neutral-700 transition
//         "
//       >
//         {published ? "Unpublish" : "Publish"}
//       </button>
//     </div>
//   </div>
// </div>


//         {/* CENTER PREVIEW -------------------------------------------- */}
//         <div className="rounded-xl bg-neutral-900 border border-neutral-800 shadow overflow-auto">
//           <LivePreview />
//         </div>

//         {/* RIGHT – BLOCK EDITORS ------------------------------------ */}
//         <div className="space-y-5">

//           {/* Add Block */}
//           <div className="p-5 bg-white border border-neutral-300 rounded-xl shadow space-y-3">
//             <h3 className="font-semibold text-lg">Add Blocks</h3>

//             <div className="flex flex-wrap gap-2">
//               {[
//                 ["hero", "Hero"],
//                 ["features", "Features"],
//                 ["testimonials", "Testimonials"],
//                 ["faq", "FAQ"],
//                 ["pricing", "Pricing"],
//                 ["access", "Access Icons"],
//                 ["refund", "Refund"],
//               ].map(([type, label]) => (
//                 <button
//                   key={type}
//                   onClick={() => addBlock(type)}
//                   className="px-4 py-2 rounded-lg bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 text-sm"
//                 >
//                   + {label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Block Editors */}
//           <div className="space-y-4">
//             {sections.map((s, idx) => (
//               <div
//                 key={s.id}
//                 className="p-4 rounded-2xl border border-neutral-300 bg-white shadow-sm space-y-4"
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-center">
//                   <div className="text-[16px] font-semibold">
//                     {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => moveBlock(idx, Math.max(0, idx - 1))}
//                       className="px-2 py-1 rounded bg-neutral-100 border border-neutral-300 hover:bg-neutral-200"
//                     >
//                       ↑
//                     </button>
//                     <button
//                       onClick={() =>
//                         moveBlock(idx, Math.min(sections.length - 1, idx + 1))
//                       }
//                       className="px-2 py-1 rounded bg-neutral-100 border border-neutral-300 hover:bg-neutral-200"
//                     >
//                       ↓
//                     </button>

//                     <button
//                       onClick={() => removeBlock(s.id)}
//                       className="px-2 py-1 rounded bg-red-50 border border-red-400 text-red-600 hover:bg-red-100"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>

//                 {/* Editor */}
//                 <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
//                   {s.type === "hero" && (
//                     <HeroBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}

//                   {s.type === "features" && (
//                     <FeaturesBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}

//                   {s.type === "testimonials" && (
//                     <TestimonialsBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}

//                   {s.type === "faq" && (
//                     <FAQBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}

//                   {s.type === "pricing" && (
//                     <PricingBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}

//                   {s.type === "access" && (
//                     <AccessBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}

//                   {s.type === "refund" && (
//                     <RefundBlockEditor
//                       block={s}
//                       onChange={(d) =>
//                         setSections((prev) =>
//                           prev.map((b) =>
//                             b.id === s.id ? { ...b, data: d } : b
//                           )
//                         )
//                       }
//                     />
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
