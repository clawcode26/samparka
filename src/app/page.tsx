import { TopBar } from "@/components/layout/TopBar";
import { Masthead } from "@/components/layout/Masthead";
import { BreakingBar } from "@/components/layout/BreakingBar";
import { NavBar } from "@/components/layout/NavBar";
import { HeroSection } from "@/components/news/HeroSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
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
