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
  const accessToken = session?.user?.accessToken as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [telegramBusy, setTelegramBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"" | "bank" | "upi">("");
const [bankName, setBankName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [ifsc, setIfsc] = useState("");
const [accountHolder, setAccountHolder] = useState("");
const [upiId, setUpiId] = useState("");


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
          setPayoutMethod(json.creator.payoutMethod ?? "");
          setBankName(json.creator.bankName ?? "");
          setAccountNumber(json.creator.accountNumber ?? "");
          setIfsc(json.creator.ifsc ?? "");
          setAccountHolder(json.creator.accountHolder ?? "");
          setUpiId(json.creator.upiId ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function savePayoutDetails() {
  if (!payoutMethod) {
    alert("Please select a payout method");
    return;
  }

  setSaving(true);

  const token = (session?.user as any)?.accessToken;
  if (!token) return;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/payout`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payoutMethod,
        bankName,
        accountNumber,
        ifsc,
        accountHolder,
        upiId,
      }),
    }
  );

  const json = await res.json();
  setSaving(false);

  if (json.ok && json.creator) {
    alert("Payout details saved successfully");
  setProfile(json.creator);

  setPayoutMethod(json.creator.payoutMethod ?? "");
  setBankName(json.creator.bankName ?? "");
  setAccountNumber(json.creator.accountNumber ?? "");
  setIfsc(json.creator.ifsc ?? "");
  setAccountHolder(json.creator.accountHolder ?? "");
  setUpiId(json.creator.upiId ?? "");
}
else {
    alert("Failed to save payout details");
  }
}


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
      {/* <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Telegram</h2>

        {profile && profile.telegramLinked ? (
  <>
    <div className="text-sm">
      Linked Telegram ID:{" "}
      <span className="font-mono">{profile.telegramUserId}</span>
    </div>

    <DangerButton
      onClick={unlinkTelegram}
      loading={telegramBusy}
    >
      Unlink Telegram
    </DangerButton>
  </>
) : (
  <p className="text-white/60 text-sm">
    Telegram is not connected.
  </p>
)}

      </div> */}

      <div className="mt-12">
  <h2 className="text-xl font-semibold mb-4">Payout details</h2>

  <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
    <select
  value={payoutMethod}
  onChange={(e) => setPayoutMethod(e.target.value as any)}
  className="w-full bg-black/30 border border-white/10 rounded-lg p-2"
>

      <option style={{color: "black", backgroundColor: "white"}} value="">Select payout method</option>
      <option style={{color: "black"}} value="bank">Bank transfer</option>
      <option style={{color: "black"}} value="upi">UPI</option>
    </select>

    {payoutMethod === "bank" && (
      <>
        <input
        className="w-full md:w-96 h-10 px-4 py-2 my-4 mx-0 md:mx-2 text-black"
  placeholder="Account holder name"
  value={accountHolder}
  onChange={(e) => setAccountHolder(e.target.value)}
/>

<input
className="w-full md:w-96 h-10 px-4 py-2 my-4 mx-0 md:mx-2 text-black"
  placeholder="Bank name"
  value={bankName}
  onChange={(e) => setBankName(e.target.value)}
/>

<input
className="w-full md:w-96 h-10 px-4 py-2 my-4 mx-0 md:mx-2 text-black"
  placeholder="Account number"
  value={accountNumber}
  onChange={(e) => setAccountNumber(e.target.value)}
/>

<input
className="w-full md:w-96 h-10 px-4 py-2 my-4 mx-0 md:mx-2 text-black"
  placeholder="IFSC code"
  value={ifsc}
  onChange={(e) => setIfsc(e.target.value)}
/>

      </>
    )}

    {payoutMethod === "upi" && (
      <input
      className="w-full md:w-96 h-10 px-4 py-2 my-4 mx-0 md:mx-2 text-black"
  placeholder="UPI ID (example@upi)"
  value={upiId}
  onChange={(e) => setUpiId(e.target.value)}
/>

    )}

    <button
  onClick={savePayoutDetails}
  disabled={saving}
  className="bg-purple-600 px-6 py-2 rounded-lg disabled:opacity-50"
>
  {saving ? "Saving…" : "Save payout details"}
</button>

  </div>
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

function DangerButton({ children, onClick, loading }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-xl bg-red-500/80 px-6 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
    >
      {loading ? "Processing…" : children}
    </button>
  );
}