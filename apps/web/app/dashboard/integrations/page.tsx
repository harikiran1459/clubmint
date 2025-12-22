"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  

  const [verificationCode, setVerificationCode] = useState("");
  const [requestingCode, setRequestingCode] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<any>(null);

  const [groups, setGroups] = useState<any[]>([]);
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [loading, setLoading] = useState(true);
  const [groupStats, setGroupStats] = useState<Record<string, any>>({});
  const [cooldown, setCooldown] = useState(0);

useEffect(() => {
  if (cooldown === 0) return;
  const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
  return () => clearTimeout(t);
}, [cooldown]);

  const authHeaders = () => ({
  Authorization: `Bearer ${session?.user?.accessToken}`,
});



  // ----------------------------------------------------
  // SESSION CHECK
  // ----------------------------------------------------
  useEffect(() => {
  if (sessionStatus === "loading") return;

  if (!session) {
    router.replace("/login");
    return;
  }
}, [sessionStatus, session]);

const creatorId = session?.user.creatorId;
const userId = session?.user.userId;

  // ----------------------------------------------------
  // LOAD CREATOR PROFILE
  // ---------------------------------------------------- 

  // ----------------------------------------------------
  // REDIRECT IF CREATOR DOES NOT EXIST
  // ----------------------------------------------------

  // ----------------------------------------------------
  // LOAD BASIC TELEGRAM STATUS (account)
  // ----------------------------------------------------
  useEffect(() => {
    if (!userId || !creatorId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/telegram/status`, { headers: authHeaders() }
        );
        const json = await res.json();
        setTelegramStatus(json);
      } catch (err) {
        console.error("Failed to load Telegram status:", err);
      }
    })();
  }, [userId, creatorId]);

  // ----------------------------------------------------
  // LOAD LINKED GROUPS
  // ----------------------------------------------------
  useEffect(() => {
    if (!creatorId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/telegram/groups`, { headers: authHeaders() }
        );
        const json = await res.json();

        if (json.ok) {
          setGroups(json.groups);
        }
      } catch (err) {
        console.error("Group load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [creatorId]);

  // ----------------------------------------------------
  // DISCONNECT TELEGRAM ACCOUNT
  // ----------------------------------------------------
  async function handleDisconnect() {
    if (!userId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/disconnect`,
        { method: "POST", headers: authHeaders()  }
      );

      const json = await res.json();
      if (json.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }

  // ----------------------------------------------------
  // DISCONNECT SINGLE GROUP
  // ----------------------------------------------------
  async function disconnectGroup(tgGroupId: string) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/group/${tgGroupId}/disconnect`,
        { method: "PATCH", headers: authHeaders() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g.tgGroupId === tgGroupId ? { ...g, isConnected: false } : g
        )
      );
    } catch (err) {
      console.error("Group disconnect error:", err);
    }
  }

async function loadGroupStats(tgGroupId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/telegram/group-stats/${tgGroupId}`, { headers: authHeaders() }
    );
    const json = await res.json();

    if (json.ok) {
      setGroupStats((prev) => ({
        ...prev,
        [tgGroupId]: json,
      }));
    }
  } catch (err) {
    console.error("Stats load failed", err);
  }
}

useEffect(() => {
  if (groups.length === 0) return;

  groups
  .filter((g) => g.isConnected)
  .forEach((g) => loadGroupStats(g.tgGroupId));
}, [groups]);


  // ----------------------------------------------------
  // GENERATE VERIFICATION CODE
  // ----------------------------------------------------
  async function generateCode() {
    if (!userId || !creatorId) return alert("Creator not loaded yet");

    setRequestingCode(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/request-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ userId, creatorId }),
        }
      );

      const json = await res.json();
      if (json.ok) {
        setVerificationCode(json.code);
        setCooldown(20); 
      }
    } catch (err) {
      console.error("Code request error:", err);
    }

    setRequestingCode(false);
  }

  // ----------------------------------------------------
  // LOADING SCREEN
  // ----------------------------------------------------
  if (loading) {
    return <div className="no-data">Loading premium integration panel…</div>;
  }

  const telegramUser = telegramStatus?.telegramUser;
  if (!telegramUser) {
  return (
    <div className="chart-card">
      <p className="muted">
        Connect your Telegram account to manage groups.
      </p>
    </div>
  );
}

  // =============================================================
  // UI BELOW (PREMIUM, CLEAN)
  // =============================================================
  return (
    <div>
      <h1 className="dashboard-title">Integrations</h1>

      {/* TELEGRAM ACCOUNT */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-card"
      >
        <h2 className="chart-title">
          <Send size={20} color="#a855f7" /> Telegram Account
        </h2>

        {telegramUser ? (
          <div className="space-y-3">
            <p className="text-gray-700">Connected as:</p>
            <p className="font-semibold text-lg">@{telegramUser.tgUsername}</p>
            <p className="text-sm text-gray-500">
              Telegram User ID: {telegramUser.tgUserId}
            </p>

            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Disconnect Telegram
            </button>
          </div>
        ) : (
          <div>
            {!verificationCode && (
              <button
                onClick={generateCode}
                className="auth-btn"
                disabled={requestingCode || cooldown > 0}
                style={{ marginTop: 14, width: "220px" }}
              >
                {requestingCode
    ? "Generating..."
    : cooldown > 0
    ? `Retry in ${cooldown}s`
    : "Generate Telegram Code"}
              </button>
            )}
            

            {verificationCode && (
              <div className="chart-card p-4">
                <p className="muted">Send this code to the Telegram bot:</p>
                <p className="text-3xl font-bold mt-2">{verificationCode}</p>

                <a
                  href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
                  target="_blank"
                >
                  <button className="auth-btn mt-3">Open Telegram Bot</button>
                </a>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* TELEGRAM GROUPS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-card mt-6"
      >
        <h2 className="chart-title">Telegram Groups</h2>

        {/* BOT INVITE SHORTCUT */}
        <a
          href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?startgroup=true`}
          target="_blank"
        >
          <button className="auth-btn mt-3">Invite Bot to Group</button>
        </a>

        {groups.length === 0 ? (
          <p className="muted mt-3">No groups linked yet.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {groups.map(g => (
              
              <motion.div
                key={g.id}
                whileHover={{ scale: 1.01 }}
                className="chart-card p-4"
              >

                <p className="font-semibold text-lg">
                  {g.title || "Unnamed Group"}
                </p>

                {g.username && (
                  <p className="text-sm text-gray-500">@{g.username}</p>
                )}

                <p className="text-sm mt-2">
                  Group ID: <b>{g.tgGroupId}</b>
                </p>
                <p className="text-sm">Type: {g.type}</p>

                {/* Connection Status */}
                <p
                  className={`text-sm mt-1 ${
                    g.isConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {g.isConnected ? "Connected ✓" : "Disconnected ✕"}
                </p>

                {/* LIVE STATS */}
                <div className="mt-3">
                  {groupStats[g.tgGroupId] ? (
                    <>
                      <p className="text-sm">
                        Members: <b>{groupStats[g.tgGroupId].memberCount}</b>
                      </p>

                      <p className="text-sm">
                        Bot Status:{" "}
                        <span
                          className={
                            groupStats[g.tgGroupId].botStatus === "administrator"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {groupStats[g.tgGroupId].botStatus}
                        </span>
                      </p>

                      <p className="text-sm">
                        Can Restrict Users:{" "}
                        <span
                          className={
                            groupStats[g.tgGroupId].botPermissions
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {groupStats[g.tgGroupId].botPermissions ? "YES" : "NO"}
                        </span>
                      </p>

                      <div className="flex gap-2 mt-3">
                        {/* REFRESH BUTTON */}
                        <button
                          onClick={() => loadGroupStats(g.tgGroupId)}
                          className="px-3 py-1 bg-gray-800 text-white text-sm rounded-lg"
                        >
                          Refresh Stats
                        </button>

                        {/* TEST MESSAGE */}
                        <button disabled={!groupStats[g.tgGroupId]?.botPermissions && (groupStats[g.tgGroupId]?.botStatus !== "administrator")}
                          onClick={async () => {
                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/telegram/group-test-message`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json", ...authHeaders() },
                              body: JSON.stringify({ tgGroupId: g.tgGroupId }),
                            });
                            alert("Test message sent!");
                          }}
                          className={`px-3 py-1 text-white text-sm rounded-lg ${
    (groupStats[g.tgGroupId]?.botPermissions && (groupStats[g.tgGroupId]?.botStatus === "administrator") )? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
  }`}
                        >
                          Test Bot Access
                        </button>

                        {/* DISCONNECT */}
                        {g.isConnected && (
                          <button disabled={!groupStats[g.tgGroupId]?.botPermissions && (groupStats[g.tgGroupId]?.botStatus !== "administrator")}
                            onClick={() => disconnectGroup(g.tgGroupId)}
                            className={`px-3 py-1 text-white text-sm rounded-lg ${
    (groupStats[g.tgGroupId]?.botPermissions && (groupStats[g.tgGroupId]?.botStatus === "administrator") ) ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"
  }`}
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Fetching stats…</p>
                  )}
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}