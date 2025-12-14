"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.userId;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/creators/by-user/${userId}`
        );
        const json = await res.json();

        if (json.ok && json.creator) setProfile(json.creator);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <div className="no-data">Loading settings…</div>;

  return (
    <div>
      <h1 className="dashboard-title">Settings</h1>

      {/* ACCOUNT INFO */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Account Information</h2>

        <div className="muted">Name</div>
        <div style={{ fontWeight: 600, fontSize: 18 }}>{profile?.name}</div>

        <div className="muted" style={{ marginTop: 12 }}>Email</div>
        <div style={{ fontWeight: 600 }}>{profile?.email}</div>
      </div>

      {/* TELEGRAM INFO */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Telegram</h2>

        {profile.telegramLinked ? (
          <div>
            <div className="muted">Linked Telegram ID</div>
            <div style={{ fontWeight: 600 }}>{profile.telegramUserId}</div>
            <button
              className="auth-btn"
              style={{ marginTop: 12, width: 200 }}
            >
              Unlink Telegram
            </button>
          </div>
        ) : (
          <p className="muted">Not connected.</p>
        )}
      </div>

      {/* DELETE ACCOUNT */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Danger Zone</h2>

        <p className="muted">
          Once deleted, this account <strong>cannot</strong> be recovered.
        </p>

        <button
          className="auth-btn"
          style={{
            marginTop: 12,
            width: 200,
            background: "#ef4541",
            backgroundImage: "none",
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
