import { TopBar } from "@/components/layout/TopBar";
import { Masthead } from "@/components/layout/Masthead";
import { BreakingBar } from "@/components/layout/BreakingBar";
import { NavBar } from "@/components/layout/NavBar";
import { HeroSection } from "@/components/news/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { ComingSoon } from "@/components/ui/ComingSoon";

// ============================================
// TOGGLE THIS: set to false to bring the site back
// ============================================
const MAINTENANCE_MODE = true;

export default function Home() {
  if (MAINTENANCE_MODE) {
    return (
      <>
        <Masthead />
        <ComingSoon />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Masthead />
      <NavBar />
      <BreakingBar />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
