"use client";
import React, { useEffect, useState } from "react";

export default function ContactBlockEditor({
  block,
  onChange,
}: {
  block: any;
  onChange: (d: any) => void;
}) {
  const data = block.data || {};

  const [headline, setHeadline] = useState(
    data.headline ?? "Contact Us"
  );
  const [email, setEmail] = useState(data.email ?? "");
  const [phone, setPhone] = useState(data.phone ?? "");
  const [address, setAddress] = useState(data.address ?? "");

  useEffect(() => {
    onChange({
      ...data,
      headline,
      email,
      phone,
      address,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headline, email, phone, address]);

  return (
    <div className="cm-editor-block space-y-4">
      <label className="text-sm font-medium text-neutral-700">
        Contact Section
      </label>

      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        className="w-full p-3 rounded border bg-white text-lg font-semibold"
        placeholder="Contact Us"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded border bg-white"
        placeholder="Email address"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-3 rounded border bg-white"
        placeholder="Phone number"
      />

      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-3 rounded border bg-white"
        rows={3}
        placeholder="Address (optional)"
      />
    </div>
  );
}
