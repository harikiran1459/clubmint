import SectionWrapper from "./SectionWrapper";

export default function HowItWorks() {
  return (
    <SectionWrapper>
    <section className="py-32">
      <div className="max-w-6xl mx-auto px-6 text-center">

        <h2 className="text-4xl font-bold">
          Simple setup. <span className="gradient-text">Instant automation.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-12 mt-20">
          <div>
            <div className="text-5xl font-bold gradient-text">1</div>
            <h3 className="mt-4 text-xl font-semibold">Connect your group</h3>
            <p className="mt-2 text-gray-300">Telegram or Discord in one click.</p>
          </div>

          <div>
            <div className="text-5xl font-bold gradient-text">2</div>
            <h3 className="mt-4 text-xl font-semibold">Set pricing</h3>
            <p className="mt-2 text-gray-300">Monthly, yearly, or one-time access.</p>
          </div>

          <div>
            <div className="text-5xl font-bold gradient-text">3</div>
            <h3 className="mt-4 text-xl font-semibold">Share your link</h3>
            <p className="mt-2 text-gray-300">We handle access, renewals & expiry.</p>
          </div>
        </div>

      </div>
    </section>
    </SectionWrapper>
  );
}
