import type { Topic, SidebarSection } from '@/types'

export const topics: Topic[] = [
  {
    id: '1',
    slug: 'back-of-envelope-calculation',
    title: 'Back of Envelope Calculation',
    emoji: '🧮',
    category: 'basics',
    difficulty: 'beginner',
    summary: 'Estimate system requirements using rough calculations to validate design decisions before diving into details.',
    definition: 'Back of Envelope Calculation is a quick, rough estimation technique used in system design interviews and real-world architecture planning. It helps engineers make order-of-magnitude estimates for storage, bandwidth, QPS (queries per second), and other system metrics without precise data. The goal is to validate feasibility and identify potential bottlenecks before committing to a design.',
    realWorldExample: 'When Twitter was designing its storage system for tweets, engineers performed back-of-envelope calculations: 500M tweets/day × 140 bytes/tweet = 70GB of raw tweet data per day. With media attachments and indexes, this scales to ~1-2TB/day, guiding decisions about database partitioning, CDN strategy, and storage tier selection.',
    realWorldCompany: 'Twitter',
    advantages: [
      'Rapidly validates system feasibility within minutes',
      'Identifies potential bottlenecks early in design process',
      'Provides shared mental model for engineering teams',
      'Grounds abstract discussions in concrete numbers',
      'Helps prioritize engineering effort on actual constraints',
    ],
    disadvantages: [
      'Estimates can be off by orders of magnitude without domain knowledge',
      'May create false confidence if assumptions are wrong',
      'Does not account for real-world complexity and edge cases',
      'Requires experience to make accurate assumptions',
    ],
    useCases: [
      'System design interviews to demonstrate reasoning',
      'Early-stage architecture planning and trade-off analysis',
      'Capacity planning for infrastructure scaling',
      'Evaluating feasibility of new product features',
      'Comparing different architectural approaches',
    ],
    interviewQuestions: [
      {
        id: 'boe-1',
        question: 'How would you estimate the storage requirements for a photo-sharing app like Instagram?',
        difficulty: 'Medium',
        answer: 'Start with DAU: 500M users, 20% upload daily = 100M uploads/day. Average photo size: 3MB compressed. Storage: 100M × 3MB = 300TB/day. With replication (3x) and metadata: ~1PB/day. For 5 years: 1PB × 365 × 5 ≈ 1.8EB total. Use tiered storage: hot data on SSDs, cold data on HDDs/glacier.',
      },
      {
        id: 'boe-2',
        question: 'Calculate QPS for a URL shortening service with 100M DAU.',
        difficulty: 'Easy',
        answer: 'Read/write ratio is typically 100:1 for URL shorteners. Write QPS: 100M users × 1 new URL/day ÷ 86400 seconds = ~1,160 writes/sec. Read QPS: 1,160 × 100 = ~116,000 reads/sec. Peak QPS (2x average): 232,000 reads/sec. This informs caching strategy and database sharding.',
        codeExample: `// QPS Estimation
const DAU = 100_000_000; // 100M users
const urlsPerUser = 1; // daily writes
const readWriteRatio = 100;

const writeQPS = (DAU * urlsPerUser) / 86400;
// ≈ 1,157 writes/sec

const readQPS = writeQPS * readWriteRatio;
// ≈ 115,740 reads/sec

const peakReadQPS = readQPS * 2;
// ≈ 231,481 reads/sec`,
      },
      {
        id: 'boe-3',
        question: 'How much bandwidth does YouTube need to serve 1B video views per day?',
        difficulty: 'Medium',
        answer: 'Assume average video: 5 minutes at 720p = ~250MB. 1B views × 250MB = 250PB/day transferred. Bandwidth: 250PB ÷ 86400 sec ≈ 2.9TB/sec peak. This requires a global CDN with hundreds of PoPs, and explains why YouTube uses adaptive bitrate streaming to reduce bandwidth.',
      },
      {
        id: 'boe-4',
        question: 'What are the key numbers every engineer should memorize?',
        difficulty: 'Easy',
        answer: 'Memory access: 100ns DRAM, 500ns SSD, 10ms HDD. Network: 1Gbps LAN, 100Mbps WAN. Storage: 1TB HDD = $30, 1TB SSD = $100. Compute: 1 server handles ~10K-100K QPS. Data: 1M messages/sec = ~1MB/sec at 1KB/msg. Latency: L1 cache 1ns, L2 10ns, RAM 100ns, SSD 100μs, HDD 10ms, network round-trip 150ms.',
      },
      {
        id: 'boe-5',
        question: 'Estimate the number of servers needed for a ride-sharing app like Uber at peak load.',
        difficulty: 'Hard',
        answer: 'Peak concurrent rides: 10M. Each ride generates 1 location update/sec = 10M requests/sec. A single server handles ~10K req/sec. Servers needed: 10M ÷ 10K = 1,000 servers for location tracking. Add: 500 for matching engine, 300 for payment processing, 200 for notifications = ~2,000 total application servers, plus databases, cache, and redundancy × 3 = ~6,000 servers total.',
      },
    ],
    scalingExplanation: 'Back of envelope calculations scale your thinking before you scale your system. Start with users → actions per user → requests per second → data per request → storage/bandwidth needs. Always sanity check: Google processes 8.5B searches/day ≈ 100K QPS. Netflix serves 250M users streaming ~3 hours/day at 5Mbps ≈ 100TB/sec of video.',
    visualizerType: 'envelope-calc',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    slug: 'cap-theorem',
    title: 'CAP Theorem',
    emoji: '📐',
    category: 'cap-theorem',
    difficulty: 'intermediate',
    summary: 'Understand the fundamental trade-offs between Consistency, Availability, and Partition Tolerance in distributed systems.',
    definition: "CAP Theorem, proven by Eric Brewer in 2000, states that a distributed data store can only guarantee two of three properties simultaneously: Consistency (every read receives the most recent write), Availability (every request receives a non-error response), and Partition Tolerance (the system continues operating despite network partitions). Since network partitions are unavoidable in distributed systems, the real choice is between consistency and availability during a partition.",
    realWorldExample: 'Amazon DynamoDB is an AP system: during network partitions, it favors availability, meaning different nodes may return slightly stale data. This is acceptable for shopping carts where showing a slightly outdated cart is better than an error. Conversely, HBase is a CP system — it stops accepting writes during partitions to ensure consistency, suitable for financial transactions.',
    realWorldCompany: 'Amazon DynamoDB',
    advantages: [
      'Provides a clear framework for distributed system trade-off decisions',
      'Forces explicit acknowledgment of system guarantees',
      'Guides database selection based on use case requirements',
      'Helps set correct expectations for system behavior during failures',
    ],
    disadvantages: [
      'Oversimplification: real systems exist on a spectrum (PACELC theorem is more nuanced)',
      'Consistency levels vary widely (strong, eventual, causal)',
      'Binary framing ignores latency as a key trade-off dimension',
      'Difficult to reason about during system evolution',
    ],
    useCases: [
      'Choosing between SQL and NoSQL databases',
      'Designing distributed transaction systems',
      'Multi-region database replication strategies',
      'Microservices data consistency patterns',
      'Cache consistency policies',
    ],
    interviewQuestions: [
      {
        id: 'cap-1',
        question: 'If you cannot sacrifice partition tolerance, what choice are you actually making?',
        difficulty: 'Medium',
        answer: 'Since network partitions are inevitable in distributed systems, PT is non-negotiable in practice. The real trade-off is CP vs AP: during a partition, does your system halt to preserve consistency (CP), or serve potentially stale data to preserve availability (AP)? Most modern distributed systems choose AP with eventual consistency.',
      },
      {
        id: 'cap-2',
        question: 'Give real examples of CA, CP, and AP systems.',
        difficulty: 'Easy',
        answer: 'CA (sacrifices partition tolerance): Traditional RDBMS on a single node (MySQL, PostgreSQL). CP (sacrifices availability): HBase, Zookeeper, Redis (when configured for strong consistency), MongoDB (with strong write concerns). AP (sacrifices consistency): Cassandra, DynamoDB, CouchDB, DNS, Riak.',
      },
      {
        id: 'cap-3',
        question: 'How does eventual consistency work in practice?',
        difficulty: 'Medium',
        answer: 'Eventual consistency means all replicas will converge to the same value given enough time with no new updates. Techniques: vector clocks track causality, last-write-wins uses timestamps, CRDTs (Conflict-free Replicated Data Types) enable automatic conflict resolution. Example: DNS propagation takes hours but eventually all servers agree on the same IP.',
        codeExample: `// CRDT Counter Example (G-Counter)
class GCounter {
  private counts: Map<string, number> = new Map();
  
  increment(nodeId: string): void {
    const current = this.counts.get(nodeId) ?? 0;
    this.counts.set(nodeId, current + 1);
  }
  
  value(): number {
    return Array.from(this.counts.values())
      .reduce((sum, n) => sum + n, 0);
  }
  
  merge(other: GCounter): GCounter {
    const merged = new GCounter();
    const allKeys = new Set([
      ...this.counts.keys(), 
      ...other.counts.keys()
    ]);
    allKeys.forEach(key => {
      merged.counts.set(key, Math.max(
        this.counts.get(key) ?? 0,
        other.counts.get(key) ?? 0
      ));
    });
    return merged;
  }
}`,
      },
      {
        id: 'cap-4',
        question: 'What is the PACELC theorem and how does it extend CAP?',
        difficulty: 'Hard',
        answer: 'PACELC: If Partition, choose between A (availability) and C (consistency). Else (normal operation), choose between L (latency) and C (consistency). This extends CAP by recognizing that even without partitions, there\'s a latency-consistency trade-off. For example, DynamoDB AP/EL — it favors availability during partitions and low latency over consistency during normal operation.',
      },
      {
        id: 'cap-5',
        question: 'How would you design a banking system given CAP constraints?',
        difficulty: 'Hard',
        answer: 'Banking requires strong consistency (CP). Strategy: Use a CP database like PostgreSQL with strong write concerns. For global distribution, use synchronous replication for account balances (accepting higher latency). Implement 2-phase commit for distributed transactions. For read-heavy operations like account history, allow eventual consistency with clearly marked "pending" states. Use saga pattern for long-running transactions.',
      },
      {
        id: 'cap-6',
        question: 'What happens to your system during a network partition if you chose AP?',
        difficulty: 'Medium',
        answer: 'During an AP system partition: both sides of the partition continue operating independently, accepting reads and writes. This creates divergent state. When the partition heals, the system must reconcile conflicts. Strategies: last-write-wins (may lose data), vector clocks (track causality), application-level merge logic, CRDTs (mathematically sound merging). Example: Shopping carts in DynamoDB merge conflicting carts by union.',
      },
    ],
    scalingExplanation: 'As you scale from 1 to N nodes, partition tolerance becomes mandatory. Design your data model around your consistency requirements: strong consistency limits throughput, eventual consistency enables horizontal scaling. Modern systems like Google Spanner use TrueTime API to achieve external consistency (linearizability) globally by bounding clock uncertainty.',
    visualizerType: 'cap-theorem',
    concepts: [
      {
        id: 'ca',
        title: 'CA — Consistency + Availability',
        description: 'Traditional relational databases on a single node. No network partition is possible.',
        howItWorks: [
          'Data is stored on a single node or with synchronous replication',
          'Every read gets the latest write (consistency)',
          'Every request gets a valid response (availability)',
          'No network partition possible (single node) or not tolerated',
        ],
        tradeoffs: [
          { pro: 'Strong data consistency guarantees', con: 'Cannot scale beyond single node for writes' },
          { pro: 'Simple mental model for developers', con: 'Single point of failure' },
          { pro: 'ACID transaction support', con: 'Vertical scaling only (expensive)' },
        ],
        visualizerType: 'cap-theorem',
      },
      {
        id: 'cp',
        title: 'CP — Consistency + Partition Tolerance',
        description: 'Systems that halt during partitions to maintain data consistency. Used where correctness is critical.',
        howItWorks: [
          'System detects network partition',
          'Minority partition stops accepting writes',
          'Majority partition continues operating consistently',
          'Partition heals, minority syncs from majority',
        ],
        tradeoffs: [
          { pro: 'Data is always consistent and correct', con: 'Unavailable during network partitions' },
          { pro: 'Suitable for financial and critical systems', con: 'Higher latency due to coordination overhead' },
          { pro: 'Simpler conflict resolution', con: 'Reduced availability SLAs' },
        ],
        visualizerType: 'cap-theorem',
      },
      {
        id: 'ap',
        title: 'AP — Availability + Partition Tolerance',
        description: 'Systems that continue serving requests during partitions, accepting eventual consistency.',
        howItWorks: [
          'During partition, all nodes continue accepting requests',
          'Nodes operate independently with potentially divergent state',
          'Changes are propagated when partition heals',
          'Conflict resolution strategies applied on merge',
        ],
        tradeoffs: [
          { pro: 'Always available, even during partitions', con: 'Data may be temporarily stale or inconsistent' },
          { pro: 'Massively horizontally scalable', con: 'Complex conflict resolution logic required' },
          { pro: 'High fault tolerance', con: 'Weaker consistency guarantees' },
        ],
        visualizerType: 'cap-theorem',
      },
    ],
    lastUpdated: '2024-01-15',
  },
  {
    id: '3',
    slug: 'monolith-vs-microservices',
    title: 'Monolith vs Microservices',
    emoji: '🏗️',
    category: 'microservices',
    difficulty: 'intermediate',
    summary: 'Compare monolithic and microservices architectures, their trade-offs, and when to use each approach.',
    definition: 'A Monolithic architecture packages all application functionality (UI, business logic, data access) into a single deployable unit. A Microservices architecture decomposes the application into small, independently deployable services that communicate over APIs. Each service owns its data and can be deployed, scaled, and updated independently. Netflix is the canonical example of successful microservices migration at scale.',
    realWorldExample: 'Netflix started as a monolith in 2007 and began migrating to microservices in 2009 after a major database corruption caused a 3-day outage. By 2016, Netflix had 700+ microservices running on AWS. Each service (recommendations, streaming, billing) scales independently — the recommendation engine scales to handle 40M users, while billing handles far fewer requests.',
    realWorldCompany: 'Netflix',
    advantages: [
      'Monolith: Simple to develop, test, and deploy initially',
      'Monolith: Single codebase is easy to navigate and refactor',
      'Microservices: Each service scales independently based on load',
      'Microservices: Technology stack flexibility per service',
      'Microservices: Fault isolation — one service failure does not cascade',
      'Microservices: Enables parallel team development',
      'Microservices: Independent deployment reduces risk',
    ],
    disadvantages: [
      'Monolith: Scales as a unit, even if only one component is bottlenecked',
      'Monolith: Risk of "big ball of mud" — tightly coupled modules',
      'Microservices: Distributed system complexity (network calls, serialization)',
      'Microservices: Data consistency challenges across service boundaries',
      'Microservices: Operational overhead (service discovery, load balancing, monitoring)',
      'Microservices: Testing distributed interactions is difficult',
      'Microservices: Higher latency due to network calls vs in-process calls',
    ],
    useCases: [
      'Monolith: Early-stage startups with small teams',
      'Monolith: Well-understood domain with limited scaling requirements',
      'Microservices: Large teams with multiple product squads',
      'Microservices: Different scaling requirements per domain',
      'Microservices: Heterogeneous technology requirements',
      'Microservices: High availability requirements with fault isolation',
    ],
    interviewQuestions: [
      {
        id: 'mono-1',
        question: 'When would you choose a monolith over microservices?',
        difficulty: 'Medium',
        answer: 'Choose monolith when: team is small (<10 engineers), domain is not fully understood yet, startup in early stages validating product-market fit, low operational complexity budget, or when the performance cost of network calls is prohibitive. "Microservices are a distributed system, which is always more complex than a monolith."',
      },
      {
        id: 'mono-2',
        question: 'How do you handle data consistency across microservices?',
        difficulty: 'Hard',
        answer: 'Strategies: Saga pattern (sequence of local transactions with compensating transactions for rollback), Event Sourcing (append-only event log as source of truth), Outbox pattern (write events to outbox table in same DB transaction, then publish), CQRS (separate read/write models). Avoid distributed transactions (2PC) — they reduce availability and create tight coupling.',
        codeExample: `// Saga Pattern — Choreography Style
// Order Service publishes event
eventBus.publish('ORDER_CREATED', { orderId, items, userId });

// Inventory Service listens and reacts
eventBus.on('ORDER_CREATED', async (event) => {
  try {
    await reserveInventory(event.items);
    eventBus.publish('INVENTORY_RESERVED', event);
  } catch {
    eventBus.publish('INVENTORY_FAILED', event);
  }
});

// Order Service handles failure — compensating transaction
eventBus.on('INVENTORY_FAILED', async (event) => {
  await cancelOrder(event.orderId);
  eventBus.publish('ORDER_CANCELLED', event);
});`,
      },
      {
        id: 'mono-3',
        question: 'How do microservices communicate with each other?',
        difficulty: 'Easy',
        answer: 'Synchronous: REST (simple, HTTP-based, human-readable), gRPC (high performance, binary, strongly typed via Protobuf, bi-directional streaming). Asynchronous: Message queues (Kafka, RabbitMQ) for decoupled event-driven communication. Service mesh (Istio, Linkerd): handles service discovery, load balancing, circuit breaking, and observability as infrastructure layer.',
      },
      {
        id: 'mono-4',
        question: 'What is the strangler fig pattern and how does it help monolith migration?',
        difficulty: 'Medium',
        answer: 'Strangler Fig pattern: incrementally replace pieces of a monolith with microservices. Proxy/API gateway routes requests — new features go to microservices, old features stay in monolith until migrated. Over time, microservices "strangle" the monolith until nothing remains. Reduces risk vs big-bang rewrite. Used by Netflix, Amazon, and many others.',
      },
      {
        id: 'mono-5',
        question: 'How do you handle service discovery in a microservices architecture?',
        difficulty: 'Hard',
        answer: 'Client-side discovery: services query a service registry (Eureka, Consul) and load balance themselves. Server-side discovery: load balancer (ELB, Nginx Plus) queries registry and routes. DNS-based: Kubernetes uses CoreDNS, services discovered by DNS name. Service mesh: Istio injects sidecars (Envoy proxy) handling discovery, LB, and circuit breaking transparently.',
      },
    ],
    scalingExplanation: 'Start with a modular monolith — well-structured with clear module boundaries. When specific components hit scaling limits, extract them as microservices. The rule: never decompose before you understand the domain boundaries (Domain-Driven Design). Premature microservices create distributed monoliths — worst of both worlds.',
    visualizerType: 'monolith-vs-micro',
    lastUpdated: '2024-01-15',
  },
  {
    id: '4',
    slug: 'db-sharding',
    title: 'Database Sharding',
    emoji: '🗄️',
    category: 'database',
    difficulty: 'advanced',
    summary: 'Scale databases horizontally by partitioning data across multiple nodes using various sharding strategies.',
    definition: 'Database sharding is a horizontal scaling technique that partitions data across multiple database instances (shards), each holding a subset of the total data. Each shard is an independent database that serves a portion of the overall load. Unlike vertical scaling (bigger machines), sharding allows near-infinite horizontal scaling. The sharding key determines how data is distributed and critically impacts query performance and data skew.',
    realWorldExample: 'Instagram uses sharding for its main user data. With 2B+ users, they shard by user_id using consistent hashing. Each shard handles ~1M users, storing their posts, followers, and media metadata. When a celebrity like Cristiano Ronaldo posts, the write goes to his shard, and reads are distributed across shards for his 600M followers.',
    realWorldCompany: 'Instagram',
    advantages: [
      'Horizontal scalability — add shards as data grows',
      'Reduced query load per database node',
      'Geographic distribution of data for latency reduction',
      'Fault isolation — one shard failure affects only subset of users',
      'Can use commodity hardware instead of expensive enterprise servers',
    ],
    disadvantages: [
      'Cross-shard queries are complex and expensive (scatter-gather)',
      'Resharding is painful and often requires downtime',
      'Data skew if sharding key is poorly chosen (hot shards)',
      'Joins across shards are not possible in SQL',
      'Application complexity increases significantly',
      'Transactions across shards require distributed transaction protocols',
    ],
    useCases: [
      'Social networks with billions of user records',
      'Multi-tenant SaaS platforms',
      'Time-series data at massive scale (IoT, metrics)',
      'E-commerce order history databases',
      'Gaming leaderboards and player data',
    ],
    interviewQuestions: [
      {
        id: 'shard-1',
        question: 'What are the main sharding strategies and their trade-offs?',
        difficulty: 'Medium',
        answer: 'Range-based: easy range queries, prone to hot spots (all new users in latest shard). Hash-based: even distribution, breaks range queries, requires rehashing on reshard. Directory-based: lookup table for shard location, flexible but lookup table is bottleneck. Geo-based: shard by location, great for geo-aware apps, uneven distribution. Consistent hashing: minimizes data movement on reshard, virtual nodes for balance.',
      },
      {
        id: 'shard-2',
        question: 'How do you handle hotspot shards?',
        difficulty: 'Hard',
        answer: 'Hotspot causes: celebrity users, viral content, sequential IDs creating range imbalance. Solutions: add random suffix to hot keys (user_123_0 through user_123_9), read replicas for hot shards, application-level caching (Redis) for hot data, re-shard at cell/shard level, celebrity-aware routing (put celebrities in dedicated shards), virtual nodes with smaller ring segments.',
      },
      {
        id: 'shard-3',
        question: 'What is resharding and how do you do it without downtime?',
        difficulty: 'Hard',
        answer: 'Resharding = redistributing data across more/fewer shards. Zero-downtime approach: 1) Add new shards and start dual-writing, 2) Backfill old data to new shards, 3) Verify data consistency, 4) Switch reads to new shards, 5) Stop writing to old shards, 6) Decommission old shards. Consistent hashing minimizes resharding by only moving 1/n of data when adding the nth shard.',
      },
      {
        id: 'shard-4',
        question: 'How do you handle cross-shard transactions?',
        difficulty: 'Hard',
        answer: 'Options: Two-phase commit (2PC) — atomic but slow, reduces availability. Saga pattern — eventual consistency with compensating transactions. Avoid cross-shard transactions by careful schema design (keep related data in same shard). Google Spanner uses TrueTime for globally consistent transactions. Most applications just avoid them — e.g., keep user and their data on same shard.',
      },
      {
        id: 'shard-5',
        question: 'When would you choose sharding over other scaling strategies?',
        difficulty: 'Medium',
        answer: 'Choose sharding after exhausting: read replicas (for read-heavy workloads), vertical scaling (CPU/RAM upgrades), caching layers. Shard when: single node cannot hold all data in memory/disk, write throughput exceeds single node capacity, or regulatory requirements mandate data locality. Sharding adds significant complexity — it should be the last resort after simpler solutions.',
      },
    ],
    scalingExplanation: 'Sharding progression: 1→Read replicas (handle 10x read load) → Cache layer (reduce DB reads 90%) → Vertical scaling (10x-100x write capacity) → Sharding (100x-∞ write capacity). Each step adds complexity. Rule of thumb: shard when your dataset exceeds 1TB or write QPS exceeds 10K/sec on a single optimized server.',
    visualizerType: 'db-sharding',
    concepts: [
      {
        id: 'range-sharding',
        title: 'Range-Based Sharding',
        description: 'Data is divided into contiguous ranges based on the sharding key value. Easy to understand and enables efficient range queries.',
        howItWorks: [
          'Define key ranges: Shard 1 (A-F), Shard 2 (G-M), Shard 3 (N-Z)',
          'Route queries to the shard covering the key range',
          'Range scans are efficient — all data in a range is co-located',
          'New shards added by splitting existing ranges',
        ],
        tradeoffs: [
          { pro: 'Efficient range queries and sequential scans', con: 'Prone to hot spots if keys are not uniformly distributed' },
          { pro: 'Easy to understand and implement', con: 'Recent data may overload the "latest" shard' },
        ],
        visualizerType: 'db-sharding',
      },
      {
        id: 'hash-sharding',
        title: 'Hash-Based Sharding',
        description: 'A hash function determines shard placement, ensuring even data distribution across shards.',
        howItWorks: [
          'Apply hash function to sharding key: shard = hash(key) % num_shards',
          'Data is evenly distributed across all shards',
          'Each shard receives approximately equal load',
          'Resharding requires recomputing hash for all keys',
        ],
        tradeoffs: [
          { pro: 'Even data distribution, prevents hot spots', con: 'Range queries require scatter-gather across all shards' },
          { pro: 'Predictable shard location for any key', con: 'Resharding is expensive — must rehash everything' },
        ],
        visualizerType: 'db-sharding',
      },
      {
        id: 'directory-sharding',
        title: 'Directory-Based Sharding',
        description: 'A lookup service maintains a directory mapping keys to their shard locations.',
        howItWorks: [
          'Lookup service stores key → shard mapping',
          'Query lookup service to find correct shard',
          'Allows arbitrary shard assignment without hash constraints',
          'Data migration is transparent — just update directory',
        ],
        tradeoffs: [
          { pro: 'Maximum flexibility in shard assignment', con: 'Lookup service is a single point of failure and bottleneck' },
          { pro: 'Easy to move data between shards', con: 'Additional network hop for every query' },
        ],
        visualizerType: 'db-sharding',
      },
      {
        id: 'geo-sharding',
        title: 'Geographic Sharding',
        description: 'Data is partitioned by geographic region, keeping user data close to users for low latency.',
        howItWorks: [
          'Route users to their regional shard (US, EU, APAC)',
          'Each region has its own independent shard',
          'Data sovereignty requirements are automatically satisfied',
          'Regional failures do not affect other regions',
        ],
        tradeoffs: [
          { pro: 'Low latency for regional users', con: 'Uneven distribution if user base is geographically skewed' },
          { pro: 'Data sovereignty compliance', con: 'Cross-region queries are expensive' },
        ],
        visualizerType: 'db-sharding',
      },
    ],
    lastUpdated: '2024-01-15',
  },
  {
    id: '5',
    slug: 'consistent-hashing',
    title: 'Consistent Hashing',
    emoji: '🔄',
    category: 'database',
    difficulty: 'advanced',
    summary: 'An elegant algorithm that minimizes data redistribution when nodes are added or removed from a distributed system.',
    definition: 'Consistent Hashing is a distributed hashing technique where both data keys and server nodes are mapped to positions on a virtual ring (hash ring) using the same hash function. A key is assigned to the first server encountered when traversing the ring clockwise from the key\'s position. When a server is added or removed, only the keys between it and its predecessor need to be redistributed — minimizing data movement compared to modulo hashing.',
    realWorldExample: 'Amazon DynamoDB uses consistent hashing as its core partitioning strategy. Each data item is assigned to a node based on its hashed key\'s position on the ring. DynamoDB uses virtual nodes (vnodes): each physical server is represented by 150+ virtual nodes on the ring, ensuring even data distribution even when physical servers have different capacities. This enables seamless cluster scaling.',
    realWorldCompany: 'Amazon DynamoDB',
    advantages: [
      'Minimal data redistribution when adding/removing nodes (only 1/n keys move)',
      'No centralized mapping table required',
      'Naturally handles node failures gracefully',
      'Virtual nodes enable heterogeneous server capacities',
      'Predictable load distribution with virtual nodes',
    ],
    disadvantages: [
      'Non-uniform distribution possible without virtual nodes',
      'Node lookup requires traversing the ring',
      'More complex to implement than simple modulo hashing',
      'Hot spots possible if key distribution is skewed',
    ],
    useCases: [
      'Distributed caching systems (Memcached, Redis Cluster)',
      'Database partitioning in NoSQL (Cassandra, DynamoDB)',
      'Content Delivery Networks for cache server selection',
      'Load balancing across stateful servers',
      'Distributed file systems (HDFS rack placement)',
    ],
    interviewQuestions: [
      {
        id: 'ch-1',
        question: 'Why is consistent hashing better than simple modulo hashing for distributed systems?',
        difficulty: 'Medium',
        answer: 'Modulo hashing (key % N) requires remapping N-1/N keys when a server is added/removed. With 1M keys and 10 servers, adding one server remaps ~909K keys. Consistent hashing only remaps K/N keys on average — adding one server to 10 remaps only ~100K keys. This dramatically reduces cache invalidation storms and data migration overhead.',
      },
      {
        id: 'ch-2',
        question: 'What are virtual nodes and why are they important?',
        difficulty: 'Medium',
        answer: 'Virtual nodes (vnodes): each physical server is assigned multiple positions on the hash ring instead of one. Benefits: 1) Even distribution even with few physical servers (3 servers × 100 vnodes = 300 points on ring), 2) Proportional allocation for heterogeneous hardware (powerful server gets more vnodes), 3) Faster recovery — failed node\'s vnodes distributed across all remaining servers. Cassandra uses 256 vnodes per node by default.',
        codeExample: `class ConsistentHashRing {
  private ring: Map<number, string> = new Map();
  private sortedKeys: number[] = [];
  private virtualNodes: number;

  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
  }

  addNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const key = this.hash(\`\${node}:vnode:\${i}\`);
      this.ring.set(key, node);
      this.sortedKeys.push(key);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  getNode(key: string): string {
    const hash = this.hash(key);
    // Find first ring position >= hash
    const idx = this.sortedKeys.findIndex(k => k >= hash);
    const ringKey = idx === -1 
      ? this.sortedKeys[0]  // wrap around
      : this.sortedKeys[idx];
    return this.ring.get(ringKey)!;
  }

  private hash(key: string): number {
    // FNV-1a hash
    let h = 2166136261;
    for (const c of key) {
      h ^= c.charCodeAt(0);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }
}`,
      },
      {
        id: 'ch-3',
        question: 'How does consistent hashing handle node failures?',
        difficulty: 'Medium',
        answer: 'When a node fails: its position(s) on the ring are removed. Keys that mapped to the failed node now map to the next node clockwise. With replication factor R, each key has R replicas on consecutive nodes — so a single failure only means reading from the second replica. Cassandra\'s replication strategy places replicas on consecutive nodes (considering rack/datacenter awareness).',
      },
      {
        id: 'ch-4',
        question: 'How does Cassandra use consistent hashing?',
        difficulty: 'Hard',
        answer: 'Cassandra uses a token ring. Each node is assigned a range of tokens. The partition key is hashed (Murmur3) to find the primary replica. With replication factor 3, the next 2 nodes clockwise also store replicas. Cassandra uses NetworkTopologyStrategy for rack-aware placement — replicas spread across racks for fault tolerance. Virtual nodes (256 per node default) ensure even token distribution.',
      },
      {
        id: 'ch-5',
        question: 'What is the consistent hashing algorithm time complexity?',
        difficulty: 'Easy',
        answer: 'Adding a node: O(V log N) where V = virtual nodes, N = total ring positions. Removing a node: O(V log N). Key lookup: O(log N) using binary search on sorted ring positions. Space: O(N × V) for the ring. In practice, with 100-node cluster and 150 vnodes each, lookup is O(log 15000) ≈ 14 comparisons — negligible overhead.',
      },
    ],
    scalingExplanation: 'Consistent hashing is the backbone of most large-scale distributed systems. It enables elastic scaling: add nodes to handle more load, remove nodes during off-peak to save costs. The key insight: K/N keys need remapping (where K=keys, N=nodes) vs modulo hashing\'s (N-1)/N. At 1000 nodes, adding one moves 0.1% of data vs 99.9% with modulo hashing.',
    visualizerType: 'consistent-hashing',
    concepts: [
      {
        id: 'hash-ring',
        title: 'Hash Ring',
        description: 'A virtual circular space where both keys and nodes are mapped using the same hash function.',
        howItWorks: [
          'Generate a hash ring from 0 to 2^32-1 (or 2^64-1)',
          'Hash each server node to a position on the ring',
          'Hash each data key to a position on the ring',
          'Assign each key to the first server encountered clockwise',
        ],
        tradeoffs: [
          { pro: 'Minimal key movement on topology changes', con: 'Non-uniform distribution without virtual nodes' },
          { pro: 'Deterministic key-to-node mapping', con: 'Ring traversal required for lookup' },
        ],
        visualizerType: 'consistent-hashing',
      },
      {
        id: 'virtual-nodes',
        title: 'Virtual Nodes (Vnodes)',
        description: 'Multiple positions per physical server on the hash ring for even distribution.',
        howItWorks: [
          'Assign each physical server V virtual positions on the ring',
          'Hash server_id + vnode_index for each virtual node',
          'Data is evenly spread across all virtual nodes',
          'Physical servers inherit all their virtual nodes\' data',
        ],
        tradeoffs: [
          { pro: 'Near-perfect load balancing with many vnodes', con: 'Memory overhead for tracking virtual positions' },
          { pro: 'Proportional assignment for heterogeneous hardware', con: 'Increased complexity in ring management' },
        ],
        visualizerType: 'consistent-hashing',
      },
    ],
    lastUpdated: '2024-01-15',
  },
  {
    id: '6',
    slug: 'load-balancer-algorithms',
    title: 'Load Balancer Algorithms',
    emoji: '⚖️',
    category: 'load-balancing',
    difficulty: 'intermediate',
    summary: 'Master the algorithms that distribute network traffic across servers to maximize throughput and minimize latency.',
    definition: 'Load balancing distributes incoming network traffic across multiple backend servers to ensure no single server is overwhelmed. Load balancers operate at Layer 4 (transport) or Layer 7 (application) of the OSI model. The algorithm used determines how requests are routed and has significant impact on performance, resource utilization, and fault tolerance. Different algorithms suit different workloads.',
    realWorldExample: 'Google uses a multi-layer load balancing strategy: Maglev (Google\'s software load balancer) handles external traffic using consistent hashing at Layer 4, while Envoy proxy handles Layer 7 load balancing with health checks, circuit breaking, and retries. Kubernetes uses iptables-based kube-proxy for service-level load balancing with round-robin by default.',
    realWorldCompany: 'Google',
    advantages: [
      'Eliminates single point of failure — traffic reroutes around failed servers',
      'Enables horizontal scaling by adding servers behind the balancer',
      'SSL termination reduces CPU load on application servers',
      'Health checks automatically remove unhealthy servers',
      'Session persistence enables stateful applications',
    ],
    disadvantages: [
      'Load balancer itself can become a bottleneck or single point of failure',
      'Session affinity complicates scaling and fault tolerance',
      'Layer 7 load balancing adds latency due to HTTP parsing',
      'Stateful applications require sticky sessions or external session storage',
    ],
    useCases: [
      'Web application traffic distribution',
      'API gateway and microservices routing',
      'Database read replica load distribution',
      'Global traffic management across data centers',
      'Blue-green deployments and canary releases',
    ],
    interviewQuestions: [
      {
        id: 'lb-1',
        question: 'What is the difference between Layer 4 and Layer 7 load balancing?',
        difficulty: 'Medium',
        answer: 'L4 (Transport): Routes based on IP and TCP/UDP port. Fast, low overhead, cannot inspect content. Used for simple TCP load balancing. L7 (Application): Inspects HTTP headers, cookies, URL paths. Can route based on content (e.g., /api → API servers, /static → CDN). Enables session persistence, A/B testing, and content-based routing. More overhead but much more flexible.',
      },
      {
        id: 'lb-2',
        question: 'When would you use weighted round robin over simple round robin?',
        difficulty: 'Easy',
        answer: 'Use weighted round robin when servers have different capacities. Example: Server A (16 cores) gets weight 4, Server B (4 cores) gets weight 1. For every 5 requests, A gets 4 and B gets 1. Use cases: heterogeneous hardware, gradual traffic shifting during canary deploys (weight 5% to new version), or gradually warming up a new server.',
      },
      {
        id: 'lb-3',
        question: 'How does a load balancer detect unhealthy servers?',
        difficulty: 'Easy',
        answer: 'Health checks: Active (LB probes servers) or Passive (LB monitors traffic). Active checks: TCP port check (is port open?), HTTP check (GET /health → 200 OK), application-level check (query returns expected data). Configuration: interval (5s), timeout (2s), thresholds (2 failures = unhealthy, 3 successes = healthy). Unhealthy servers are removed from pool; new requests go to healthy servers.',
      },
      {
        id: 'lb-4',
        question: 'What is the difference between IP hashing and consistent hashing in load balancing?',
        difficulty: 'Hard',
        answer: 'IP hashing: hash(client_IP) % N servers. Simple, session affinity without cookies, but 1/N keys remapped when server count changes. Consistent hashing: places servers on ring, client IP maps to ring position. Only K/N keys remapped on server changes. Consistent hashing is superior for stateful applications and when server pool changes frequently (auto-scaling).',
      },
      {
        id: 'lb-5',
        question: 'How would you implement a global load balancer for a multi-region application?',
        difficulty: 'Hard',
        answer: 'Global load balancing with Anycast IP: same IP announced from multiple regions, BGP routing sends users to nearest data center. DNS-based GSLB: Route53/Cloudflare returns different IPs based on user location and health. GeoDNS + health checks: route to nearest healthy region, failover on outage. Latency-based routing: measure actual latency to each region, route to lowest. Implement with: AWS Route53 (latency routing), GCP Global Load Balancer, or Cloudflare.',
      },
    ],
    scalingExplanation: 'Load balancing progression: DNS round-robin (simplest, slow failover) → Software LB (HAProxy/Nginx, 100K+ RPS) → Hardware LB (F5, millions RPS, expensive) → Anycast + software LB (global, infinite scale). Modern cloud-native: Envoy proxy sidecar (per-pod) + Kubernetes service + cloud load balancer = three tiers of load balancing.',
    visualizerType: 'round-robin',
    concepts: [
      {
        id: 'round-robin',
        title: 'Round Robin',
        description: 'Distributes requests sequentially across all servers in a circular pattern.',
        howItWorks: [
          'Maintain a pointer to the next server in the list',
          'Route each request to the current server',
          'Advance the pointer to the next server',
          'Wrap around to the first server after the last',
        ],
        tradeoffs: [
          { pro: 'Simple to implement and understand', con: 'Does not account for server load or capacity' },
          { pro: 'Equal distribution for uniform requests', con: 'Long-running requests create imbalance' },
        ],
        visualizerType: 'round-robin',
      },
      {
        id: 'weighted-round-robin',
        title: 'Weighted Round Robin',
        description: 'Extends round robin by assigning weights to servers based on their capacity.',
        howItWorks: [
          'Assign a weight (capacity score) to each server',
          'High-weight servers receive proportionally more requests',
          'Cycle through servers using weight-based selection',
          'Adjust weights dynamically as capacity changes',
        ],
        tradeoffs: [
          { pro: 'Optimizes for heterogeneous server capacities', con: 'Static weights do not adapt to current load' },
          { pro: 'Enables gradual traffic shifting for deployments', con: 'More complex than simple round robin' },
        ],
        visualizerType: 'round-robin',
      },
      {
        id: 'ip-hashing',
        title: 'IP Hash',
        description: 'Routes requests from the same client IP to the same server using a hash function.',
        howItWorks: [
          'Hash the client IP address to produce a numeric value',
          'Map the hash value to a server using modulo operation',
          'Same client always routes to the same server',
          'Provides natural session persistence without cookies',
        ],
        tradeoffs: [
          { pro: 'Session persistence without application changes', con: 'Uneven distribution if traffic comes from few IPs (NAT)' },
          { pro: 'Useful for stateful applications', con: 'Server changes cause remapping of many clients' },
        ],
        visualizerType: 'round-robin',
      },
      {
        id: 'least-connection',
        title: 'Least Connection',
        description: 'Routes each new request to the server with the fewest active connections.',
        howItWorks: [
          'Load balancer tracks active connection count per server',
          'New request routed to server with minimum connections',
          'Connection count decremented when connection closes',
          'Ties broken by round robin or random selection',
        ],
        tradeoffs: [
          { pro: 'Adapts to variable request durations', con: 'Requires connection tracking state in LB' },
          { pro: 'Better than round robin for long-lived connections', con: 'Active connections ≠ actual server load' },
        ],
        visualizerType: 'round-robin',
      },
      {
        id: 'weighted-least-connection',
        title: 'Weighted Least Connection',
        description: 'Combines weighted routing with least connection tracking for optimal distribution.',
        howItWorks: [
          'Track active connections per server',
          'Calculate effective load: connections / weight',
          'Route to server with lowest effective load score',
          'Balances both capacity differences and current load',
        ],
        tradeoffs: [
          { pro: 'Most accurate load distribution in heterogeneous clusters', con: 'Highest implementation complexity' },
          { pro: 'Adapts to both capacity and load dynamically', con: 'Requires accurate weight configuration' },
        ],
        visualizerType: 'round-robin',
      },
      {
        id: 'least-response-time',
        title: 'Least Response Time',
        description: 'Routes requests to the server with the lowest average response time, combining speed and load.',
        howItWorks: [
          'Track rolling average response time per server',
          'Combine response time with active connections',
          'Route to server with lowest combined score',
          'Continuously update metrics based on recent requests',
        ],
        tradeoffs: [
          { pro: 'Optimizes for end-user latency directly', con: 'Requires response time measurement overhead' },
          { pro: 'Naturally routes away from degraded servers', con: 'Historical averages may lag actual performance' },
        ],
        visualizerType: 'round-robin',
      },
      {
        id: 'resource-based',
        title: 'Resource Based',
        description: 'Routes based on actual server resource utilization (CPU, memory) reported via health agents.',
        howItWorks: [
          'Servers run a lightweight agent reporting CPU/RAM/disk',
          'Load balancer collects resource metrics from agents',
          'Route requests to servers with most available resources',
          'Dynamic adaptation to actual system load',
        ],
        tradeoffs: [
          { pro: 'Most accurate load distribution possible', con: 'Requires agent software on every server' },
          { pro: 'Handles heterogeneous workloads excellently', con: 'Metric collection adds network overhead' },
        ],
        visualizerType: 'round-robin',
      },
    ],
    lastUpdated: '2024-01-15',
  },
]

export const sidebarSections = [
  {
    id: 'basics' as const,
    label: 'Basics',
    icon: '📚',
    topics: topics
      .filter((t) => t.category === 'basics')
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji })),
  },
  {
    id: 'scalability' as const,
    label: 'Scalability',
    icon: '📈',
    topics: [],
  },
  {
    id: 'database' as const,
    label: 'Database',
    icon: '🗄️',
    topics: topics
      .filter((t) => t.category === 'database')
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji })),
  },
  {
    id: 'load-balancing' as const,
    label: 'Load Balancing',
    icon: '⚖️',
    topics: topics
      .filter((t) => t.category === 'load-balancing')
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji })),
  },
  {
    id: 'distributed-systems' as const,
    label: 'Distributed Systems',
    icon: '🌐',
    topics: topics
      .filter((t) => t.category === 'distributed-systems')
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji })),
  },
  {
    id: 'messaging-queue' as const,
    label: 'Messaging Queue',
    icon: '📨',
    topics: [],
  },
  {
    id: 'caching' as const,
    label: 'Caching',
    icon: '⚡',
    topics: [],
  },
  {
    id: 'cdn' as const,
    label: 'CDN',
    icon: '🌍',
    topics: [],
  },
  {
    id: 'microservices' as const,
    label: 'Microservices',
    icon: '🏗️',
    topics: topics
      .filter((t) => t.category === 'microservices')
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji })),
  },
  {
    id: 'cap-theorem' as const,
    label: 'CAP Theorem',
    icon: '📐',
    topics: topics
      .filter((t) => t.category === 'cap-theorem')
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji })),
  },
]
