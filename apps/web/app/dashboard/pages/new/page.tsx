"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function NewPage() {
  const router = useRouter();
  const { data: session } = useSession();

 useEffect(() => {
  if (!session?.accessToken) return;

  async function createPage() {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pages/create`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      router.push(`/dashboard/pages/${res.data.page.id}`);
    } catch (err) {
      console.error("Create page failed:", err);
      alert("Failed to create page");
    }
  }

  createPage();
}, [session]);


  return <p style={{ padding: 40 }}>Creating page…</p>;
}
