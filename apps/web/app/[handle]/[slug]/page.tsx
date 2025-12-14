// apps/web/app/[handle]/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageRenderer from "../../components/PageRenderer";

export default function PublicPage() {
  const params = useParams() as { handle: string; slug: string };
  const { handle, slug } = params;

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/${handle}/${slug}`
        );
        const json = await res.json();

        if (json.ok) {
          setPage(json.page);
          setCreator(json.creator);
        }
      } catch (err) {
        console.error("Public page load error", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [handle, slug]);

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!page) return <div style={{ padding: 40 }}>Page not found</div>;

  return (
    <PageRenderer
      page={page}
    />
  );
}
