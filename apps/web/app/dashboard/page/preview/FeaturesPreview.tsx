export default function FeaturesPreview({ data }) {
  return (
    <section className="py-10 text-white">
      <h2 className="text-3xl font-bold mb-6">{data.title || "Features"}</h2>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {data.items?.map((item, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-neutral-800 border border-neutral-700 shadow-sm"
          >
            <div className="text-lg font-semibold text-white">{item}</div>
            <p className="text-neutral-400 mt-1">
              Description for this feature goes here.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
