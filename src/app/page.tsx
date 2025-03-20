import { mockTestimonies } from "@/mocks/testimonies.mock";
import HeroSection from "./_components/hero-section";
import InfoSection from "./_components/info-section";
import TestimonySection from "./_components/testimony-section";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <InfoSection />
      <TestimonySection testimonies={mockTestimonies} />
    </>
  );
}
