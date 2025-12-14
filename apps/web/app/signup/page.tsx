"use client";

import axios from "axios";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function getStrength(password: string) {
    let score = 0;
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "#ff6b6b" };
    if (score <= 3) return { label: "Medium", color: "#fcd34d" };
    return { label: "Strong", color: "#4ade80" };
  }

  const strength = getStrength(form.password);

  async function handleSignup(e: any) {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/signup`,
        form
      );

      const { token, user } = res.data;

      localStorage.setItem("userId", user.id);
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    <main className="auth-wrapper">
      <div className="glow glow-purple"></div>
      <div className="glow glow-pink"></div>

      <div className="auth-card">

        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-sub">Start growing your paid community today.</p>

        {error && (
          <p style={{ color: "#ff6b6b", marginBottom: 10 }}>{error}</p>
        )}

        <form onSubmit={handleSignup}>

          <input
            className="auth-input"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            className="auth-input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {/* Password + Toggle */}
          <div style={{ position: "relative" }}>
            <input
              className="auth-input"
              placeholder="Password"
              type={show ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          {/* Strength Meter */}
          {form.password.length > 0 && (
            <p style={{
              marginTop: -6,
              marginBottom: 10,
              fontSize: 13,
              color: strength.color,
              fontWeight: 600
            }}>
              {strength.label} password
            </p>
          )}

          <button className="auth-btn" type="submit">
            Continue
          </button>
        </form>

        <div className="auth-bottom">
          Already have an account?
          <a href="/login"> Log in</a>
        </div>

      </div>
    </main>
  );
}
