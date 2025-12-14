"use client";
//apps/web/app/dashboard/pages/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function PagesDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------
  // LOAD PAGES (Correct Route)
  // --------------------------
  async function loadPages() {
  if (!session) {
    console.log("loadPages: no session yet");
    return;
  }

  // session might store token under accessToken or token or similar.
  const token = (session as any).accessToken ?? (session as any).token ?? null;
  console.log("loadPages: session token:", token);

  if (!token) {
    console.error("loadPages: no token in session — cannot call API");
    setLoading(false);
    return;
  }

  // try the likely endpoints in order, and show detailed error if any
  const candidates = [
    // `${process.env.NEXT_PUBLIC_API_URL}/pages`,          // if your backend uses /pages (preferred)
    `${process.env.NEXT_PUBLIC_API_URL}/pages`  // older variant
  ];

  for (const url of candidates) {
    try {
      console.log("Trying GET", url);
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("loadPages: ok response from", url, res.data);
      // backend might return { pages } or { ok:true, pages }
      const pagesFromServer = res.data.pages ?? res.data.page ?? (res.data.ok ? res.data.pages ?? [] : []);
      setPages(Array.isArray(pagesFromServer) ? pagesFromServer : []);
      setLoading(false);
      return;
    } catch (err: any) {
      // if 401/404 etc — show it but continue to try next candidate
      console.warn(`GET ${url} failed:`, err?.response?.status, err?.response?.data ?? err.message);
    }
  }

  // if we reach here, all candidate endpoints failed
  console.error("loadPages: all page endpoints failed. check backend routes and auth.");
  setLoading(false);
}


  // --------------------------
  // DELETE PAGE
  // --------------------------
 async function handleDeletePage(pageId: string) {
  if (!confirm("Are you sure you want to delete this page?")) return;

  const token = (session as any).accessToken ?? (session as any).token ?? null;
  if (!token) {
    alert("Not authenticated — cannot delete page.");
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${pageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.status === 401) {
      console.error("DELETE returned 401:", json);
      alert("Unauthorized: your token was rejected. Try signing out/in.");
      return;
    }

    if (!json.ok) {
      console.error("DELETE failed:", json);
      alert("Delete failed: " + (json.error || JSON.stringify(json)));
      return;
    }

    setPages((prev) => prev.filter((p) => p.id !== pageId));
  } catch (err) {
    console.error("Delete request failed:", err);
    alert("Delete failed (network/error). Check server logs.");
  }
}


  // --------------------------
  // LOAD WHEN SESSION READY
  // --------------------------
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      loadPages();
    }
  }, [status, session]);
  

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Your Sales Pages</h1>

      <button
        className="auth-btn"
        style={{ marginTop: 20 }}
        onClick={() => router.push('/dashboard/pages/new')}
      >
        + Create New Page
      </button>

      <div style={{ marginTop: 30 }}>
        {loading ? (
          <p>Loading…</p>
        ) : pages.length === 0 ? (
          <p>No pages created yet.</p>
        ) : (
          pages.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 16,
                marginBottom: 12,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600 }}>{p.title || "(Untitled Page)"}</div>
              <div style={{ fontSize: 13, color: "#777" }}>{p.slug}</div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <button
                  onClick={() => router.push(`/dashboard/pages/${p.id}`)}
                  className="edit-btn"
                >
                  Edit Page
                </button>

                <button
                  onClick={() => handleDeletePage(p.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
