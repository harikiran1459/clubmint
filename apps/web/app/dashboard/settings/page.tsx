"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "../../../components/ImageUploader";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { update } = useSession();

  const userId = (session?.user as any)?.userId;
  const accessToken = session?.accessToken as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [telegramBusy, setTelegramBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/creators/by-user/${userId}`
        );
        const json = await res.json();

        if (json.ok && json.creator) {
          setProfile(json.creator);
          setName(json.creator.name ?? "");
          setBio(json.creator.bio ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // ---------------- SAVE PROFILE ----------------
  async function saveProfile() {
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, bio }),
      });
      await update();
      console.log("Profile updated");
    } finally {
      setSaving(false);
    }
  }

  // ---------------- UNLINK TELEGRAM ----------------
  async function unlinkTelegram() {
    if (!confirm("Unlink Telegram from this account?")) return;

    setTelegramBusy(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/telegram/unlink`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setProfile((p: any) => ({
        ...p,
        telegramLinked: false,
        telegramUserId: null,
      }));
    } finally {
      setTelegramBusy(false);
    }
  }

  // ---------------- DELETE ACCOUNT ----------------
  async function deleteAccount() {
    const confirmText = prompt(
      'Type "DELETE" to permanently disable this account'
    );

    if (confirmText !== "DELETE") return;

    setDeleteBusy(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await signOut({ callbackUrl: "/login" });
    } finally {
      setDeleteBusy(false);
    }
  }

  if (loading) return <div className="no-data">Loading settings…</div>;

  return (
    <div>
      <h1 className="dashboard-title">Settings</h1>

      {/* PROFILE */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Profile</h2>

        <ImageUploader
          label="Profile Photo"
          currentUrl={profile?.user?.image}
          onChange={async (url: string) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/profile`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ profileImage: url }),
            });

            setProfile((p: any) => ({ ...p, user: { ...p.user, image: url }, }));
          }}
        />

        <div className="muted" style={{ marginTop: 16 }}>
          Display Name
        </div>
        <input
          className="auth-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="muted" style={{ marginTop: 12 }}>
          Bio
        </div>
        <textarea
          className="auth-input"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <button
          className="auth-btn"
          style={{ marginTop: 16, width: 160 }}
          onClick={saveProfile}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* TELEGRAM */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Telegram</h2>

        {profile.telegramLinked ? (
          <>
            <div className="muted">Linked Telegram ID</div>
            <div style={{ fontWeight: 600 }}>{profile.telegramUserId}</div>

            <button
              className="auth-btn"
              style={{ marginTop: 12, width: 200 }}
              onClick={unlinkTelegram}
              disabled={telegramBusy}
            >
              {telegramBusy ? "Unlinking..." : "Unlink Telegram"}
            </button>
          </>
        ) : (
          <p className="muted">Telegram not connected.</p>
        )}
      </div>

      {/* DANGER ZONE */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Danger Zone</h2>

        <p className="muted">
          This will disable your creator page and cancel future subscriptions.
        </p>

        <button
          className="auth-btn"
          style={{
            marginTop: 12,
            width: 220,
            background: "#ef4541",
            backgroundImage: "none",
          }}
          onClick={deleteAccount}
          disabled={deleteBusy}
        >
          {deleteBusy ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}
