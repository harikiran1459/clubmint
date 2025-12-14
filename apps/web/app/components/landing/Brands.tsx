import SectionWrapper from "./SectionWrapper";

const logos = [
  "/logos/logo1.svg",
  "/logos/logo2.svg",
  "/logos/logo3.svg",
  "/logos/logo4.svg",
  "/logos/logo5.svg"
];

export default function Brands() {
  return (
    <SectionWrapper>
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm uppercase text-gray-400 tracking-widest">Trusted by creators</p>

          <div className="mt-6 flex items-center justify-center gap-8 flex-wrap">
            {logos.map((src, i) => (
              <div key={i} className="h-6 flex items-center">
                <img src={src} alt={`logo-${i}`} className="h-6 w-auto object-contain opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}
