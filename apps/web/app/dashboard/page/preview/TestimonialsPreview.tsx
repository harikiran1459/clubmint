export default function TestimonialsPreview({ data }: { data: any }) {
  return (
    <section className="py-10 text-white">
  <h2 className="text-3xl font-bold mb-6">Testimonials</h2>

  <div className="space-y-4">
    {data.items?.map((t, i) => (
      <div
        key={i}
        className="p-5 rounded-xl bg-neutral-800 border border-neutral-700 shadow"
      >
        <p className="text-neutral-300 italic">"{t.text}"</p>
        <div className="mt-2 text-neutral-400">– {t.author}</div>
      </div>
    ))}
  </div>
</section>

  );
}
