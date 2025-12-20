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
    (session as any)?.accessToken ?? (session as any)?.token ?? null;

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
          
          onClick={() => router.push("/dashboard/pages/new")}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pages.map((p) => {
              const isPublished = p.published;

              return (
                <div
                  key={p.id}
                  className="border rounded-xl p-5 shadow-sm"
                  style={{background: "#222222"}}
                >
                  {/* TITLE */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold" style={{color: "white"}}>
                        {p.title || "Untitled Page"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        /{p.slug}
                      </p>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/pages/${p.id}`)
                      }
                      className="text-sm underline"
                      style={{color: "blue"}}
                    >
                      Edit
                    </button>

                    {isPublished && (
                      <a
                        href={`/${p.creator.handle}/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline"
                        style={{color: "blue"}}
                      >
                        View Live
                      </a>
                    )}

                    <button
                      onClick={() => handleDeletePage(p.id)}
                      className="text-sm text-red-600 hover:underline ml-auto"
                    >
                      Delete
                    </button>
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
