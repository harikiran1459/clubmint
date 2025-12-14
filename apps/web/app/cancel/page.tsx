"use client";

export default function CancelPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>❌ Payment Cancelled</h1>
      <p>You did not complete the payment.</p>
      <a href="/">Try again</a>
    </div>
  );
}
