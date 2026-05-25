import ProgressMap from "@/components/gamification/ProgressMap";

export default function ProgressPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Your Learning Journey</h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Track your progress across all distributed systems topics. Complete topics to earn XP and level up your engineering skills.
        </p>
      </div>
      
      <ProgressMap />
    </div>
  );
}
