import Hero from "@/components/sections/Hero";
import H4 from "@/components/sections/H4";
import H5 from "@/components/sections/H5";
import H6 from "@/components/sections/H6";
import H7 from "@/components/sections/H7";
import H8 from "@/components/sections/H8";
import ContactSection from "@/components/sections/ContactSection";
import { NewsletterModal } from "@/components/composites/NewsletterModal";

export default function Home() {
  return (
    <main>
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
