export default function HeroPreview({ data, color }: { data: any; color?: string }) {
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text">{data.headline || "Your Page Title"}</h1>
      {data.subhead && <p className="text-neutral-300 max-w-2xl mx-auto">{data.subhead}</p>}
      <div className="mt-6">
        <button className="px-6 py-3 rounded-2xl font-semibold" style={{ background: color, color: "#fff" }}>{data.ctaText || "Get access"}</button>
      </div>
      {data.image && <img src={data.image} alt="hero" className="mt-8 mx-auto rounded-xl max-w-full shadow-xl border border-white/5" />}
    </section>
  );
}
