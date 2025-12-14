"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SuccessPage() {
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function load() {
      const token = Cookies.get("token");

      if (!session?.accessToken) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/telegram-link`,
          {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          }
        );

        setTelegramLink(res.data.launchUrl);
      } catch (err) {
        console.error(err);
        setError("Subscription not found or not processed yet. Please wait a few seconds.");
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🎉 Payment Successful!</h1>
      <p>You're almost done!</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {telegramLink && (
        <a
          href={telegramLink}
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "12px 20px",
            background: "blue",
            color: "white",
            borderRadius: 6,
          }}
        >
          Verify Telegram Access →
        </a>
      )}

      {!telegramLink && !error && (
        <p>Waiting for subscription to activate... refresh in 5 seconds.</p>
      )}
    </div>
  );
}
