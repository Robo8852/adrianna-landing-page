import Hero from "@/components/sections/Hero";
import H4 from "@/components/sections/H4";
import H5 from "@/components/sections/H5";
import H6 from "@/components/sections/H6";
import H7 from "@/components/sections/H7";
import H8 from "@/components/sections/H8";
import { Suspense } from "react";
import ContactSection from "@/components/sections/ContactSection";
import { NewsletterModal } from "@/components/composites/NewsletterModal";
import { ConfirmedBanner } from "@/components/composites/ConfirmedBanner";

export default function Home() {
  return (
    <main>
      {/* Suspense keeps useSearchParams from bailing the page out of
          static prerendering — only the banner renders client-side. */}
      <Suspense fallback={null}>
        <ConfirmedBanner />
      </Suspense>
      <Hero />
      <H4 />
      <H5 />
      <H6 />
      <H7 />
      <H8 />
      <ContactSection />
      <NewsletterModal triggerDepth={0.5} />
    </main>
  );
}
