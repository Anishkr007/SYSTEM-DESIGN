export type VisualizerType =
  | 'round-robin'
  | 'consistent-hashing'
  | 'cap-theorem'
  | 'monolith-vs-micro'
  | 'db-sharding'
  | 'envelope-calc'
  | 'arch-playground'
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
