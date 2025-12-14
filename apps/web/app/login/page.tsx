"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useSearchParams();
const error = params?.get("error");

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);

    await signIn("credentials", {
      email,
      password,          // 👈 required for credentials auth
      redirect: true,
      callbackUrl: "/dashboard",
    });

    setLoading(false);
    
  }

  return (
    <main className="auth-wrapper">
      <div className="glow glow-purple"></div>
      <div className="glow glow-pink"></div>

      <div className="auth-card">

        <h1 className="auth-title">Welcome Back 👋</h1>
        <p className="auth-sub">Log in and manage your creator business</p>
        {/* 🔥 Wrong password message */}
        {error === "CredentialsSignin" && (
          <p className="text-red-500 text-sm mb-2">
            Incorrect email or password. Please try again.
          </p>
        )}

        <form onSubmit={submit}>

          {/* Email */}
          <input
            className="auth-input"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password + toggle */}
          <div style={{ position: "relative" }}>
            <input
              className="auth-input"
              placeholder="Password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 40 }}
            />
            <div
              onClick={() => setShow(!show)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                opacity: 0.7,
              }}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* Submit */}
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                &nbsp;Logging in...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <div className="auth-bottom">
          Don’t have an account?
          <a href="/signup"> Sign up</a>
        </div>
      </div>
    </main>
  );
}
