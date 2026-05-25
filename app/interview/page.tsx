import InterviewModePanel from "@/components/ai/InterviewModePanel";

export default function InterviewPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-bold text-white mb-4">FAANG Mock Interview</h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Practice your system design skills in a simulated interview environment powered by AI. Get detailed feedback on your architectural decisions.
        </p>
      </div>
      
      <InterviewModePanel />
    </div>
  );
}
