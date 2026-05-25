export type VisualizerType =
  | 'round-robin'
  | 'consistent-hashing'
  | 'cap-theorem'
  | 'monolith-vs-micro'
  | 'db-sharding'
  | 'envelope-calc'
  | 'arch-playground'
  | 'url-shortener'
  | 'notification-system'
  | 'kafka'
  | 'caching-simulator'
  | 'auth-flow'
  | 'rate-limiting'
  | 'api-gateway'
  | 'cdn-advanced'
  | 'db-replication'
  | 'distributed-tx'
  | 'websocket'
  | 'stream-processing'
  | 'distributed-lock'
  | 'object-storage'
  | 'monitoring'
  | 'distributed-tracing'
  | 'docker'
  | 'kubernetes'
  | 'ci-cd'
  | 'vector-db'
  | 'rag'
  | 'ai-agent'
  | 'design-whatsapp'
  | 'design-instagram'
  | 'design-youtube'
  | 'design-uber'
  | 'design-netflix'
  | 'design-discord'
  | 'design-google-docs'
  | 'design-zoom'
  | 'design-twitter'
  | 'none'

export type SidebarCategory =
  | 'basics'
  | 'scalability'
  | 'database'
  | 'load-balancing'
  | 'distributed-systems'
  | 'messaging-queue'
  | 'caching'
  | 'cdn'
  | 'microservices'
  | 'cap-theorem'
  | 'case-studies'
  | 'auth-security'
  | 'rate-limiting'
  | 'networking'
  | 'real-time'
  | 'storage'
  | 'observability'
  | 'devops'
  | 'ai-ml'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface InterviewQuestion {
  id: string
  question: string
  answer: string
  difficulty: QuestionDifficulty
  codeExample?: string
}

export interface Tradeoff {
  pro: string
  con: string
}

export interface Concept {
  id: string
  title: string
  description: string
  howItWorks: string[]
  tradeoffs: Tradeoff[]
  visualizerType: VisualizerType
}

export interface Topic {
  id: string
  slug: string
  title: string
  emoji: string
  category: SidebarCategory
  difficulty: Difficulty
  summary: string
  definition: string
  realWorldExample: string
  realWorldCompany: string
  advantages: string[]
  disadvantages: string[]
  useCases: string[]
  interviewQuestions: InterviewQuestion[]
  scalingExplanation: string
  visualizerType: VisualizerType
  concepts?: Concept[]
  lastUpdated: string
}

export interface SidebarSection {
  id: SidebarCategory
  label: string
  icon: string
  topics: SidebarTopicLink[]
}

export interface SidebarTopicLink {
  slug: string
  title: string
  emoji: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpAward: number
  unlockedAt?: string
}
