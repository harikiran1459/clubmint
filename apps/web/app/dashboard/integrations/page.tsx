"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Send,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Layers,
} from "lucide-react";

type TelegramGroup = {
  id: string;
  tgGroupId: string;
  title?: string;
  username?: string;
  type?: string;
  isConnected: boolean;
};

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupStats, setGroupStats] = useState<Record<string, any>>({});
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [requestingCode, setRequestingCode] = useState(false);

  const authHeaders = () => ({
    Authorization: `Bearer ${session?.user?.accessToken}`,
  });

  // ----------------------------------------------------
  // SESSION GUARD
  // ----------------------------------------------------
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
  }, [status, session]);

  // ----------------------------------------------------
  // LOAD TELEGRAM GROUPS (creator inferred from token)
  // ----------------------------------------------------
  async function loadGroups() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/groups`,
        { headers: authHeaders() }
      );
      const json = await res.json();
      if (json.ok) setGroups(json.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    loadGroups();
  }, [session]);

  // ----------------------------------------------------
  // LOAD GROUP STATS
  // ----------------------------------------------------
  async function loadGroupStats(tgGroupId: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/group-stats/${tgGroupId}`,
        { headers: authHeaders() }
      );
      const json = await res.json();
      if (json.ok) {
        setGroupStats((p) => ({ ...p, [tgGroupId]: json }));
      }
    } catch {}
  }

  useEffect(() => {
    groups.forEach((g) => g.isConnected && loadGroupStats(g.tgGroupId));
  }, [groups]);

  // ----------------------------------------------------
  // GENERATE CLAIM CODE
  // ----------------------------------------------------
  async function generateClaimCode() {
    setRequestingCode(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/claim-code`,
        { method: "POST", headers: authHeaders() }
      );
      const json = await res.json();
      if (json.ok) setClaimCode(json.code);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingCode(false);
    }
  }

  if (loading) {
    return <div className="no-data">Loading integrations…</div>;
  }

  // ====================================================
  // UI
  // ====================================================
  return (
    <div className="space-y-8">
      <h1 className="dashboard-title">Integrations</h1>

      {/* ================================================= */}
      {/* TELEGRAM PLATFORM CARD */}
      {/* ================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-card"
      >
        <div className="flex items-center gap-3 mb-3">
          <Send size={20} className="text-purple-500" />
          <h2 className="chart-title">Telegram</h2>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          Automatically grants and revokes access to paid Telegram groups. Subscribers receive secure invite links, and access is enforced in real time.
        </p>

        {/* INSTRUCTIONS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Instruction
            step="1"
            icon={<Plus />}
            title="Invite the bot"
            desc="Add the official ClubMint bot (@clubmint_access_bot) to your Telegram group as an admin with default permissions."
          />
          <Instruction
            step="2"
            icon={<Copy />}
            title="Paste claim code"
            desc="Send the generated code as a message inside the group."
          />
          <Instruction
            step="3"
            icon={<Layers />}
            title="Group appears here"
            desc="The group will instantly show up below once verified. If not, try refreshing."
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?startgroup=true`}
            target="_blank"
          >
            <button className="auth-btn">Invite Bot to Telegram Group</button>
          </a>

          <button
            onClick={generateClaimCode}
            disabled={requestingCode}
            className="auth-btn-secondary"
          >
            {requestingCode ? "Generating…" : "Generate Claim Code"}
          </button>
        </div>

        {claimCode && (
          <div className="chart-card mt-5 p-4">
            <p className="text-sm text-gray-500">
              Paste this message inside your Telegram group:
            </p>
            <p className="mt-2 text-lg font-mono font-bold">
              {claimCode}
            </p>
          </div>
        )}
      </motion.div>

      {/* ================================================= */}
      {/* GROUPS */}
      {/* ================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-card"
      >
        <h2 className="chart-title mb-4">Connected Groups</h2>

        {groups.length === 0 ? (
          <p className="muted">
            No Telegram groups connected yet. Invite the bot and paste the claim
            code inside your group.
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => {
              const stats = groupStats[g.tgGroupId];
              const healthy =
                stats?.botStatus === "administrator" &&
                stats?.botPermissions;

              return (
                <div key={g.id} className="chart-card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">
                        {g.title || "Unnamed group"}
                      </p>
                      {g.username && (
                        <p className="text-sm text-gray-500">@{g.username}</p>
                      )}
                      <p className="text-sm mt-1">
                        Type: {g.type || "unknown"}
                      </p>
                    </div>

                    {healthy ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <AlertTriangle size={16} /> Needs admin access
                      </span>
                    )}
                  </div>

                  {stats ? (
                    <div className="text-sm text-gray-600 mt-3">
                      Members: <b>{stats.memberCount}</b>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-3">
                      Fetching group status…
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => loadGroupStats(g.tgGroupId)}
                      className="px-3 py-1 bg-gray-800 text-white text-sm rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ================================================= */}
      {/* FUTURE PLATFORMS */}
      {/* ================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-card opacity-60"
      >
        <h2 className="chart-title mb-2">More platforms coming soon</h2>
        <p className="text-sm text-gray-500">
          Discord, WhatsApp, Slack and more will use the same secure access
          engine.
        </p>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------
   Instruction component
---------------------------------------------------- */
function Instruction({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="chart-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
          Step {step}
        </span>
        <span className="text-purple-500">{icon}</span>
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  );
}
