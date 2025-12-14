export default function RefundPreview({ data }: { data: any }) {
  return (
    <section className="py-10 text-white">
  <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
    {data.text}
  </div>
</section>

  );
}
