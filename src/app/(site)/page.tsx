import { Hero } from "@/components/landing/hero";
import { ValueProps } from "@/components/landing/value-props";
import { CTASection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <CTASection />
    </>
  );
}
