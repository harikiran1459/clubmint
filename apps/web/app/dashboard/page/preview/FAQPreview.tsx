export default function FAQPreview({ data }: { data: any }) {
  return (
    <section className="py-10 text-white">
  <h2 className="text-3xl font-bold mb-6">FAQ</h2>

  <div className="space-y-4">
    {data.items?.map((qa, i) => (
      <div key={i} className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
        <div className="font-semibold text-white">{qa.q}</div>
        <div className="text-neutral-400 mt-1">{qa.a}</div>
      </div>
    ))}
  </div>
</section>

  );
}
