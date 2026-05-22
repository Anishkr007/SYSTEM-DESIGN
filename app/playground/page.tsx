import ArchPlayground from "@/components/visualizers/ArchPlayground";

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Architecture Playground</h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Welcome to the sandbox. Drag and drop components to build system architectures. This is an interactive area to explore different designs.
        </p>
      </div>
      
      <ArchPlayground />
    </div>
  );
}
