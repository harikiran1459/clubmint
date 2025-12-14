export default function PricingPreview({ data, color }: { data: any; color?: string }) {
  const plan = data.plans?.[0] || data;
  return (
    <section className="py-10 text-white text-center">
  <h2 className="text-3xl font-bold mb-6">Pricing</h2>

  <div className="space-y-4 max-w-md mx-auto">
    {data.plans?.map((p, i) => (
      <div
        key={i}
        className="p-6 rounded-xl bg-neutral-800 border border-neutral-700 shadow"
      >
        <div className="text-xl font-semibold text-white capitalize">
          {p.interval}
        </div>
        <div className="mt-2 text-3xl font-bold">${p.amount}</div>
      </div>
    ))}
  </div>
</section>

  );
}
