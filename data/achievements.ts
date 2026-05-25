import { Achievement } from "@/types";

export const achievements: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Visit your first topic and begin the journey.",
    icon: "🚀",
    xpAward: 50
  },
  {
    id: "cache-master",
    title: "Cache Master",
    description: "Complete the Caching topic 100%.",
    icon: "⚡",
    xpAward: 100
  },
  {
    id: "kafka-whisperer",
    title: "Kafka Whisperer",
    description: "Complete the Kafka topic and use the cluster simulator.",
    icon: "📨",
    xpAward: 150
  },
  {
    id: "security-guru",
    title: "Security Guru",
    description: "Complete the Auth & Security topic and tamper with a JWT.",
    icon: "🛡️",
    xpAward: 150
  },
  {
    id: "interview-ready",
    title: "Interview Ready",
    description: "Complete 3 mock interviews.",
    icon: "🎯",
    xpAward: 200
  },
  {
    id: "streak-warrior",
    title: "Streak Warrior",
    description: "Maintain a 7-day learning streak.",
    icon: "🔥",
    xpAward: 300
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a Back of the Envelope calculation in under 2 minutes.",
    icon: "⏱️",
    xpAward: 100
  },
  {
    id: "system-architect",
    title: "System Architect",
    description: "Reach Level 5 (6000 XP).",
    icon: "👑",
    xpAward: 1000
  },
  {
    id: "sandbox-builder",
    title: "Sandbox Builder",
    description: "Drop 10 nodes into the Architecture Playground.",
    icon: "🏗️",
    xpAward: 75
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    description: "Ask the AI Chatbot 5 questions.",
    icon: "🤖",
    xpAward: 50
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Read every single tab in a topic.",
    icon: "📖",
    xpAward: 100
  },
  {
    id: "url-shortener-pro",
    title: "URL Shortener Pro",
    description: "Successfully shorten a URL in the simulator.",
    icon: "🔗",
    xpAward: 75
  }
];
