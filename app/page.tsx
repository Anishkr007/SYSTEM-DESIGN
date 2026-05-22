import Hero from "@/components/sections/Hero";
import TopicsGrid from "@/components/sections/TopicsGrid";
import ArchitecturePlayground from "@/components/sections/ArchitecturePlayground";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TopicsGrid />
      <ArchitecturePlayground />
    </div>
  );
}
