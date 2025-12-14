export default function AccessPreview({ data }: { data: any }) {
  const icons: any = {
    telegram: (<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 12.5l9.5-5.5-1 10.5-3.5-3.5-3 3.5-2-5z"/></svg>),
    whatsapp: (<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>),
    instagram: (<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z"/></svg>),
    discord: (<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8c-2 0-2 2-2 2h10s0-2-2-2c-1.2 0-2.8.6-3 1-0.2-.4-1.8-1-3-1z"/></svg>),
  };

  return (
    <section className="py-8 text-center">
      <div className="flex justify-center gap-6">
        {data.platforms?.map((p: string) => <div key={p} className="text-white">{icons[p] ?? p}</div>)}
      </div>
    </section>
  );
}
