<div align="center">

# 🌐 System Design by Anish
**The Ultimate AI-Powered Distributed Systems University**

![Cyberpunk UI Theme](https://img.shields.io/badge/UI-Cyberpunk_Dark-0f172a?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)

*An interactive, premium, portfolio-worthy learning platform designed to teach complex backend engineering, distributed systems, and real-world system architectures through highly interactive Framer Motion 3D visualizers.*

</div>

## 🚀 Overview

System Design can be abstract and difficult to grasp through static text and diagrams. **System Design by Anish** solves this by offering a futuristic, "engineering simulator" experience. 

With **37+ topics** and **39+ interactive visualizers**, you can physically see how data flows, how load balancers distribute traffic, how databases failover, and how the world's biggest tech companies design their architectures.

### ✨ Key Features

- **Interactive Visualizers:** Every topic features a custom-built, fully animated component. Watch packets flow, trigger failovers, scale nodes, and see algorithms execute in real-time.
- **AI-Powered Explainer:** Integrated AI chatbot that contextually explains the current topic, answers interview questions, and provides deep-dive explanations on demand.
- **Gamified Learning:** Track your progress with XP, streaks, level-ups, and achievements.
- **Real-World Case Studies:** Explore the exact architectures of WhatsApp, Instagram, YouTube, Netflix, Uber, Twitter, Discord, and more.
- **Premium Cyberpunk Design:** Built with a stunning dark theme featuring glassmorphism, neon glows, and smooth page transitions.

---

## 🏗️ Visualizer Catalog

The platform includes heavily interactive modules covering the entire backend ecosystem:

### 1. Core Infrastructure & Networking
- **API Gateway:** Visualize routing, rate limiting, and circuit breakers.
- **Load Balancing:** Interactive Round-Robin, Least Connections, and Consistent Hashing simulators.
- **Advanced CDN:** See edge computing and geographic cache distribution.
- **Networking Protocols:** WebSockets, SSE, and HTTP/2 packet comparisons.

### 2. Databases & Storage
- **Database Replication:** Trigger manual failovers between Primary and Replica nodes.
- **Sharding & Partitioning:** Distribute data across nodes dynamically.
- **Object Storage:** Upload files, watch them get chunked, erasure-coded, and distributed across nodes.
- **Distributed Transactions:** Compare Two-Phase Commit (2PC) vs. SAGA patterns.

### 3. Distributed Patterns & DevOps
- **Distributed Locking:** Watch clients fight for Redis locks using the Redlock algorithm.
- **Stream Processing:** Visualizing Kafka/Flink pipelines with tumbling and sliding windows.
- **Docker & Kubernetes:** Build layered images, scale deployments, kill pods, and watch the K8s reconciliation loop in action.
- **CI/CD Pipelines:** Trigger deployments, inject test failures, and manage manual approval gates.

### 4. Observability & AI
- **Monitoring & Tracing:** Generate traffic spikes and follow Jaeger-style distributed traces.
- **Vector Databases:** Embed text into a 3D latent space and perform KNN similarity searches.
- **RAG Architectures:** Feed documents into a chunker and watch the LLM context injection flow.
- **AI Agents:** A live ReAct loop showing an Agent querying tools and updating its scratchpad.

### 5. Company Case Studies
Dive deep into how the titans of tech scale to billions of users:
- 💬 **WhatsApp:** Offline message queues and real-time delivery ACKs.
- 📸 **Instagram:** Push vs. Pull timeline fan-out architectures.
- ▶️ **YouTube:** Parallel video transcoding queues and CDN distribution.
- 🚗 **Uber:** QuadTree geohashing grids that split dynamically based on driver density.
- 🎬 **Netflix:** Adaptive Bitrate Streaming (ABR) and Open Connect CDN failover.
- 🐦 **Twitter:** Timeline generation with cache hits/miss metrics.
- 📝 **Google Docs:** Operational Transformation (OT) conflict resolution.
- 📹 **Zoom:** SFU linear scaling vs P2P quadratic scaling.
- 🎮 **Discord:** Erlang Guild Rings handling massive WebSocket fan-outs.

---

## 🛠️ Tech Stack

This project is built using modern web development standards with zero external charting libraries (all animations are manually drawn using React and SVG).

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Anishkr007/SYSTEM-DESIGN.git
   cd SYSTEM-DESIGN
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🚀 Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).
Since the project relies purely on client-side components and API routes for AI, it works flawlessly out-of-the-box on Vercel's Edge Network.

---

## 🎨 Design Philosophy
*"Don't just read about System Design. Experience it."*

The UI strictly adheres to a futuristic, "hacking simulator" aesthetic. By utilizing complex SVG paths combined with Framer Motion, the visualizers avoid the sterile look of traditional charts, instead offering a tactile, breathing representation of data traveling through wires, servers, and networks.

---

<div align="center">
  <i>Built with ❤️ for engineers preparing for their next big System Design Interview.</i>
</div>
