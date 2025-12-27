"use client";
// apps/web/app/dashboard/pages/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { color } from "framer-motion";

export default function PagesDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    (session)?.user?.accessToken;

  // --------------------------
  // LOAD PAGES
  // --------------------------
  async function loadPages() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/pages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pagesFromServer =
        res.data.pages ?? (res.data.ok ? res.data.pages : []);

      setPages(Array.isArray(pagesFromServer) ? pagesFromServer : []);
    } catch (err) {
      console.error("Failed to load pages:", err);
    } finally {
      setLoading(false);
    }
  }

async function createNewPage() {
  if (!token) return;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/pages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Untitled Page",
        slug: `new-page-${Date.now()}`,
        sections: [],
        published: false,
      }),
    }
  );

  const json = await res.json();
  if (!json.ok) {
    alert(json.error || "Failed to create page");
    return;
  }

  router.push(`/dashboard/pages/${json.page.id}`);
}



  // --------------------------
  // DELETE PAGE
  // --------------------------
  async function handleDeletePage(pageId: string) {
    if (!confirm("Delete this page permanently?")) return;
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pages/${pageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!json.ok) {
        alert("Delete failed");
        return;
      }

      setPages((prev) => prev.filter((p) => p.id !== pageId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  }

  // --------------------------
  // LOAD WHEN READY
  // --------------------------
  useEffect(() => {
    if (status === "authenticated") {
      loadPages();
    }
  }, [status, token]);

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">Sales Pages</h1>
      </div>

      <p className="muted" style={{marginBottom: 20}}>
        Create and manage your public sales pages.
      </p>
      <button
          className="auth-btn"
          
          onClick={createNewPage}
        >
          + New Page
        </button>

      <div style={{ marginTop: 30 }}>
        {loading ? (
          <div className="no-data">Loading pages…</div>
        ) : pages.length === 0 ? (
          <div className="no-data">
            No pages yet. Create your first sales page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {pages.map((p) => {
    const isPublished = p.published;
    
    return (
      <div
        key={p.id}
        className="relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-300 hover:shadow-lg"
      >
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          isPublished ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-yellow-500 to-amber-400"
        }`} />
        
        <div className="pt-4">
          <div className="flex items-start justify-between mb-4">
            <div className="pr-4">
              <h3 className="text-lg font-semibold text-white mb-2 truncate">
                {p.title || "Untitled Page"}
              </h3>
              <p className="text-sm text-gray-400 font-mono bg-gray-900/50 px-2 py-1 rounded inline-block">
                /{p.slug}
              </p>
            </div>
            
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isPublished
                ? "bg-green-500/10 text-green-300"
                : "bg-yellow-500/10 text-yellow-300"
            }`}>
              {isPublished ? "Live" : "Draft"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => router.push(`/dashboard/pages/${p.id}`)}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            {isPublished && (
              <a
                href={`/${p.creator.handle}/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View
              </a>
            )}

            <button
              onClick={() => handleDeletePage(p.id)}
              className="ml-auto text-sm font-medium text-gray-500 hover:text-red-400 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>
        )}
      </div>
    </div>
  );
}
