"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { topics } from "@/data/topics";
import NeonBadge from "@/components/ui/NeonBadge";
import InterviewQA from "@/components/ui/InterviewQA";
import dynamic from "next/dynamic";
import { useSidebarStore } from "@/store/useSidebarStore";
import { topicsV2 } from "@/data/topics-v2";
import { topicsV3 } from "@/data/topics-v3";
import AiExplainerButton from "@/components/ai/AiExplainerButton";
import { useGamificationStore } from "@/store/useGamificationStore";
// Dynamically import visualizers based on type
const visualizers = {
  "round-robin": dynamic(() => import("@/components/visualizers/RoundRobinViz")),
  "consistent-hashing": dynamic(() => import("@/components/visualizers/ConsistentHashingViz")),
  "cap-theorem": dynamic(() => import("@/components/visualizers/CAPTheoremViz")),
  "monolith-vs-micro": dynamic(() => import("@/components/visualizers/MonolithVsMicroViz")),
  "db-sharding": dynamic(() => import("@/components/visualizers/ShardingViz")),
  "envelope-calc": dynamic(() => import("@/components/visualizers/EnvelopeCalcViz")),
  "arch-playground": dynamic(() => import("@/components/visualizers/ArchPlayground")),
  "url-shortener": dynamic(() => import("@/components/visualizers/UrlShortenerViz")),
  "notification-system": dynamic(() => import("@/components/visualizers/NotificationFlowViz")),
  "kafka": dynamic(() => import("@/components/visualizers/KafkaClusterViz")),
  "caching-simulator": dynamic(() => import("@/components/visualizers/CacheSimulatorViz")),
  "auth-flow": dynamic(() => import("@/components/visualizers/AuthFlowViz")),
  "rate-limiting": dynamic(() => import("@/components/visualizers/RateLimitingViz")),
  "api-gateway": dynamic(() => import("@/components/visualizers/ApiGatewayViz")),
  "cdn-advanced": dynamic(() => import("@/components/visualizers/CdnAdvancedViz")),
  "db-replication": dynamic(() => import("@/components/visualizers/DbReplicationViz")),
  "distributed-tx": dynamic(() => import("@/components/visualizers/DistributedTxViz")),
  "websocket": dynamic(() => import("@/components/visualizers/WebSocketViz")),
  "stream-processing": dynamic(() => import("@/components/visualizers/StreamProcessingViz")),
  "distributed-lock": dynamic(() => import("@/components/visualizers/DistributedLockViz")),
  "object-storage": dynamic(() => import("@/components/visualizers/ObjectStorageViz")),
  "monitoring": dynamic(() => import("@/components/visualizers/MonitoringViz")),
  "distributed-tracing": dynamic(() => import("@/components/visualizers/DistributedTracingViz")),
  "docker": dynamic(() => import("@/components/visualizers/DockerViz")),
  "kubernetes": dynamic(() => import("@/components/visualizers/KubernetesViz")),
  "ci-cd": dynamic(() => import("@/components/visualizers/CiCdViz")),
  "vector-db": dynamic(() => import("@/components/visualizers/VectorDbViz")),
  "rag": dynamic(() => import("@/components/visualizers/RagViz")),
  "ai-agent": dynamic(() => import("@/components/visualizers/AiAgentViz")),
  "design-whatsapp": dynamic(() => import("@/components/visualizers/DesignWhatsAppViz")),
  "design-instagram": dynamic(() => import("@/components/visualizers/DesignInstagramViz")),
  "design-youtube": dynamic(() => import("@/components/visualizers/DesignYouTubeViz")),
  "design-uber": dynamic(() => import("@/components/visualizers/DesignUberViz")),
  "design-netflix": dynamic(() => import("@/components/visualizers/DesignNetflixViz")),
  "design-discord": dynamic(() => import("@/components/visualizers/DesignDiscordViz")),
  "design-google-docs": dynamic(() => import("@/components/visualizers/DesignGoogleDocsViz")),
  "design-zoom": dynamic(() => import("@/components/visualizers/DesignZoomViz")),
  "design-twitter": dynamic(() => import("@/components/visualizers/DesignTwitterViz")),
  "none": () => <div className="p-12 text-center text-zinc-500 bg-white/5 rounded-xl border border-white/10 border-dashed">No visualizer available for this topic yet.</div>
};

const allTopics = [...topics, ...topicsV2, ...topicsV3];

type TabId = "definition" | "real-world" | "pros-cons" | "visualizer" | "interview-qa";

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "definition", label: "Definition", icon: "📖" },
  { id: "real-world", label: "Real World", icon: "🌍" },
  { id: "pros-cons", label: "Pros & Cons", icon: "⚖️" },
  { id: "visualizer", label: "Visualizer", icon: "✨" },
  { id: "interview-qa", label: "Interview Q&A", icon: "💬" },
];

export default function TopicPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<TabId>("definition");
  const topic = allTopics.find((t) => t.slug === params.slug);
  const setActiveTopic = useSidebarStore(state => state.setActiveTopic);
  const { addXp, completedTopics, markTopicCompleted } = useGamificationStore();

  useEffect(() => {
    setActiveTopic(params.slug);
    
    // Gamification XP for first visit
    if (topic && !completedTopics.includes(topic.id)) {
      addXp(50, "Discovered new topic!");
      markTopicCompleted(topic.id);
    }
    
    return () => setActiveTopic(null);
  }, [params.slug, setActiveTopic, topic, completedTopics, addXp, markTopicCompleted]);

  if (!topic) {
    notFound();
  }

  const VisualizerComponent = visualizers[topic.visualizerType as keyof typeof visualizers] || visualizers["none"];

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
            {topic.emoji}
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">{topic.title}</h1>
            <div className="flex items-center gap-3">
              <NeonBadge 
                variant={
                  topic.difficulty === "beginner" ? "success" : 
                  topic.difficulty === "intermediate" ? "warning" : "danger"
                }
                className="uppercase"
              >
                {topic.difficulty}
              </NeonBadge>
              <span className="text-zinc-500 text-sm">Last updated: {topic.lastUpdated}</span>
            </div>
          </div>
        </div>
        <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
          {topic.summary}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto custom-scrollbar mb-8 border-b border-white/10 relative">
        <div className="flex gap-2 pb-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px] relative">
        <AiExplainerButton topicTitle={topic.title} currentContext={activeTab} />
        
        <AnimatePresence mode="wait">
          
          {activeTab === "definition" && (
            <motion.div
              key="definition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <h3 className="text-2xl font-bold text-white mb-4">What is {topic.title}?</h3>
                <p className="text-lg text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {topic.definition}
                </p>
              </div>
              
              {topic.concepts && topic.concepts.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Core Concepts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {topic.concepts.map((concept: any) => (
                      <div key={concept.id} className="p-6 rounded-xl bg-black/20 border border-white/5">
                        <h4 className="text-xl font-bold text-primary mb-2">{concept.title}</h4>
                        <p className="text-zinc-400 text-sm mb-4">{concept.description}</p>
                        <div className="space-y-2">
                          {concept.howItWorks.slice(0, 3).map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm text-zinc-300">
                              <span className="text-primary font-bold">{i + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "real-world" && (
            <motion.div
              key="real-world"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-black shadow-lg">
                    {topic.realWorldCompany.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-white">How {topic.realWorldCompany} Uses It</h3>
                </div>
                <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                  {topic.realWorldExample}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🎯</span> Common Use Cases
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topic.useCases.map((useCase: string, i: number) => (
                    <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-zinc-300">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "pros-cons" && (
            <motion.div
              key="pros-cons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 backdrop-blur-md">
                  <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
                    <span className="bg-green-500/20 p-2 rounded-lg">👍</span> Advantages
                  </h3>
                  <ul className="space-y-4">
                    {topic.advantages.map((adv: string, i: number) => (
                      <li key={i} className="flex gap-3 text-zinc-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="leading-relaxed">{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md">
                  <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                    <span className="bg-red-500/20 p-2 rounded-lg">👎</span> Disadvantages
                  </h3>
                  <ul className="space-y-4">
                    {topic.disadvantages.map((dis: string, i: number) => (
                      <li key={i} className="flex gap-3 text-zinc-300">
                        <span className="text-red-400 mt-1">✕</span>
                        <span className="leading-relaxed">{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "visualizer" && (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Interactive Visualization</h3>
                <NeonBadge variant="primary" className="animate-pulse">Live Demo</NeonBadge>
              </div>
              <VisualizerComponent />
            </motion.div>
          )}

          {activeTab === "interview-qa" && (
            <motion.div
              key="interview-qa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Common Interview Questions</h3>
                <p className="text-zinc-400">Test your knowledge with these frequently asked questions in system design interviews.</p>
              </div>
              <InterviewQA questions={topic.interviewQuestions} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Scaling Wisdom Footer */}
      <div className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-9xl opacity-5">💡</div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💡</span> Architectural Wisdom
        </h3>
        <p className="text-lg text-zinc-300 italic relative z-10">
          &quot;{topic.scalingExplanation}&quot;
        </p>
      </div>
    </div>
  );
}
