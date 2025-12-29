import Navbar from "@/components/Navbar";
import ScrollSnapContainer from "@/components/ScrollSnapContainer";
import HeroSection from "@/components/HeroSection";
import SpeedSection from "@/components/SpeedSection";
import SpecsSection from "@/components/SpecsSection";

const Index = () => {
  return (
    <main className="bg-background">
      <Navbar />
      <ScrollSnapContainer>
        <HeroSection />
        <SpeedSection />
        <SpecsSection />
      </ScrollSnapContainer>
    </main>
  );
};

export default Index;
