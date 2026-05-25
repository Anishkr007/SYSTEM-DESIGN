import { Topic } from "@/types";

export const topicsV3: Topic[] = [
  // ═══════════════════════════════════════════════════════
  // PHASE 1: INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════
  {
    id: "api-gateway",
    slug: "api-gateway",
    title: "API Gateway",
    emoji: "🔌",
    category: "networking",
    difficulty: "intermediate",
    summary: "The single entry point for all client requests in a microservices architecture — handling routing, authentication, rate limiting, and request aggregation.",
    definition: "An API Gateway is a server that acts as a reverse proxy, routing requests from clients to the appropriate microservice. It handles cross-cutting concerns like authentication, SSL termination, rate limiting, request/response transformation, caching, and circuit breaking. Instead of clients communicating directly with dozens of services, they talk to one gateway that fans out requests. Modern gateways like Kong, Envoy, and AWS API Gateway also support API composition — aggregating responses from multiple services into a single response.",
    realWorldExample: "Netflix uses Zuul as its API Gateway, handling billions of requests daily. Zuul performs dynamic routing, monitoring, resiliency, and security. When a user opens the Netflix app, a single API call to Zuul triggers parallel requests to the user profile service, recommendation engine, and content catalog, which are aggregated into one response.",
    realWorldCompany: "Netflix",
    advantages: [
      "Single entry point simplifies client-side logic — clients don't need to know about individual services.",
      "Centralized authentication and authorization — services don't need to implement auth individually.",
      "Request aggregation reduces round trips — one client call triggers multiple backend calls.",
      "Rate limiting and throttling protect backend services from overload.",
      "Protocol translation — clients use REST while backends may use gRPC or GraphQL.",
      "Centralized logging and monitoring provides unified observability."
    ],
    disadvantages: [
      "Single point of failure — if the gateway goes down, the entire system is inaccessible.",
      "Added latency — every request passes through an additional network hop.",
      "Complexity — gateway configuration and routing rules can become very complex.",
      "Tight coupling risk — gateway can become a bottleneck if too much business logic is added.",
      "Deployment dependency — gateway changes require careful coordination.",
      "Scaling the gateway itself becomes critical under high traffic."
    ],
    useCases: [
      "Microservices architectures needing unified API access.",
      "Mobile apps requiring request aggregation to reduce battery usage.",
      "Multi-tenant SaaS platforms with per-tenant rate limiting.",
      "API monetization with tiered access and usage tracking.",
      "Legacy system migration — gateway fronts both old and new services.",
      "Cross-platform support — different response formats for web, mobile, IoT."
    ],
    interviewQuestions: [
      { id: "ag-q1", question: "What is the difference between an API Gateway and a Load Balancer?", answer: "A Load Balancer distributes traffic across multiple instances of the SAME service for horizontal scaling. An API Gateway routes requests to DIFFERENT services based on the request path, method, or headers. The gateway also handles cross-cutting concerns like auth, rate limiting, and response aggregation. In production, you typically have an API Gateway in front, which routes to a Load Balancer per service, which distributes to service instances.", difficulty: "Medium" },
      { id: "ag-q2", question: "How do you handle API Gateway failures?", answer: "Deploy multiple gateway instances behind a load balancer for high availability. Use health checks to detect and remove unhealthy instances. Implement circuit breakers to prevent cascade failures. Use a CDN or edge cache to serve cached responses when the gateway is degraded. Consider a 'sidecar' pattern where lightweight proxies (Envoy) run alongside each service as a fallback.", difficulty: "Hard" },
      { id: "ag-q3", question: "What is the BFF (Backend for Frontend) pattern?", answer: "BFF is a pattern where you create a dedicated API Gateway per client type — one for web, one for mobile, one for IoT. Each BFF is optimized for its client's needs: the mobile BFF returns smaller payloads, the web BFF includes richer data. This prevents the single gateway from becoming a monolith trying to serve all clients. Netflix and SoundCloud use this pattern.", difficulty: "Medium" },
      { id: "ag-q4", question: "How does an API Gateway handle request aggregation?", answer: "The gateway receives a single client request, fans it out to multiple backend services in parallel (e.g., user profile + recommendations + notifications), waits for all responses (with timeouts), merges them into a single response, and returns it to the client. This reduces client-side round trips from N to 1. If one backend is slow, the gateway can return partial results with a timeout.", difficulty: "Medium" }
    ],
    scalingExplanation: "Scale API Gateways horizontally by deploying multiple instances behind a cloud load balancer (ALB/NLB). Use sticky sessions only if absolutely necessary. Offload SSL termination to the load balancer. Implement connection pooling to backend services. Use Redis for shared rate limiting state across gateway instances. For global scale, deploy gateway instances in multiple regions with GeoDNS routing users to the nearest gateway.",
    visualizerType: "api-gateway",
    lastUpdated: "2024-05-24"
  },
  {
    id: "cdn-advanced",
    slug: "cdn-advanced",
    title: "CDN & Edge Computing",
    emoji: "🌍",
    category: "cdn",
    difficulty: "intermediate",
    summary: "Global content delivery networks that cache content at edge servers worldwide, reducing latency from hundreds of milliseconds to single digits.",
    definition: "A Content Delivery Network (CDN) is a geographically distributed network of proxy servers that cache content closer to end users. CDNs reduce latency by serving content from the nearest edge server instead of the origin. Modern CDNs like Cloudflare Workers and AWS CloudFront support edge computing — running custom logic at edge locations for dynamic content. CDNs handle cache invalidation through TTLs, purge APIs, and stale-while-revalidate strategies. They also provide DDoS protection, WAF capabilities, and TLS termination.",
    realWorldExample: "Cloudflare operates 300+ data centers in 100+ countries. When a user in Mumbai requests a website, Cloudflare serves cached content from its Mumbai PoP (Point of Presence) instead of routing to the origin server in Virginia. This reduces latency from ~200ms to ~5ms. Cloudflare Workers run serverless functions at the edge for dynamic personalization without hitting the origin.",
    realWorldCompany: "Cloudflare",
    advantages: [
      "Dramatically reduced latency — content served from nearest edge server.",
      "Origin server offloading — 80-95% of requests served from cache.",
      "DDoS protection — edge absorbs attack traffic before it reaches origin.",
      "Global scalability — handles traffic spikes without origin scaling.",
      "Improved SEO — faster page loads improve search rankings.",
      "Edge computing enables dynamic logic without origin round-trips."
    ],
    disadvantages: [
      "Cache invalidation is hard — stale content can be served after updates.",
      "Cost — CDN bandwidth costs scale with traffic volume.",
      "Cache miss penalty — first request to a PoP has higher latency.",
      "Dynamic content challenges — personalized content can't be cached easily.",
      "Debugging complexity — issues may only appear at specific edge locations.",
      "Vendor lock-in — CDN-specific features create switching costs."
    ],
    useCases: [
      "Static asset delivery (images, CSS, JS) for web applications.",
      "Video streaming platforms (Netflix, YouTube).",
      "E-commerce product pages with high traffic during sales.",
      "Gaming patch distribution to millions of players globally.",
      "API response caching for read-heavy workloads.",
      "Edge-side rendering for personalized content."
    ],
    interviewQuestions: [
      { id: "cdn-q1", question: "How does cache invalidation work in a CDN?", answer: "Three main strategies: (1) TTL-based — set a Time-To-Live on cached content; after expiry, the edge fetches fresh content from origin. (2) Purge API — actively invalidate specific URLs or patterns when content changes. (3) Stale-while-revalidate — serve stale content immediately while fetching fresh content in the background. Most CDNs also support cache tags for grouped invalidation.", difficulty: "Medium" },
      { id: "cdn-q2", question: "What is the difference between Push CDN and Pull CDN?", answer: "Pull CDN: Content is fetched from the origin on the first request to each edge, then cached. Subsequent requests are served from cache. This is simpler but has a 'cold start' penalty. Push CDN: Content is proactively uploaded to all edge servers before any user requests it. This eliminates cold starts but requires more storage and management. Most modern CDNs use Pull with pre-warming for critical content.", difficulty: "Easy" },
      { id: "cdn-q3", question: "How would you design a CDN for a video streaming platform?", answer: "Use adaptive bitrate streaming (HLS/DASH) to segment videos into small chunks. Cache popular chunks at edge servers closest to viewers. Use predictive pre-caching based on viewing patterns. Implement multi-tier caching (edge → regional → origin). Use origin shielding to reduce origin load. For live streaming, use edge ingest points and multicast distribution.", difficulty: "Hard" }
    ],
    scalingExplanation: "CDNs scale by adding more Points of Presence (PoPs) globally. Each PoP contains multiple cache servers with SSD storage. Use anycast routing so clients automatically connect to the nearest PoP. Implement tiered caching — edge PoPs → regional hubs → origin shield → origin server — to maximize cache hit rates. For dynamic content, use edge computing (Cloudflare Workers, Lambda@Edge) to run logic at the edge without origin round-trips.",
    visualizerType: "cdn-advanced",
    lastUpdated: "2024-05-24"
  },
  {
    id: "db-replication",
    slug: "db-replication",
    title: "Database Replication",
    emoji: "🔄",
    category: "database",
    difficulty: "advanced",
    summary: "Keep multiple copies of your database in sync for high availability, fault tolerance, and read scaling — with tradeoffs between consistency and performance.",
    definition: "Database replication is the process of copying data from one database server (primary/master) to one or more other servers (replicas/slaves). In single-leader replication, all writes go to the primary, which streams changes to replicas via a replication log (WAL in PostgreSQL, binlog in MySQL). Multi-leader replication allows writes to any node but requires conflict resolution. Leaderless replication (Dynamo-style) uses quorum reads/writes for consistency. Replication enables read scaling, geographic distribution, and failover.",
    realWorldExample: "GitHub uses MySQL with primary-replica replication across three data centers. All writes go to the primary in one DC, and changes replicate asynchronously to replicas in other DCs. When a user pushes code, it's written to the primary, then replicated within milliseconds. If the primary DC fails, GitHub promotes a replica to primary using Orchestrator, their automated failover tool.",
    realWorldCompany: "GitHub",
    advantages: [
      "High availability — if the primary fails, a replica can be promoted.",
      "Read scaling — distribute read queries across multiple replicas.",
      "Geographic distribution — place replicas near users for lower latency.",
      "Disaster recovery — replicas in different regions protect against DC failures.",
      "Backup without downtime — take backups from replicas instead of primary.",
      "Analytics isolation — run heavy queries on dedicated read replicas."
    ],
    disadvantages: [
      "Replication lag — replicas may serve stale data.",
      "Write bottleneck — all writes must go through the single primary.",
      "Failover complexity — promoting a replica requires careful coordination.",
      "Increased storage costs — every replica stores a full copy of data.",
      "Conflict resolution — multi-leader replication can have write conflicts.",
      "Monitoring overhead — must track replication lag across all replicas."
    ],
    useCases: [
      "Read-heavy applications (90% reads) like social media feeds.",
      "Global applications needing low-latency reads in multiple regions.",
      "High-availability systems requiring 99.99% uptime.",
      "Analytics workloads isolated from production traffic.",
      "Disaster recovery with cross-region replicas.",
      "Blue-green deployments with replica-based schema migrations."
    ],
    interviewQuestions: [
      { id: "dbr-q1", question: "What is replication lag and how do you handle it?", answer: "Replication lag is the delay between a write on the primary and its appearance on replicas. Solutions: (1) Read-your-writes consistency — route a user's reads to the primary for a short time after their writes. (2) Causal consistency — track dependencies and ensure replicas serve reads in causal order. (3) Synchronous replication for critical data (at the cost of latency). (4) Monitor lag and route reads to replicas only when lag is below threshold.", difficulty: "Medium" },
      { id: "dbr-q2", question: "How does leader election work during failover?", answer: "When the primary fails: (1) Detection — replicas and monitoring detect the failure via heartbeat timeout. (2) Election — replicas compare their replication positions; the most up-to-date replica is elected. Tools like PostgreSQL Patroni or MySQL Orchestrator automate this. (3) Promotion — the chosen replica stops replication and becomes the new primary. (4) Reconfiguration — other replicas re-point to the new primary. (5) DNS/proxy update — route writes to the new primary.", difficulty: "Hard" },
      { id: "dbr-q3", question: "What is the difference between synchronous and asynchronous replication?", answer: "Synchronous: The primary waits for at least one replica to confirm the write before acknowledging to the client. Guarantees zero data loss but adds latency (2x write time). Asynchronous: The primary acknowledges immediately and streams changes to replicas in the background. Lower latency but risks data loss if the primary fails before replication. Semi-synchronous is a compromise — wait for one replica, replicate to others async.", difficulty: "Easy" }
    ],
    scalingExplanation: "Scale reads by adding more replicas (PostgreSQL supports dozens of streaming replicas). Use connection pooling (PgBouncer) to efficiently distribute read queries. For write scaling, consider sharding (splitting data across multiple primaries) since replication alone doesn't scale writes. Use ProxySQL or HAProxy to automatically route reads to replicas and writes to the primary. Monitor replication lag with pg_stat_replication or SHOW SLAVE STATUS.",
    visualizerType: "db-replication",
    lastUpdated: "2024-05-24"
  },

  // ═══════════════════════════════════════════════════════
  // PHASE 2: DISTRIBUTED PATTERNS
  // ═══════════════════════════════════════════════════════
  {
    id: "distributed-transactions",
    slug: "distributed-transactions",
    title: "Distributed Transactions",
    emoji: "🔗",
    category: "distributed-systems",
    difficulty: "advanced",
    summary: "Coordinate transactions across multiple services — ensuring all-or-nothing semantics in a distributed world using 2PC, SAGA, and eventual consistency patterns.",
    definition: "Distributed transactions ensure that a group of operations across multiple services either all succeed or all fail. Two-Phase Commit (2PC) uses a coordinator that first asks all participants to 'prepare' (vote yes/no), then issues a global 'commit' or 'abort'. SAGA pattern breaks the transaction into a sequence of local transactions, each with a compensating action (rollback). Orchestration SAGA uses a central coordinator; Choreography SAGA uses events. In practice, most systems prefer SAGAs with eventual consistency over 2PC due to 2PC's blocking nature.",
    realWorldExample: "When you book a trip on Expedia, three services must coordinate: flight booking, hotel reservation, and payment processing. If payment fails after the flight is booked, the flight must be cancelled. Expedia uses the SAGA pattern — each service publishes events, and compensating transactions (cancellations) are triggered on failure. This ensures the user is never charged for a cancelled flight.",
    realWorldCompany: "Expedia",
    advantages: [
      "Data consistency across multiple services and databases.",
      "SAGA pattern avoids the blocking nature of 2PC.",
      "Compensating transactions provide clear rollback semantics.",
      "Event-driven SAGAs enable loose coupling between services.",
      "Supports long-running transactions (minutes/hours) unlike 2PC.",
      "Audit trail — every step and compensation is logged."
    ],
    disadvantages: [
      "2PC is blocking — if the coordinator fails, participants are stuck.",
      "SAGA compensations can be complex to implement correctly.",
      "Eventual consistency means temporary inconsistencies are visible.",
      "Debugging distributed transactions is extremely difficult.",
      "Network partitions can cause split-brain scenarios.",
      "Performance overhead from coordination and logging."
    ],
    useCases: [
      "E-commerce order processing (payment + inventory + shipping).",
      "Travel booking (flights + hotels + car rentals).",
      "Banking transfers between accounts in different systems.",
      "Supply chain management across multiple vendors.",
      "Subscription services (billing + access provisioning).",
      "Healthcare systems coordinating across multiple providers."
    ],
    interviewQuestions: [
      { id: "dt-q1", question: "What is the difference between 2PC and SAGA?", answer: "2PC (Two-Phase Commit) is a blocking protocol where a coordinator asks all participants to prepare, then commits or aborts atomically. It guarantees strong consistency but blocks if the coordinator fails. SAGA is a sequence of local transactions with compensating actions. If step 3 fails, compensating transactions undo steps 2 and 1. SAGA provides eventual consistency, is non-blocking, and handles long-running transactions. Most modern microservices prefer SAGA over 2PC.", difficulty: "Medium" },
      { id: "dt-q2", question: "What is the difference between orchestration and choreography in SAGA?", answer: "Orchestration: A central SAGA coordinator tells each service what to do and handles failures. Simple to understand and debug, but the coordinator is a single point of failure. Choreography: Each service listens for events and decides what to do next. No central coordinator, more resilient, but harder to track the overall transaction state. Use orchestration for complex flows and choreography for simple 2-3 step flows.", difficulty: "Hard" },
      { id: "dt-q3", question: "How do you handle idempotency in distributed transactions?", answer: "Every operation must be safe to retry. Use idempotency keys — unique IDs for each transaction step. Store processed IDs in a database and skip duplicates. For payments, Stripe uses idempotency keys so retrying a charge with the same key returns the original result without double-charging. Implement 'exactly-once' semantics by combining 'at-least-once' delivery with idempotent receivers.", difficulty: "Medium" }
    ],
    scalingExplanation: "Avoid distributed transactions when possible by designing services with clear ownership boundaries. When necessary, use SAGA with an event bus (Kafka) for reliable event delivery. Implement outbox pattern — write events to a local outbox table in the same transaction as the business data, then publish asynchronously. Use dead letter queues for failed compensations. Monitor SAGA state machines to detect stuck transactions.",
    visualizerType: "distributed-tx",
    lastUpdated: "2024-05-24"
  },
  {
    id: "websockets",
    slug: "websockets",
    title: "WebSockets & Real-Time",
    emoji: "⚡",
    category: "real-time",
    difficulty: "intermediate",
    summary: "Enable bi-directional, persistent connections between clients and servers for real-time communication — from chat apps to live dashboards.",
    definition: "WebSockets provide full-duplex communication channels over a single TCP connection, enabling real-time data transfer between client and server. Unlike HTTP's request-response model, WebSockets allow the server to push data to clients without polling. The connection starts as an HTTP request with an 'Upgrade' header, then switches to the WebSocket protocol. Alternatives include Server-Sent Events (SSE) for one-way server→client streams, Long Polling for compatibility, and HTTP/2 Server Push. For scaling, WebSocket connections are stateful, requiring sticky sessions or a pub/sub system (Redis) for multi-server deployments.",
    realWorldExample: "Discord handles millions of concurrent WebSocket connections for real-time messaging. Each client maintains a persistent WebSocket connection to a gateway server. When a user sends a message, the gateway publishes it to a message broker, which fans it out to all gateway servers with connected channel members. Discord uses a custom Elixir-based gateway that handles 1M+ concurrent connections per server.",
    realWorldCompany: "Discord",
    advantages: [
      "True real-time — sub-millisecond message delivery.",
      "Reduced overhead — no HTTP headers on every message after handshake.",
      "Bi-directional — both client and server can initiate communication.",
      "Persistent connection — no reconnection overhead per message.",
      "Lower latency than polling — no wasted requests checking for updates.",
      "Efficient for high-frequency updates (gaming, trading, IoT)."
    ],
    disadvantages: [
      "Stateful connections make horizontal scaling complex.",
      "Connection management overhead — each connection consumes server resources.",
      "Not cacheable — CDNs can't cache WebSocket traffic.",
      "Firewall/proxy issues — some networks block WebSocket upgrades.",
      "Reconnection logic required — connections drop and must be re-established.",
      "Higher server resource usage compared to HTTP request-response."
    ],
    useCases: [
      "Chat applications (WhatsApp, Slack, Discord).",
      "Live sports scores and stock tickers.",
      "Collaborative editing (Google Docs, Figma).",
      "Online gaming with real-time state synchronization.",
      "IoT device communication and telemetry.",
      "Live dashboards and monitoring systems."
    ],
    interviewQuestions: [
      { id: "ws-q1", question: "How do you scale WebSocket servers horizontally?", answer: "WebSocket connections are stateful — a message for user A must reach the server holding A's connection. Solutions: (1) Use a pub/sub system (Redis Pub/Sub or Kafka) — when server 1 receives a message for a user on server 2, it publishes to a channel that server 2 subscribes to. (2) Sticky sessions via load balancer — route all connections from the same user to the same server. (3) Use a connection registry (Redis) mapping user IDs to server IDs.", difficulty: "Hard" },
      { id: "ws-q2", question: "What are the differences between Polling, Long Polling, SSE, and WebSockets?", answer: "Polling: Client repeatedly sends HTTP requests at intervals. Simple but wasteful. Long Polling: Client sends a request, server holds it open until data is available. Reduces empty responses but still HTTP overhead per message. SSE (Server-Sent Events): Server pushes data to client over a persistent HTTP connection. One-way only (server→client). WebSockets: Full-duplex, bi-directional persistent connection. Lowest latency, highest complexity. Choose based on needs: SSE for notifications, WebSockets for chat/gaming.", difficulty: "Medium" },
      { id: "ws-q3", question: "How does the WebSocket handshake work?", answer: "The client sends a standard HTTP GET request with headers: 'Connection: Upgrade', 'Upgrade: websocket', and a 'Sec-WebSocket-Key'. The server validates, responds with HTTP 101 (Switching Protocols) and a 'Sec-WebSocket-Accept' header (computed from the client's key). After this handshake, the TCP connection is upgraded from HTTP to the WebSocket protocol, and both sides can send frames without HTTP overhead.", difficulty: "Easy" }
    ],
    scalingExplanation: "Scale WebSockets using a connection-aware architecture: Deploy WebSocket gateway servers behind a Layer 4 load balancer with sticky sessions. Use Redis Pub/Sub as the message bus — when a message arrives at gateway A but the recipient is connected to gateway B, gateway A publishes to Redis, gateway B receives and delivers. Each gateway server can handle 100K-1M concurrent connections depending on hardware. Use heartbeat/ping-pong frames to detect dead connections and free resources.",
    visualizerType: "websocket",
    lastUpdated: "2024-05-24"
  },
  {
    id: "stream-processing",
    slug: "stream-processing",
    title: "Stream Processing",
    emoji: "🌊",
    category: "real-time",
    difficulty: "advanced",
    summary: "Process infinite data streams in real-time — from Uber's GPS tracking to stock market fraud detection — using Apache Flink, Kafka Streams, and Spark Streaming.",
    definition: "Stream processing is a data processing paradigm where data is processed continuously as it arrives, rather than in batches. Unlike batch processing (MapReduce) which processes finite datasets, stream processing handles unbounded, continuous data flows. Key concepts include event time vs. processing time, windowing (tumbling, sliding, session windows), watermarks for late data, exactly-once semantics, and state management. Frameworks like Apache Flink provide stateful stream processing with fault tolerance via checkpointing.",
    realWorldExample: "Uber processes GPS events from millions of drivers in real-time using Apache Flink. Every second, driver locations are streamed to Flink, which computes ETAs, detects surge pricing zones, matches riders to drivers, and updates the live map. Flink processes these events with sub-second latency, maintaining driver state across millions of parallel streams with exactly-once guarantees.",
    realWorldCompany: "Uber",
    advantages: [
      "Real-time insights — process data as it arrives, not hours later.",
      "Low latency — sub-second processing for time-critical applications.",
      "Continuous processing — no batch scheduling or waiting.",
      "Stateful processing — maintain running aggregates, windows, and sessions.",
      "Exactly-once semantics — guaranteed correct results even with failures.",
      "Natural fit for event-driven architectures."
    ],
    disadvantages: [
      "Higher complexity than batch processing.",
      "State management — checkpointing and recovery add overhead.",
      "Late data handling — watermarks and allowed lateness add complexity.",
      "Debugging is harder — can't easily replay infinite streams.",
      "Resource-intensive — continuous processing uses more compute.",
      "Ordering guarantees are difficult across distributed partitions."
    ],
    useCases: [
      "Real-time fraud detection in financial transactions.",
      "GPS tracking and ETA calculation for ride-sharing.",
      "IoT sensor data processing and anomaly detection.",
      "Real-time recommendation engines.",
      "Live dashboards and operational monitoring.",
      "Click-stream analytics for A/B testing."
    ],
    interviewQuestions: [
      { id: "sp-q1", question: "What is the difference between event time and processing time?", answer: "Event time is when the event actually occurred (embedded timestamp). Processing time is when the system processes the event. They differ due to network delays, buffering, and out-of-order delivery. Event time processing gives correct results (e.g., 'count clicks per minute' uses the actual click times) but requires watermarks to handle late data. Processing time is simpler but can give incorrect results when events arrive out of order.", difficulty: "Medium" },
      { id: "sp-q2", question: "What are watermarks in stream processing?", answer: "Watermarks are a mechanism to track progress in event time. A watermark W(t) declares that all events with timestamp ≤ t have arrived. When a watermark passes the end of a window, the window can be closed and results emitted. Late events (after the watermark) can be handled by allowed lateness — keeping windows open longer — or side outputs. Watermarks balance completeness (waiting for late data) vs. latency (emitting results quickly).", difficulty: "Hard" },
      { id: "sp-q3", question: "How does Apache Flink achieve exactly-once semantics?", answer: "Flink uses distributed snapshots (Chandy-Lamport algorithm) called checkpoints. Periodically, Flink injects checkpoint barriers into the stream. Each operator saves its state to durable storage (HDFS/S3) when it receives the barrier. On failure, Flink restores state from the latest checkpoint and replays events from that point using Kafka offsets. Combined with idempotent sinks, this provides exactly-once end-to-end guarantees.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale stream processing by partitioning the input stream (Kafka partitions) and processing each partition independently. Flink scales by increasing parallelism — each operator runs on multiple task slots across a cluster. Use key-based partitioning so related events go to the same partition. For stateful operators, state is sharded by key and stored in RocksDB. Scale the Kafka cluster and Flink TaskManagers independently based on throughput and state size.",
    visualizerType: "stream-processing",
    lastUpdated: "2024-05-24"
  },
  {
    id: "distributed-locking",
    slug: "distributed-locking",
    title: "Distributed Locking",
    emoji: "🔒",
    category: "distributed-systems",
    difficulty: "advanced",
    summary: "Coordinate access to shared resources across multiple servers — preventing race conditions in distributed systems using Redis, ZooKeeper, and consensus algorithms.",
    definition: "A distributed lock ensures that only one process across multiple servers can access a shared resource at any time. Unlike local mutexes, distributed locks must handle network failures, clock skew, and process crashes. Redis-based locks use SET NX EX (set if not exists with expiry). The Redlock algorithm uses multiple independent Redis instances for safety. ZooKeeper uses ephemeral sequential nodes for leader election and locking. Key challenges include lock expiry (what if the holder crashes?), fencing tokens (preventing stale locks), and the trade-off between safety and liveness.",
    realWorldExample: "Stripe uses distributed locks to prevent double-charging. When processing a payment, a lock is acquired using the idempotency key. If two servers receive the same payment request simultaneously, only one acquires the lock and processes the charge. The other waits and returns the first result. Stripe uses Redis with fencing tokens to ensure that even if a lock expires prematurely, the stale holder's operations are rejected.",
    realWorldCompany: "Stripe",
    advantages: [
      "Prevents race conditions in distributed environments.",
      "Enables mutual exclusion across multiple servers.",
      "Supports leader election for master-slave architectures.",
      "Fencing tokens prevent stale lock holders from corrupting data.",
      "TTL-based expiry prevents deadlocks from crashed processes.",
      "Essential for distributed coordination and scheduling."
    ],
    disadvantages: [
      "Network partitions can cause split-brain — two processes think they hold the lock.",
      "Clock skew can cause premature lock expiry.",
      "Blocking locks reduce system throughput.",
      "Redis single-instance locks aren't safe during failover.",
      "Redlock algorithm is controversial — relies on timing assumptions.",
      "Added latency and complexity for every locked operation."
    ],
    useCases: [
      "Preventing double payment processing.",
      "Ensuring only one cron job instance runs at a time.",
      "Leader election in distributed databases.",
      "Distributed rate limiting with atomic counters.",
      "Inventory management — preventing overselling.",
      "Database migration coordination across multiple servers."
    ],
    interviewQuestions: [
      { id: "dl-q1", question: "How does the Redlock algorithm work?", answer: "Redlock uses N independent Redis instances (typically 5). To acquire a lock: (1) Get current time. (2) Try to acquire the lock on all N instances with the same key, random value, and TTL. (3) The lock is acquired if it's set on the majority (N/2+1) of instances and the elapsed time is less than the TTL. (4) If acquired, the effective TTL is the original TTL minus the elapsed time. (5) If not acquired, release the lock on all instances. This provides safety even if individual Redis instances fail.", difficulty: "Hard" },
      { id: "dl-q2", question: "What is a fencing token and why is it important?", answer: "A fencing token is a monotonically increasing number issued with each lock acquisition. When a client acquires lock #34, it passes token 34 to all operations. The storage system rejects operations with tokens ≤ the highest token it's seen. This prevents a scenario where client A acquires lock, pauses (GC pause), lock expires, client B acquires lock #35 and writes, then client A resumes with stale lock #34 and overwrites B's changes. With fencing, A's write is rejected because 34 < 35.", difficulty: "Hard" },
      { id: "dl-q3", question: "When should you use distributed locks vs. other approaches?", answer: "Use distributed locks when you need mutual exclusion for correctness (e.g., preventing double-spending). For performance optimization (e.g., avoiding duplicate work), consider advisory locks or idempotency instead — they're simpler and more resilient. If the operation is idempotent, skip the lock and just retry. If you need ordering, use a distributed queue instead. Locks should be a last resort due to their complexity.", difficulty: "Medium" }
    ],
    scalingExplanation: "Minimize the scope and duration of distributed locks. Use fine-grained locks (per-resource instead of global). Set aggressive TTLs to prevent stale locks. Consider optimistic concurrency control (version numbers) instead of locks where possible. For Redis locks, use Redis Cluster for availability. For ZooKeeper locks, deploy an odd-numbered ensemble (3 or 5 nodes). Monitor lock contention metrics and queue depths to detect bottlenecks.",
    visualizerType: "distributed-lock",
    lastUpdated: "2024-05-24"
  },

  // ═══════════════════════════════════════════════════════
  // PHASE 3: STORAGE & OBSERVABILITY
  // ═══════════════════════════════════════════════════════
  {
    id: "object-storage",
    slug: "object-storage",
    title: "Object Storage Systems",
    emoji: "💾",
    category: "storage",
    difficulty: "intermediate",
    summary: "Store and retrieve unlimited unstructured data — images, videos, backups — with 99.999999999% durability using systems like S3, GCS, and MinIO.",
    definition: "Object storage is a flat-namespace storage architecture where data is stored as objects (binary data + metadata + unique ID) in buckets, without a filesystem hierarchy. Unlike block storage (hard drives) or file storage (NFS), object storage is designed for massive scale, high durability, and HTTP-based access. Objects are immutable — updates create new versions. Data is replicated across multiple availability zones. AWS S3 stores trillions of objects and handles millions of requests per second. Internal architecture uses consistent hashing for data placement, erasure coding for durability, and metadata indexes for fast lookups.",
    realWorldExample: "Dropbox migrated from AWS S3 to their own object storage system called Magic Pocket, storing over 600 petabytes of user data. Magic Pocket splits files into encrypted chunks, applies erasure coding (splitting each chunk into 8 data + 4 parity blocks), and distributes them across multiple data centers. This achieves 99.9999999999% (twelve 9s) durability — meaning even losing entire racks of servers won't lose data.",
    realWorldCompany: "Dropbox",
    advantages: [
      "Virtually unlimited scalability — store petabytes without provisioning.",
      "Extreme durability — 11 nines (99.999999999%) via replication and erasure coding.",
      "Simple HTTP API — PUT/GET/DELETE with REST.",
      "Cost-effective — cheaper than block storage for large data volumes.",
      "Built-in versioning — recover any previous version of an object.",
      "Metadata-rich — attach custom metadata to objects for querying."
    ],
    disadvantages: [
      "Higher latency than block storage — not suitable for databases.",
      "No in-place updates — must rewrite entire objects.",
      "Eventual consistency for some operations (list after write).",
      "Egress costs — downloading data can be expensive.",
      "Not POSIX-compatible — can't mount as a filesystem easily.",
      "Large object uploads require multipart upload handling."
    ],
    useCases: [
      "User-generated content storage (photos, videos).",
      "Static website hosting and CDN origin.",
      "Data lake storage for analytics (Parquet, CSV files).",
      "Database backups and disaster recovery.",
      "Machine learning training data and model artifacts.",
      "Log archival and compliance data retention."
    ],
    interviewQuestions: [
      { id: "os-q1", question: "How does S3 achieve 11 nines of durability?", answer: "S3 replicates each object across at least 3 Availability Zones (physically separate data centers). Within each AZ, data is stored on multiple drives. S3 uses erasure coding — splitting data into fragments and generating parity fragments that can reconstruct the original even if some fragments are lost. S3 continuously monitors for bit rot, verifies checksums, and automatically re-replicates data when drives fail. The combination of geographic replication + erasure coding + continuous monitoring achieves 99.999999999% durability.", difficulty: "Medium" },
      { id: "os-q2", question: "What is multipart upload and why is it needed?", answer: "Multipart upload breaks a large file into smaller parts (5MB-5GB each), uploads them in parallel, then combines them on the server. Benefits: (1) Parallel uploads improve throughput. (2) Resume from failure — only re-upload failed parts. (3) Start upload before knowing total size (streaming). (4) Upload parts from different sources. S3 requires multipart for objects larger than 5GB. Best practice is to use multipart for anything over 100MB.", difficulty: "Easy" }
    ],
    scalingExplanation: "Object storage scales horizontally by adding more storage nodes. Use consistent hashing to distribute objects across nodes. Implement erasure coding instead of full replication to save storage (1.5x overhead vs 3x for triple replication). Use metadata indexes (LSM-tree based) for fast lookups. For extreme throughput, use S3 Transfer Acceleration or direct VPC endpoints. Shard buckets by prefix for high request rates.",
    visualizerType: "object-storage",
    lastUpdated: "2024-05-24"
  },
  {
    id: "monitoring-observability",
    slug: "monitoring-observability",
    title: "Monitoring & Observability",
    emoji: "📡",
    category: "observability",
    difficulty: "intermediate",
    summary: "The three pillars of observability — metrics, logs, and traces — that let you understand what's happening inside your production systems.",
    definition: "Observability is the ability to understand a system's internal state by examining its outputs. The three pillars are: Metrics — numerical measurements over time (CPU usage, request latency, error rate) collected by Prometheus and visualized in Grafana. Logs — timestamped text records of events, aggregated by the ELK stack (Elasticsearch, Logstash, Kibana) or Loki. Traces — end-to-end request paths across services, captured by Jaeger or Zipkin. Modern observability adds a fourth pillar: profiling (continuous profiling of CPU/memory usage). SRE teams use SLIs (indicators), SLOs (objectives), and SLAs (agreements) to define and measure reliability.",
    realWorldExample: "Google defined the SRE (Site Reliability Engineering) discipline, using observability as its foundation. Google monitors billions of metrics across millions of servers using Monarch (their internal time-series database). When Gmail's error rate exceeds 0.1% (the SLO), automated alerts page the on-call engineer. Engineers use distributed tracing to find the slow service in a 20-service request chain.",
    realWorldCompany: "Google",
    advantages: [
      "Early problem detection — catch issues before users are impacted.",
      "Faster debugging — metrics and traces pinpoint root causes quickly.",
      "Capacity planning — trend analysis predicts when to scale.",
      "SLO-based alerting reduces alert fatigue.",
      "Business metrics alignment — track revenue-impacting issues.",
      "Post-incident analysis with detailed telemetry data."
    ],
    disadvantages: [
      "High data volume — observability data can exceed application data.",
      "Cost — storing and querying metrics/logs/traces is expensive.",
      "Alert fatigue — poorly configured alerts desensitize teams.",
      "Instrumentation overhead — adding metrics/traces impacts performance.",
      "Tool sprawl — teams may use different tools for each pillar.",
      "Privacy concerns — logs may contain sensitive user data."
    ],
    useCases: [
      "Production system health monitoring.",
      "Incident detection and response.",
      "Performance optimization and bottleneck identification.",
      "Capacity planning and cost optimization.",
      "SLA compliance verification.",
      "Security anomaly detection."
    ],
    interviewQuestions: [
      { id: "mo-q1", question: "What are the three pillars of observability?", answer: "Metrics: Numeric measurements sampled over time (request count, latency P99, CPU usage). Best for alerting and dashboards. Tools: Prometheus, Datadog. Logs: Timestamped text records of discrete events. Best for debugging specific issues. Tools: ELK, Loki. Traces: End-to-end request paths showing latency per service. Best for understanding distributed system behavior. Tools: Jaeger, Zipkin. Together, they provide complete visibility into system behavior.", difficulty: "Easy" },
      { id: "mo-q2", question: "What is the difference between SLI, SLO, and SLA?", answer: "SLI (Service Level Indicator): A quantitative measure of service quality (e.g., 'request latency P99'). SLO (Service Level Objective): A target for the SLI (e.g., 'P99 latency < 200ms for 99.9% of requests'). SLA (Service Level Agreement): A contract with consequences if the SLO is not met (e.g., 'If uptime < 99.95%, customer gets service credits'). SLIs are measured, SLOs are goals, SLAs are contracts.", difficulty: "Medium" },
      { id: "mo-q3", question: "How would you design an alerting system that avoids alert fatigue?", answer: "Alert on SLO violations (symptoms) not individual metrics (causes). Use error budgets — only alert when the error budget burn rate is too high. Implement severity tiers: P1 (pages on-call) for customer-impacting issues, P2 (creates ticket) for degraded performance, P3 (dashboard only) for minor anomalies. Group related alerts to avoid notification storms. Every alert must have a runbook. Review and delete alerts that are never actionable.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale metrics collection with Prometheus federation — local Prometheus instances scrape services, a global instance aggregates. For logs, use structured logging (JSON) and ship to a centralized system (Loki, Elasticsearch) via agents (Fluentd, Vector). Implement sampling for traces — trace 1% of requests in production, 100% for errors. Use retention policies to automatically delete old data. Consider managed services (Datadog, Grafana Cloud) to avoid operational overhead.",
    visualizerType: "monitoring",
    lastUpdated: "2024-05-24"
  },
  {
    id: "distributed-tracing",
    slug: "distributed-tracing",
    title: "Distributed Tracing",
    emoji: "🔍",
    category: "observability",
    difficulty: "advanced",
    summary: "Follow a single request as it travels through dozens of microservices — identifying bottlenecks, failures, and latency sources across the entire system.",
    definition: "Distributed tracing tracks the journey of a request as it propagates through multiple services in a distributed system. Each request gets a unique trace ID that's passed via HTTP headers (W3C Trace Context or B3 headers). Each service creates a 'span' with start time, end time, service name, and metadata. Spans are organized in a parent-child tree showing the full request path. OpenTelemetry is the standard instrumentation framework. Tracing backends like Jaeger, Zipkin, and Tempo store and query traces. Key metrics derived from traces include service latency, error rates, and dependency graphs.",
    realWorldExample: "Uber uses Jaeger (which they created and open-sourced) to trace requests across 4,000+ microservices. When a rider requests a ride, the trace captures: API Gateway (5ms) → Authentication (3ms) → Rider Service (10ms) → Dispatch (50ms) → Driver Matching (30ms) → Pricing (15ms) → Notification (8ms). If the ride request takes 200ms instead of the expected 100ms, engineers can see exactly which service is the bottleneck.",
    realWorldCompany: "Uber",
    advantages: [
      "Pinpoint latency bottlenecks across service boundaries.",
      "Visualize request flow and service dependencies.",
      "Identify cascading failures and their root causes.",
      "Measure per-service latency contribution.",
      "Detect anomalies in request patterns.",
      "Essential for debugging microservice architectures."
    ],
    disadvantages: [
      "Instrumentation overhead — adding trace context impacts performance.",
      "Storage costs — traces for every request can be massive.",
      "Sampling trade-off — sampling reduces costs but may miss rare issues.",
      "Context propagation — all services must forward trace headers.",
      "Clock synchronization — distributed spans require synchronized clocks.",
      "Complex setup — requires instrumentation in every service."
    ],
    useCases: [
      "Debugging slow API responses in microservice architectures.",
      "Understanding service dependencies and call graphs.",
      "Identifying N+1 query problems across services.",
      "Performance regression detection after deployments.",
      "Root cause analysis during incidents.",
      "Capacity planning based on per-service load."
    ],
    interviewQuestions: [
      { id: "dtr-q1", question: "What are traces, spans, and trace context?", answer: "A Trace represents the entire journey of a request. A Span represents a single operation within a trace (e.g., a database query or HTTP call) with start time, duration, and metadata. Trace Context is the mechanism for propagating the trace ID and parent span ID across service boundaries — typically via HTTP headers (traceparent, tracestate). Each span references its parent span ID, forming a tree that shows the full request path. The root span represents the initial request.", difficulty: "Easy" },
      { id: "dtr-q2", question: "How do you handle the cost of distributed tracing at scale?", answer: "Use sampling strategies: (1) Head-based sampling — decide at the start whether to trace a request (e.g., 1% of requests). Simple but may miss errors. (2) Tail-based sampling — collect all spans, then decide which complete traces to keep based on criteria (errors, high latency, specific users). More expensive but catches important traces. (3) Priority sampling — always trace errors and slow requests, sample normal requests. Combine with dynamic sampling that increases during incidents.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale tracing infrastructure by implementing aggressive sampling in production (1-5% of normal traffic, 100% of errors). Use a collector pipeline (OpenTelemetry Collector) that batches and forwards spans. Store traces in a scalable backend like Tempo (uses object storage) or Elasticsearch. Set retention policies (keep detailed traces for 7 days, aggregated service maps for 30 days). Use tail-based sampling to capture important traces without storing everything.",
    visualizerType: "distributed-tracing",
    lastUpdated: "2024-05-24"
  },

  // ═══════════════════════════════════════════════════════
  // PHASE 4: DEVOPS
  // ═══════════════════════════════════════════════════════
  {
    id: "docker",
    slug: "docker",
    title: "Docker & Containers",
    emoji: "🐳",
    category: "devops",
    difficulty: "beginner",
    summary: "Package applications with all their dependencies into lightweight, portable containers that run identically everywhere — from a developer's laptop to production servers.",
    definition: "Docker is a platform for building, shipping, and running applications in containers. A container is an isolated, lightweight runtime environment that packages an application with its dependencies, libraries, and configuration. Unlike virtual machines, containers share the host OS kernel, making them start in seconds and use minimal resources. Docker images are built from Dockerfiles — declarative scripts that define the build process. Images are layered and cached for fast builds. Docker Compose orchestrates multi-container applications.",
    realWorldExample: "Spotify runs 1,800+ microservices, all containerized with Docker. Each service has its own Dockerfile that defines its runtime environment. When a developer pushes code, CI/CD builds a new Docker image, runs tests inside a container, and deploys to Kubernetes. This ensures that the same image that passed tests in CI is exactly what runs in production — eliminating 'works on my machine' issues.",
    realWorldCompany: "Spotify",
    advantages: [
      "Consistency — same container runs identically on dev, staging, and production.",
      "Isolation — each container has its own filesystem, network, and processes.",
      "Lightweight — containers start in seconds vs. minutes for VMs.",
      "Reproducibility — Dockerfile defines exact build steps.",
      "Efficient — multiple containers share the host OS kernel.",
      "Portability — run anywhere Docker is installed."
    ],
    disadvantages: [
      "Security — containers share the kernel, less isolated than VMs.",
      "Persistent storage — container filesystems are ephemeral by default.",
      "Networking complexity — container networking requires careful configuration.",
      "Image size — poorly built images can be hundreds of MBs.",
      "Monitoring — need container-aware monitoring tools.",
      "Learning curve — Dockerfile optimization requires expertise."
    ],
    useCases: [
      "Microservice deployment and packaging.",
      "Development environment standardization.",
      "CI/CD pipeline build and test environments.",
      "Legacy application modernization.",
      "Multi-tenant SaaS isolation.",
      "Machine learning model serving."
    ],
    interviewQuestions: [
      { id: "dk-q1", question: "What is the difference between a Docker image and a container?", answer: "An image is a read-only template containing the application code, runtime, libraries, and configuration — like a class in OOP. A container is a running instance of an image — like an object. You can create multiple containers from one image. Images are built from Dockerfiles and stored in registries (Docker Hub, ECR). Containers have a writable layer on top of the image layers for runtime state.", difficulty: "Easy" },
      { id: "dk-q2", question: "How do Docker image layers work?", answer: "Each instruction in a Dockerfile (FROM, RUN, COPY) creates a new read-only layer. Layers are cached — if a layer hasn't changed, Docker reuses the cached version. Layers are stacked (union filesystem). Place frequently changing instructions (COPY src) after stable ones (RUN apt-get install) to maximize cache hits. Multi-stage builds use one stage for building (with build tools) and copy only the final artifact to a minimal runtime image, reducing image size.", difficulty: "Medium" }
    ],
    scalingExplanation: "Docker itself is for single-host container management. For scaling across multiple hosts, use container orchestrators like Kubernetes or Docker Swarm. Use Docker Compose for local multi-container development. Optimize images with multi-stage builds and alpine base images. Use Docker registries (ECR, GCR) with image scanning for security. Implement resource limits (CPU, memory) per container to prevent noisy neighbors.",
    visualizerType: "docker",
    lastUpdated: "2024-05-24"
  },
  {
    id: "kubernetes",
    slug: "kubernetes",
    title: "Kubernetes",
    emoji: "☸️",
    category: "devops",
    difficulty: "advanced",
    summary: "The operating system for the cloud — automatically deploy, scale, and manage containerized applications across clusters of machines.",
    definition: "Kubernetes (K8s) is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. Core concepts: Pods (smallest deployable unit, one or more containers), Deployments (manage pod replicas and rolling updates), Services (stable networking for pods), Ingress (external HTTP routing), ConfigMaps/Secrets (configuration), and Namespaces (resource isolation). The control plane (API Server, etcd, Scheduler, Controller Manager) manages the cluster state. Worker nodes run pods via kubelet and container runtime.",
    realWorldExample: "Pinterest runs their entire platform on Kubernetes with 15,000+ pods across thousands of nodes. They handle 300 million monthly active users with automated scaling. During peak events (like holiday seasons), Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales services from 100 to 1,000+ pods based on CPU and custom metrics. Rolling deployments allow updating services with zero downtime.",
    realWorldCompany: "Pinterest",
    advantages: [
      "Automated scaling — HPA scales pods based on metrics.",
      "Self-healing — restarts failed containers, replaces unhealthy pods.",
      "Rolling updates — deploy new versions with zero downtime.",
      "Service discovery — automatic DNS for pod-to-pod communication.",
      "Resource optimization — bin-packing places pods efficiently on nodes.",
      "Multi-cloud portability — same manifests work on any K8s cluster."
    ],
    disadvantages: [
      "Steep learning curve — dozens of resource types and concepts.",
      "Operational complexity — managing a K8s cluster requires expertise.",
      "Networking complexity — pod networking, service mesh, ingress rules.",
      "Debugging difficulty — distributed pods make troubleshooting harder.",
      "Resource overhead — control plane uses non-trivial resources.",
      "YAML fatigue — verbose configuration files."
    ],
    useCases: [
      "Microservice deployment and management.",
      "Stateless web application autoscaling.",
      "CI/CD pipeline runners (Jenkins agents, GitLab runners).",
      "Machine learning training and model serving.",
      "Multi-tenant SaaS platforms.",
      "Edge computing with lightweight K8s distributions (K3s)."
    ],
    interviewQuestions: [
      { id: "k8-q1", question: "How does Kubernetes handle pod scaling?", answer: "Horizontal Pod Autoscaler (HPA) monitors pod metrics (CPU, memory, custom metrics) and adjusts the replica count. When CPU usage exceeds 70%, HPA increases replicas. When it drops below 50%, it scales down. Vertical Pod Autoscaler (VPA) adjusts resource requests/limits per pod. Cluster Autoscaler adds/removes nodes when pods can't be scheduled. KEDA (Kubernetes Event Driven Autoscaler) scales based on external events like Kafka queue depth.", difficulty: "Medium" },
      { id: "k8-q2", question: "What happens when you run 'kubectl apply' for a deployment?", answer: "1) kubectl sends the YAML to the API Server. 2) API Server validates and stores it in etcd. 3) Deployment Controller detects the new spec, creates a ReplicaSet. 4) ReplicaSet Controller creates Pod objects. 5) Scheduler assigns pods to nodes based on resource availability. 6) Kubelet on each node pulls the container image and starts the pod. 7) For rolling updates, a new ReplicaSet is created, new pods start, old pods terminate gradually. 8) Service endpoints are updated automatically.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale K8s clusters by adding worker nodes (auto-scaling groups in cloud). Use HPA for pod-level scaling and Cluster Autoscaler for node-level scaling. Implement resource requests and limits for every pod. Use pod disruption budgets for safe node maintenance. For large clusters (1000+ nodes), shard etcd and use multiple API server replicas. Consider managed K8s services (EKS, GKE, AKS) to avoid control plane management overhead.",
    visualizerType: "kubernetes",
    lastUpdated: "2024-05-24"
  },
  {
    id: "ci-cd",
    slug: "ci-cd",
    title: "CI/CD Pipelines",
    emoji: "🔄",
    category: "devops",
    difficulty: "intermediate",
    summary: "Automate the journey from code commit to production deployment — with continuous integration, testing, and delivery that catches bugs before users do.",
    definition: "CI/CD (Continuous Integration / Continuous Delivery / Continuous Deployment) automates the software release process. CI: Developers merge code frequently, triggering automated builds and tests. CD (Delivery): Every code change that passes tests is automatically prepared for release to production. CD (Deployment): Every passing change is automatically deployed to production without manual intervention. The pipeline typically includes: code lint → unit tests → build → integration tests → security scan → staging deployment → smoke tests → production deployment. Tools include GitHub Actions, Jenkins, GitLab CI/CD, CircleCI, and ArgoCD.",
    realWorldExample: "Amazon deploys code to production every 11.7 seconds on average — that's 7,000+ deployments per day across all services. Each deployment goes through automated testing, canary deployment (1% of traffic), monitoring for errors, and automatic rollback if error rates spike. This rapid iteration pace is only possible with fully automated CI/CD pipelines and strong observability.",
    realWorldCompany: "Amazon",
    advantages: [
      "Faster time to market — deploy multiple times per day.",
      "Fewer bugs in production — automated tests catch issues early.",
      "Consistent deployments — same process every time, no manual errors.",
      "Quick rollback — automated rollback when deployment fails.",
      "Developer productivity — developers focus on code, not deployment.",
      "Audit trail — every change and deployment is tracked."
    ],
    disadvantages: [
      "Initial setup complexity — building a robust pipeline takes time.",
      "Flaky tests — unreliable tests erode trust in the pipeline.",
      "Security risks — CI/CD pipelines have access to production credentials.",
      "Resource costs — running tests for every commit uses compute.",
      "Cultural change — requires team buy-in and discipline.",
      "Complexity for stateful services — database migrations are tricky."
    ],
    useCases: [
      "SaaS product development with frequent releases.",
      "Mobile app builds and distribution.",
      "Infrastructure as Code deployments.",
      "Machine learning model training and serving.",
      "Open source project automation.",
      "Multi-environment deployments (dev/staging/prod)."
    ],
    interviewQuestions: [
      { id: "cicd-q1", question: "What is the difference between Continuous Delivery and Continuous Deployment?", answer: "Continuous Delivery: Every code change that passes all tests is automatically prepared for production release, but a human manually approves the final deployment. Continuous Deployment: Every passing change is automatically deployed to production with no human intervention. Most companies start with Continuous Delivery and evolve to Continuous Deployment as confidence in their testing and monitoring grows.", difficulty: "Easy" },
      { id: "cicd-q2", question: "How do you implement zero-downtime deployments?", answer: "Several strategies: (1) Rolling deployment — gradually replace old instances with new ones. (2) Blue-green — deploy new version to a parallel environment, then switch traffic. (3) Canary — route 1% of traffic to the new version, monitor, gradually increase. (4) Feature flags — deploy new code behind a flag, enable it gradually. All strategies require health checks, readiness probes, and automated rollback if error rates increase.", difficulty: "Medium" },
      { id: "cicd-q3", question: "How do you handle database migrations in CI/CD?", answer: "Use a migration tool (Flyway, Alembic, Prisma Migrate) that tracks applied migrations. Migrations must be backward-compatible: (1) Add new columns as nullable first. (2) Deploy code that handles both old and new schema. (3) Migrate data. (4) Remove old column support. Never rename or delete columns in one step. Run migrations as a separate step before deployment. Use expand-and-contract pattern for breaking changes.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale CI/CD by using parallel test execution — split test suites across multiple runners. Use build caching (Docker layer cache, dependency cache) to speed up builds. Implement a mono-repo or multi-repo strategy based on team structure. Use self-hosted runners for cost efficiency at scale. Implement progressive delivery with feature flags for risky changes. Use GitOps (ArgoCD) for Kubernetes deployments — infrastructure state is defined in Git.",
    visualizerType: "ci-cd",
    lastUpdated: "2024-05-24"
  },

  // ═══════════════════════════════════════════════════════
  // PHASE 5: AI/ML
  // ═══════════════════════════════════════════════════════
  {
    id: "vector-databases",
    slug: "vector-databases",
    title: "Vector Databases",
    emoji: "🧬",
    category: "ai-ml",
    difficulty: "advanced",
    summary: "Store and search high-dimensional embeddings for semantic similarity — powering AI search, recommendations, and RAG applications.",
    definition: "Vector databases are specialized storage systems optimized for storing, indexing, and querying high-dimensional vectors (embeddings). Unlike traditional databases that match exact values, vector databases find the 'nearest neighbors' — items most similar in meaning. Text, images, and audio are converted to vectors (arrays of 768-1536 floats) using embedding models (OpenAI, Sentence Transformers). Indexing algorithms like HNSW (Hierarchical Navigable Small World), IVF (Inverted File Index), and PQ (Product Quantization) enable fast approximate nearest neighbor (ANN) search. Examples: Pinecone, Weaviate, Milvus, ChromaDB, pgvector.",
    realWorldExample: "Spotify uses vector embeddings to power their music recommendations. Every song is represented as a 128-dimensional vector capturing audio features, genre, mood, and listening patterns. When you listen to a song, Spotify searches the vector space for the nearest neighbors — songs that are mathematically 'close' in the embedding space. This is why Discover Weekly can recommend songs you've never heard but love.",
    realWorldCompany: "Spotify",
    advantages: [
      "Semantic search — find similar items by meaning, not just keywords.",
      "Fast ANN search — sub-millisecond queries even with billions of vectors.",
      "Multimodal — store text, image, and audio embeddings together.",
      "Foundation for RAG — enables AI apps to search knowledge bases.",
      "Real-time updates — add and search vectors without re-indexing.",
      "Hybrid search — combine vector similarity with traditional filters."
    ],
    disadvantages: [
      "Approximate results — ANN search may miss exact nearest neighbors.",
      "Memory intensive — vectors are large (768 floats × 4 bytes = 3KB each).",
      "Embedding model dependency — search quality depends on embedding quality.",
      "Index rebuild — changing embedding models requires re-embedding all data.",
      "Cost — managed vector DBs charge per vector stored and queried.",
      "New technology — less mature tooling and community than traditional DBs."
    ],
    useCases: [
      "RAG (Retrieval Augmented Generation) for LLM applications.",
      "Semantic search engines (find by meaning, not keywords).",
      "Recommendation systems (similar products, music, movies).",
      "Image similarity search and reverse image lookup.",
      "Anomaly detection in high-dimensional data.",
      "Duplicate detection (near-duplicate documents, images)."
    ],
    interviewQuestions: [
      { id: "vdb-q1", question: "How does HNSW indexing work for vector search?", answer: "HNSW (Hierarchical Navigable Small World) builds a multi-layer graph of vectors. The top layer has few, well-connected nodes for fast navigation. Lower layers have more nodes for precision. To search: start at the top layer, greedily navigate to the nearest node, descend to the next layer, and repeat. This achieves O(log N) search complexity. HNSW provides 95-99% recall (finding true nearest neighbors) with sub-millisecond latency, making it the most popular ANN index for production systems.", difficulty: "Hard" },
      { id: "vdb-q2", question: "What is the difference between exact and approximate nearest neighbor search?", answer: "Exact KNN computes the distance between the query vector and every vector in the database — O(N×D) complexity, impractical for millions of vectors. Approximate Nearest Neighbor (ANN) uses indexing structures (HNSW, IVF) to find vectors that are 'probably' the nearest neighbors — trading a small accuracy loss for orders-of-magnitude speed improvement. In practice, ANN achieves 95%+ recall while being 1000x faster than exact search.", difficulty: "Medium" }
    ],
    scalingExplanation: "Scale vector databases by sharding vectors across multiple nodes based on a partition key. Use replicas for read scaling. Implement tiered storage — hot vectors in memory, warm vectors on SSD, cold vectors in object storage. Use quantization (reducing vector precision from float32 to int8) to reduce memory usage by 4x with minimal accuracy loss. For billion-scale, use IVF-PQ (Inverted File with Product Quantization) indexes. Consider managed services (Pinecone, Weaviate Cloud) for operational simplicity.",
    visualizerType: "vector-db",
    lastUpdated: "2024-05-24"
  },
  {
    id: "rag-architecture",
    slug: "rag-architecture",
    title: "RAG Architecture",
    emoji: "🧠",
    category: "ai-ml",
    difficulty: "advanced",
    summary: "Give LLMs access to your private data — Retrieval Augmented Generation combines vector search with AI to answer questions using your documents as context.",
    definition: "RAG (Retrieval Augmented Generation) is an architecture pattern that enhances LLMs with external knowledge. Instead of fine-tuning a model on your data (expensive, static), RAG retrieves relevant documents at query time and includes them in the LLM's context. Pipeline: (1) Ingestion — split documents into chunks, generate embeddings, store in vector DB. (2) Retrieval — embed the user's query, search vector DB for similar chunks. (3) Generation — pass retrieved chunks + query to the LLM as context. (4) Response — LLM generates an answer grounded in the retrieved documents, with source citations.",
    realWorldExample: "Notion AI uses RAG architecture to answer questions about your workspace. When you ask 'What was the Q3 revenue target?', Notion embeds your query, searches your workspace pages stored in a vector database, retrieves the most relevant paragraphs, and sends them as context to an LLM. The AI generates an answer citing specific pages — combining the LLM's language ability with your private data.",
    realWorldCompany: "Notion",
    advantages: [
      "Access to private/current data — LLM can answer about your specific documents.",
      "No fine-tuning needed — cheaper and faster than training custom models.",
      "Always up-to-date — update documents and answers change immediately.",
      "Source citations — users can verify answers against original documents.",
      "Reduced hallucination — LLM is grounded in retrieved facts.",
      "Cost-effective — only store embeddings, not train models."
    ],
    disadvantages: [
      "Retrieval quality is critical — garbage in, garbage out.",
      "Chunking strategy impacts answer quality significantly.",
      "Context window limits — can only pass a few thousand tokens.",
      "Latency — embedding + vector search + LLM inference adds up.",
      "Embedding model lock-in — changing models requires re-embedding everything.",
      "Complex pipeline — many failure points (chunking, embedding, retrieval, generation)."
    ],
    useCases: [
      "Enterprise knowledge base Q&A (HR policies, product docs).",
      "Customer support chatbots with product-specific knowledge.",
      "Legal document analysis and case research.",
      "Medical literature search and clinical decision support.",
      "Code documentation search and developer assistants.",
      "Research paper analysis and literature review."
    ],
    interviewQuestions: [
      { id: "rag-q1", question: "How do you choose the right chunking strategy for RAG?", answer: "Chunking affects retrieval quality significantly. Strategies: (1) Fixed-size chunks (512 tokens) — simple but may split sentences/paragraphs. (2) Semantic chunking — split at paragraph/section boundaries. (3) Recursive chunking — try large chunks first, split further if needed. (4) Overlapping chunks — include 10-20% overlap to preserve context at boundaries. Best practice: chunk by semantic units (paragraphs, sections), keep chunks 200-500 tokens, add overlap, and include metadata (title, section, page number) for filtering.", difficulty: "Medium" },
      { id: "rag-q2", question: "How do you evaluate RAG pipeline quality?", answer: "Evaluate each stage independently: (1) Retrieval — measure recall@k (are the relevant chunks in the top-k results?), precision (are irrelevant chunks filtered?). (2) Generation — measure faithfulness (does the answer match the retrieved context?), relevance (does it answer the question?), and groundedness (no hallucinated facts). Use evaluation frameworks like RAGAS. Human evaluation for nuanced quality. A/B test different chunking strategies, embedding models, and retrieval parameters.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale RAG pipelines by: (1) Batch ingestion — process documents asynchronously via a queue. (2) Vector DB scaling — shard embeddings across nodes, use replicas for read scaling. (3) Cache frequent queries — cache LLM responses for repeated questions. (4) Streaming responses — stream LLM output token-by-token for perceived speed. (5) Hybrid retrieval — combine vector search with keyword search (BM25) for better recall. (6) Re-ranking — use a cross-encoder to re-rank the top-k results before sending to LLM.",
    visualizerType: "rag",
    lastUpdated: "2024-05-24"
  },
  {
    id: "ai-agents",
    slug: "ai-agents",
    title: "AI Agent Systems",
    emoji: "🤖",
    category: "ai-ml",
    difficulty: "advanced",
    summary: "Autonomous AI systems that plan, use tools, and collaborate to accomplish complex goals — from coding assistants to research agents.",
    definition: "AI Agents are autonomous systems built on LLMs that can reason, plan, use tools, and take actions to accomplish goals. Unlike simple chatbots that respond to single queries, agents maintain memory, break complex tasks into sub-tasks, select and use appropriate tools (APIs, code execution, web search), observe results, and iterate. The ReAct pattern (Reasoning + Acting) alternates between thinking and tool use. Multi-agent systems have multiple specialized agents collaborating — a planner, researcher, coder, and reviewer working together. Frameworks: LangChain, AutoGPT, CrewAI.",
    realWorldExample: "GitHub Copilot Workspace is an AI agent system that takes a GitHub issue, plans the implementation, searches the codebase, generates code changes across multiple files, and creates a pull request — all autonomously. It uses a planner agent to decompose the task, a researcher agent to understand the codebase, a coder agent to write the changes, and a reviewer agent to validate correctness.",
    realWorldCompany: "GitHub",
    advantages: [
      "Handle complex, multi-step tasks autonomously.",
      "Tool use — agents can call APIs, run code, and search the web.",
      "Memory — agents learn from conversation history and past results.",
      "Composable — combine specialized agents for complex workflows.",
      "Adaptable — agents adjust their approach based on intermediate results.",
      "Scalable expertise — one agent can serve thousands of users simultaneously."
    ],
    disadvantages: [
      "Unpredictable behavior — agents may take unexpected actions.",
      "Cost — multi-step reasoning requires many LLM calls.",
      "Hallucination risk — agents may act on incorrect reasoning.",
      "Safety concerns — autonomous tool use requires careful guardrails.",
      "Latency — multi-step agent loops take seconds to minutes.",
      "Debugging difficulty — agent reasoning chains are hard to trace."
    ],
    useCases: [
      "Coding assistants (GitHub Copilot, Cursor).",
      "Research agents that search, synthesize, and report.",
      "Customer support agents that resolve issues end-to-end.",
      "Data analysis agents that query databases and create reports.",
      "DevOps agents that diagnose and fix production issues.",
      "Content creation agents (write, edit, publish)."
    ],
    interviewQuestions: [
      { id: "aa-q1", question: "What is the ReAct pattern for AI agents?", answer: "ReAct (Reasoning + Acting) is an agent architecture where the LLM alternates between thinking and acting. Thought: The agent reasons about what to do next. Action: The agent calls a tool (search, code execution, API). Observation: The agent processes the tool's result. This loop repeats until the goal is achieved. Example: 'Thought: I need to find the current stock price. Action: search(AAPL stock price). Observation: $185.50. Thought: Now I can calculate the portfolio value.' ReAct produces more reliable results than pure reasoning.", difficulty: "Medium" },
      { id: "aa-q2", question: "How do you design guardrails for AI agents?", answer: "Multiple layers: (1) Input guardrails — validate and sanitize user inputs. (2) Tool restrictions — whitelist allowed tools and rate-limit API calls. (3) Output validation — check agent outputs before executing (e.g., review SQL before running). (4) Human-in-the-loop — require approval for high-risk actions (payments, deletions). (5) Sandboxing — execute code in isolated containers. (6) Budget limits — cap total LLM tokens and API calls per task. (7) Monitoring — log all agent actions for audit.", difficulty: "Hard" }
    ],
    scalingExplanation: "Scale AI agent systems by: (1) Caching — cache LLM responses for similar queries. (2) Parallel tool execution — run independent tool calls concurrently. (3) Streaming — stream agent reasoning to the user for perceived speed. (4) Model routing — use cheaper models (GPT-3.5) for simple steps, expensive models (GPT-4) for complex reasoning. (5) Async execution — queue long-running tasks and notify when complete. (6) Agent pools — maintain a pool of pre-initialized agents to avoid cold starts.",
    visualizerType: "ai-agent",
    lastUpdated: "2024-05-24"
  },

  // ═══════════════════════════════════════════════════════
  // PHASE 6: SYSTEM DESIGN CASE STUDIES
  // ═══════════════════════════════════════════════════════
  {
    id: "design-whatsapp",
    slug: "design-whatsapp",
    title: "Design WhatsApp",
    emoji: "💬",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a messaging system that handles 100B+ messages per day with real-time delivery, end-to-end encryption, media storage, and online presence.",
    definition: "WhatsApp is a real-time messaging platform serving 2B+ users. Key components: WebSocket gateways for persistent connections, message queues (Kafka) for reliable delivery, a fan-out service for group messages, object storage (S3) for media, a presence service tracking online/offline status, and end-to-end encryption using the Signal Protocol. Messages are stored temporarily on servers until delivered, then deleted. The read receipt system tracks message states (sent → delivered → read).",
    realWorldExample: "WhatsApp handles 100 billion messages per day with just 50 engineers. Their architecture uses Erlang/BEAM for the messaging server (each server handles 2M+ connections), Mnesia for session data, and a custom protocol over WebSockets. When user A sends a message to user B, it goes: A → WebSocket Gateway → Message Service → Kafka → Gateway holding B's connection → B.",
    realWorldCompany: "Meta (WhatsApp)",
    advantages: ["Real-time message delivery with sub-second latency.", "End-to-end encryption for privacy.", "Efficient media handling with CDN.", "Offline message queuing.", "Group messaging with fan-out.", "Cross-platform synchronization."],
    disadvantages: ["WebSocket connection management at billions scale.", "Media storage costs grow rapidly.", "E2E encryption prevents server-side content moderation.", "Group message fan-out is write-amplification heavy.", "Presence tracking for 2B users is resource-intensive.", "Message ordering across distributed servers is complex."],
    useCases: ["Personal messaging.", "Business communication (WhatsApp Business).", "Group coordination.", "Media sharing.", "Voice/video calling.", "Payment integration."],
    interviewQuestions: [
      { id: "wa-q1", question: "How would you design the message delivery system for WhatsApp?", answer: "1) Client sends message via WebSocket to a Gateway server. 2) Gateway publishes to a Message Queue (Kafka) for durability. 3) Message Service consumes from Kafka, stores in a per-user message queue. 4) If recipient is online, push via their WebSocket connection. 5) If offline, store until they reconnect. 6) On delivery, send 'delivered' receipt back. 7) For groups, fan-out service creates a copy for each member. Use message IDs for deduplication and ordering.", difficulty: "Hard" },
      { id: "wa-q2", question: "How does end-to-end encryption work in WhatsApp?", answer: "WhatsApp uses the Signal Protocol. Each user has a public/private key pair. When A messages B: A encrypts with B's public key, only B's private key can decrypt. The server never has access to message content — it only routes encrypted blobs. For groups, a shared group key is distributed to members, encrypted with each member's public key. Key exchange happens via a key server that stores public keys.", difficulty: "Medium" }
    ],
    scalingExplanation: "Scale by partitioning users across gateway servers using consistent hashing. Use Kafka for durable message queuing. Shard the message database by user ID. Deploy gateway servers in multiple regions with DNS-based routing. Use connection draining for graceful server updates. Each Erlang/BEAM server handles 2M+ concurrent WebSocket connections. Store media in S3 with CDN for delivery.",
    visualizerType: "design-whatsapp",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-instagram",
    slug: "design-instagram",
    title: "Design Instagram",
    emoji: "📸",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a photo-sharing platform with news feed generation, stories, reels, and a recommendation engine — serving 2B+ monthly active users.",
    definition: "Instagram's architecture centers around: media upload pipeline (resize, filter, store in S3), news feed generation (fan-out-on-write for small accounts, fan-out-on-read for celebrities), CDN for media delivery, a recommendation engine for Explore page, Stories/Reels serving infrastructure, and social graph management. The feed uses a ranked timeline based on engagement signals (likes, comments, shares, save, time spent). The Explore page uses collaborative filtering and content-based recommendations.",
    realWorldExample: "Instagram processes 100M+ photo uploads daily. When you post a photo, it goes through: upload to server → resize to multiple resolutions → apply filters → store in S3 → generate thumbnails → update your followers' feeds (fan-out) → index for search → process for recommendations. All of this happens within seconds of tapping 'Share'.",
    realWorldCompany: "Meta (Instagram)",
    advantages: ["Efficient media pipeline with CDN.", "Ranked feeds boost engagement.", "Fan-out strategy handles celebrity accounts.", "Stories/Reels for ephemeral content.", "Powerful recommendation engine.", "Search and discovery features."],
    disadvantages: ["Fan-out cost for users with millions of followers.", "Media storage is expensive at scale.", "Feed ranking is computationally intensive.", "Real-time story delivery to millions.", "Content moderation at scale.", "Data privacy and regulation compliance."],
    useCases: ["Photo and video sharing.", "Social networking.", "Business marketing.", "E-commerce (Instagram Shopping).", "Content creation.", "Advertising platform."],
    interviewQuestions: [
      { id: "ig-q1", question: "How would you design the news feed for Instagram?", answer: "Hybrid approach: Fan-out-on-write for regular users (< 10K followers) — when a user posts, write to all followers' feed caches. Fan-out-on-read for celebrities (> 10K followers) — fetch celebrity posts at read time to avoid writing to millions of feeds. Feed ranking: score each post by relevance (engagement probability, recency, relationship strength) using an ML model. Cache the computed feed in Redis. Paginate with cursor-based pagination.", difficulty: "Hard" },
      { id: "ig-q2", question: "How does Instagram handle media uploads at scale?", answer: "1) Client uploads to a pre-signed S3 URL (direct upload, bypassing app server). 2) S3 triggers a Lambda/worker that resizes to 6 resolutions. 3) Thumbnails are generated and cached. 4) Media metadata is stored in the database. 5) CDN URLs are generated. 6) Fan-out service notifies followers. Media is served via CDN (CloudFront) — 95% of requests never hit origin. Use progressive JPEG for faster loading.", difficulty: "Medium" }
    ],
    scalingExplanation: "Shard the user database by user ID. Use a dedicated media service backed by S3 with CloudFront CDN. Cache feeds in Redis clusters. Use Kafka for async fan-out to avoid blocking the upload path. Deploy ML ranking models on GPU clusters for feed scoring. Use Cassandra for the social graph (followers/following) due to its high write throughput. Implement rate limiting on uploads to prevent abuse.",
    visualizerType: "design-instagram",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-youtube",
    slug: "design-youtube",
    title: "Design YouTube",
    emoji: "▶️",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a video streaming platform that transcodes, stores, and delivers 500+ hours of video uploaded every minute to 2B+ monthly users worldwide.",
    definition: "YouTube's architecture handles: video upload and transcoding (converting to multiple resolutions and codecs), adaptive bitrate streaming (HLS/DASH), global CDN for delivery, recommendation engine, comment system, live streaming, and content moderation. The transcoding pipeline converts each video into 10+ variants (144p to 4K, H.264/VP9/AV1). Adaptive bitrate streaming lets the player switch quality based on bandwidth. The recommendation system drives 70% of watch time.",
    realWorldExample: "YouTube stores over 800 million videos totaling 1 billion hours of content. When a creator uploads a 4K video, YouTube's transcoding pipeline (running on thousands of servers) converts it into 20+ variants within minutes. The video is then distributed to 100+ CDN edge locations worldwide. When a viewer in Tokyo watches, the video streams from the nearest edge server at the optimal bitrate for their connection.",
    realWorldCompany: "Google (YouTube)",
    advantages: ["Adaptive bitrate streaming for all connection speeds.", "Global CDN reduces buffering.", "Powerful recommendation engine.", "Live streaming support.", "Monetization platform for creators.", "Content moderation at scale."],
    disadvantages: ["Massive storage costs (petabytes daily).", "Transcoding is computationally expensive.", "CDN bandwidth costs at scale.", "Content moderation challenges.", "Copyright detection (Content ID) complexity.", "Live streaming latency challenges."],
    useCases: ["Video hosting and streaming.", "Live event broadcasting.", "Education (Khan Academy, Coursera).", "Music streaming (YouTube Music).", "Advertising platform.", "Content creator economy."],
    interviewQuestions: [
      { id: "yt-q1", question: "How does video transcoding work at YouTube scale?", answer: "1) Video is uploaded to a staging area. 2) A transcoding job is queued. 3) The video is split into segments (2-10 seconds each). 4) Segments are transcoded in parallel across a cluster: each segment is encoded in multiple resolutions (144p-4K) and codecs (H.264, VP9, AV1). 5) Audio is transcoded separately (AAC, Opus). 6) Manifests (HLS .m3u8 / DASH .mpd) are generated listing all variants. 7) Transcoded segments are stored in object storage and pushed to CDN.", difficulty: "Hard" },
      { id: "yt-q2", question: "How does adaptive bitrate streaming work?", answer: "The player downloads a manifest file listing all available quality levels. It starts with a low quality to minimize startup time. As it monitors download speed (bandwidth estimation), it switches to higher quality. If bandwidth drops (mobile switching to 3G), it seamlessly drops to lower quality. This prevents buffering while maximizing quality. Key algorithms: buffer-based (switch based on buffer level) and throughput-based (switch based on measured bandwidth).", difficulty: "Medium" }
    ],
    scalingExplanation: "Store videos in object storage (GCS/S3) with CDN for delivery. Shard the video metadata database by video ID. Use a distributed task queue for transcoding with auto-scaling workers. Implement tiered CDN caching — popular videos cached at edge, long-tail served from regional caches. Use predictive caching to pre-warm popular content. Separate read and write paths — uploads go to origin, views served from CDN.",
    visualizerType: "design-youtube",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-uber",
    slug: "design-uber",
    title: "Design Uber/Ola",
    emoji: "🚗",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a ride-sharing platform with real-time GPS tracking, driver matching, dynamic pricing, and ETA calculation — handling millions of concurrent rides.",
    definition: "Uber's architecture handles: real-time GPS streaming from millions of drivers, geospatial indexing for finding nearby drivers (using H3/S2 geo cells), driver-rider matching (optimization algorithm considering distance, ETA, driver rating), dynamic pricing (surge), ETA calculation using historical traffic data and ML models, payment processing, and trip tracking. The system must handle millions of location updates per second with sub-second latency.",
    realWorldExample: "Uber processes 1 million location updates per second from active drivers. When a rider requests a ride, the system: queries the geospatial index for nearby drivers (< 100ms), runs the matching algorithm (< 200ms), calculates ETA using ML (< 100ms), computes surge pricing, and sends the request to the best driver — all within 2 seconds. Uber uses Apache Kafka for location streaming, H3 geo cells for spatial indexing, and Apache Flink for real-time analytics.",
    realWorldCompany: "Uber",
    advantages: ["Real-time matching with sub-second latency.", "Dynamic pricing balances supply and demand.", "Geospatial indexing for efficient nearby searches.", "ML-powered ETA is more accurate than simple routing.", "Scalable event-driven architecture.", "Multi-modal support (cars, bikes, delivery)."],
    disadvantages: ["GPS accuracy issues in urban canyons.", "Surge pricing is controversial.", "Driver matching optimization is NP-hard at scale.", "Real-time streaming infrastructure is complex.", "Fraud detection for fake rides/locations.", "Regulatory compliance varies by region."],
    useCases: ["Ride-hailing.", "Food delivery (Uber Eats).", "Package delivery.", "Fleet management.", "Public transit integration.", "Autonomous vehicle routing."],
    interviewQuestions: [
      { id: "ub-q1", question: "How would you design the driver matching system?", answer: "1) Rider requests a ride with pickup/dropoff. 2) Query geospatial index (H3 cells) for drivers within radius. 3) Filter by vehicle type, rating, and availability. 4) For each candidate, calculate ETA using routing engine. 5) Score candidates: minimize rider wait time, driver detour, and maximize driver utilization. 6) Send request to top candidate with timeout. 7) If declined/timeout, try next candidate. 8) Use batched matching during high demand — match multiple riders to multiple drivers simultaneously for global optimization.", difficulty: "Hard" },
      { id: "ub-q2", question: "How does surge pricing work?", answer: "Divide the city into hexagonal geo cells (H3). For each cell, calculate supply (available drivers) and demand (ride requests) in real-time. When demand/supply ratio exceeds a threshold, apply a multiplier (1.5x, 2x, etc.). The multiplier is displayed to riders before confirming. Surge incentivizes more drivers to the area and discourages non-urgent rides, balancing supply and demand. Use ML to predict demand surges (events, weather, rush hour) and pre-position drivers.", difficulty: "Medium" }
    ],
    scalingExplanation: "Partition geospatial data by H3 geo cells. Use Kafka for streaming driver locations. Cache driver positions in Redis with TTL for real-time queries. Use separate databases for trip history (PostgreSQL) and real-time state (Redis). Deploy city-level microservices for regional independence. Use Apache Flink for real-time surge pricing calculations. Scale matching servers horizontally per city.",
    visualizerType: "design-uber",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-netflix",
    slug: "design-netflix",
    title: "Design Netflix",
    emoji: "🎬",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a video streaming service with personalized recommendations, global CDN, and content delivery for 260M+ subscribers worldwide.",
    definition: "Netflix's architecture includes: Open Connect (custom CDN with servers in ISP networks), a microservices backend (1000+ services on AWS), a recommendation engine (drives 80% of content watched), a transcoding pipeline (encode each title in 1200+ variants), adaptive streaming, and A/B testing infrastructure. Netflix pioneered chaos engineering (Chaos Monkey) to build resilient distributed systems. Content is pre-positioned on Open Connect appliances in ISP data centers for minimal latency.",
    realWorldExample: "Netflix encodes each movie/show into 1,200+ different files — combinations of resolution, bitrate, codec, and audio format — optimized for every device and connection speed. Their custom CDN, Open Connect, places servers inside ISP networks so video bytes travel the shortest possible path. During peak hours, Netflix accounts for 15% of all internet bandwidth globally.",
    realWorldCompany: "Netflix",
    advantages: ["Custom CDN reduces ISP load.", "1200+ encoding variants per title.", "ML recommendation drives engagement.", "Chaos engineering ensures resilience.", "A/B testing everything.", "Global scale with regional deployment."],
    disadvantages: ["Massive encoding costs per title.", "CDN infrastructure investment.", "Cold start problem for new users.", "Content licensing complexity.", "Bandwidth costs at peak hours.", "Recommendation filter bubbles."],
    useCases: ["Video on demand streaming.", "Original content production.", "Live events streaming.", "Interactive content (Bandersnatch).", "Mobile-first markets.", "Advertising-supported tier."],
    interviewQuestions: [
      { id: "nf-q1", question: "How does Netflix's recommendation system work?", answer: "Netflix uses a hybrid approach: (1) Collaborative filtering — users who watched X also watched Y. (2) Content-based — analyze genres, actors, directors of watched content. (3) Deep learning — neural networks trained on viewing history, time of day, device, and engagement signals. The system generates 'rows' for the homepage, each with a different algorithm (Because you watched X, Trending Now, Top Picks). Each row is personalized per user. Even the artwork is personalized — different users see different thumbnails for the same show.", difficulty: "Hard" },
      { id: "nf-q2", question: "What is Netflix's Open Connect CDN?", answer: "Open Connect is Netflix's custom CDN. Instead of using third-party CDNs, Netflix places Open Connect Appliances (OCAs) — servers packed with SSDs — directly inside ISP data centers. During off-peak hours, OCAs pull popular content from Netflix's AWS origin. During viewing, 95% of traffic is served from the local OCA, never leaving the ISP network. This reduces latency to single-digit milliseconds and saves ISPs massive bandwidth costs.", difficulty: "Medium" }
    ],
    scalingExplanation: "Netflix uses AWS for the control plane (user accounts, recommendations, API) and Open Connect for the data plane (video delivery). Microservices communicate via gRPC with Envoy service mesh. Use Cassandra for viewing history, EVCache (memcached) for caching, and Kafka for event streaming. Each microservice scales independently. Implement circuit breakers (Hystrix) and chaos engineering to test resilience continuously.",
    visualizerType: "design-netflix",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-discord",
    slug: "design-discord",
    title: "Design Discord",
    emoji: "🎮",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a real-time communication platform with text channels, voice chat, and screen sharing — supporting millions of concurrent users in thousands of servers.",
    definition: "Discord's architecture handles: real-time messaging via WebSockets, voice communication via WebRTC with Selective Forwarding Units (SFUs), server (guild) management with channels and roles, presence tracking (online/idle/DND), and rich media sharing. Messages are stored in Cassandra (scaled to trillions of messages). The gateway service manages WebSocket connections, and a pub/sub system (using Elixir processes) fans out messages to channel members across multiple gateway servers.",
    realWorldExample: "Discord handles 4+ million concurrent voice users and 150 million monthly active users. Their infrastructure uses Elixir for the gateway (handling 1M+ connections per server), Rust for performance-critical services, Cassandra for message storage, and ScyllaDB for the most latency-sensitive data. When a message is sent in a channel, it's written to Cassandra and simultaneously pushed to all online members via their WebSocket connections.",
    realWorldCompany: "Discord",
    advantages: ["Sub-50ms message delivery.", "Voice chat with low latency.", "Server/channel organization.", "Rich permissions system.", "Bot ecosystem.", "Cross-platform support."],
    disadvantages: ["WebSocket connection management at scale.", "Voice server infrastructure costs.", "Message storage for high-volume servers.", "Presence tracking for millions of users.", "Moderation challenges.", "Real-time search across trillions of messages."],
    useCases: ["Gaming communities.", "Developer communities.", "Education.", "Business communication.", "Content creator communities.", "Customer support."],
    interviewQuestions: [
      { id: "dc-q1", question: "How does Discord deliver messages in real-time?", answer: "1) User sends message via WebSocket to Gateway server. 2) Gateway validates permissions, writes to Cassandra. 3) Gateway publishes event to the channel's pub/sub topic. 4) All Gateway servers with connected channel members receive the event. 5) Each Gateway pushes the message to connected clients via WebSocket. For large channels (100K+ members), use lazy delivery — only push to members who have the channel in view. Discord uses Elixir's lightweight processes (one per WebSocket) for efficient connection handling.", difficulty: "Hard" }
    ],
    scalingExplanation: "Partition guilds (servers) across gateway nodes using consistent hashing. Use Elixir/BEAM for WebSocket gateways (lightweight processes, fault tolerance). Store messages in Cassandra partitioned by channel_id. Use ScyllaDB for hot data (presence, typing indicators). Voice uses SFU (Selective Forwarding Unit) topology — one server receives all streams and forwards them, avoiding mesh complexity. Scale voice servers per-region.",
    visualizerType: "design-discord",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-google-docs",
    slug: "design-google-docs",
    title: "Design Google Docs",
    emoji: "📝",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a collaborative document editor where multiple users edit simultaneously with real-time cursor tracking, conflict resolution, and version history.",
    definition: "Google Docs uses real-time collaboration powered by Operational Transformation (OT) or CRDTs (Conflict-free Replicated Data Types). When two users type simultaneously, their operations are transformed to maintain consistency. Each keystroke is an operation (insert 'a' at position 5) sent to the server, which transforms and broadcasts it to all clients. CRDTs (used by Figma and Notion) achieve eventual consistency without a central server by encoding ordering into the data structure itself.",
    realWorldExample: "Google Docs supports 100+ simultaneous editors on a single document. When User A types at position 10 and User B types at position 5 simultaneously, Operational Transformation adjusts A's operation to account for B's insertion — A's position becomes 11. This happens transparently, maintaining a consistent document state across all clients within 100ms.",
    realWorldCompany: "Google",
    advantages: ["Real-time multi-user collaboration.", "Automatic conflict resolution.", "Full version history.", "Offline editing with sync.", "Cross-platform access.", "Rich formatting support."],
    disadvantages: ["OT algorithm complexity.", "Server must process all operations in order.", "Cursor tracking overhead.", "Large document performance.", "Merge conflicts for offline edits.", "Real-time requires persistent connections."],
    useCases: ["Team document collaboration.", "Meeting notes.", "Technical documentation.", "Education.", "Legal document drafting.", "Content creation workflows."],
    interviewQuestions: [
      { id: "gd-q1", question: "What is Operational Transformation and how does it work?", answer: "OT transforms concurrent operations to maintain document consistency. If User A inserts 'X' at position 3 and User B inserts 'Y' at position 1 (concurrently), A's operation must be transformed: since B inserted before position 3, A's position becomes 4. The server maintains a canonical operation log and transforms each incoming operation against all concurrent operations. Key properties: convergence (all clients reach the same state) and intention preservation (each edit achieves what the user intended).", difficulty: "Hard" },
      { id: "gd-q2", question: "What are CRDTs and how do they compare to OT?", answer: "CRDTs (Conflict-free Replicated Data Types) achieve eventual consistency without a central server. Each character has a unique, globally-ordered ID. Insertions and deletions are commutative — they can be applied in any order and reach the same state. CRDTs are more complex to implement but work peer-to-peer (no central server needed). OT requires a central server but is simpler for simple operations. CRDTs are used by Figma, Notion, and Apple's collaboration features.", difficulty: "Hard" }
    ],
    scalingExplanation: "Use WebSocket connections for real-time updates. Partition documents across servers — each document has a 'home server' that processes its operations. Use OT/CRDT for conflict resolution. Store document snapshots periodically in a database, with operation logs for version history. Use Redis pub/sub for multi-server document sessions. Implement cursor presence via lightweight WebSocket messages. Cache recent document versions in memory.",
    visualizerType: "design-google-docs",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-zoom",
    slug: "design-zoom",
    title: "Design Zoom",
    emoji: "📹",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a video conferencing platform supporting millions of concurrent meetings with low-latency video/audio, screen sharing, and recording.",
    definition: "Zoom's architecture uses WebRTC for media capture, SFU (Selective Forwarding Unit) servers for routing streams (each participant sends one stream to the SFU, which forwards it to all others), SRTP for encrypted media transport, and a signaling server for session management. The SFU topology is more efficient than mesh (where each participant sends to every other participant) or MCU (which mixes streams on the server). Simulcast sends multiple quality layers so the SFU can forward the appropriate quality to each receiver based on their bandwidth.",
    realWorldExample: "Zoom handles 300 million daily meeting participants across global data centers. Their custom SFU servers route video streams without decoding them (saving CPU). When a meeting has 25 participants, each sends one video stream to the SFU. The SFU forwards all 24 other streams to each participant. With simulcast, each sender transmits in 3 quality tiers (high/medium/low), and the SFU selects the appropriate tier per receiver.",
    realWorldCompany: "Zoom",
    advantages: ["SFU is efficient for large meetings.", "Simulcast adapts to each participant's bandwidth.", "End-to-end encryption option.", "Low latency with regional media servers.", "Breakout rooms and waiting rooms.", "Recording and transcription."],
    disadvantages: ["Bandwidth scales linearly with participants (SFU).", "Network quality directly impacts experience.", "SFU servers are CPU and bandwidth intensive.", "Firewall traversal challenges (TURN servers needed).", "Recording storage costs.", "Echo cancellation and noise suppression complexity."],
    useCases: ["Business meetings.", "Webinars and events.", "Online education.", "Telehealth.", "Social gatherings.", "Hybrid work."],
    interviewQuestions: [
      { id: "zm-q1", question: "What is the difference between SFU, MCU, and mesh topology?", answer: "Mesh: Every participant sends their stream to every other participant. Works for 2-3 people but doesn't scale (N² connections). MCU (Multipoint Control Unit): Receives all streams, mixes them into one composite stream, sends to each participant. Low client bandwidth but high server CPU (must decode/encode). SFU (Selective Forwarding Unit): Receives one stream from each participant and forwards it to all others without processing. Balanced — moderate bandwidth, low CPU. Zoom uses SFU with simulcast.", difficulty: "Medium" }
    ],
    scalingExplanation: "Deploy SFU servers in multiple regions. Route participants to the nearest SFU. For meetings spanning regions, use SFU cascading — connect SFUs in different regions with a single high-quality link instead of each participant connecting cross-region. Use TURN servers for participants behind strict firewalls. Implement bandwidth estimation and simulcast for adaptive quality. Offload recording to dedicated media servers.",
    visualizerType: "design-zoom",
    lastUpdated: "2024-05-24"
  },
  {
    id: "design-twitter",
    slug: "design-twitter",
    title: "Design Twitter/X",
    emoji: "🐦",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a social media platform with timeline generation, trending topics, real-time search, and a notification system — handling 500M+ tweets per day.",
    definition: "Twitter's architecture centers on: timeline generation using fan-out (pre-computing home timelines), a tweet storage system (Manhattan — Twitter's custom distributed KV store), a search index (Earlybird — a real-time inverted index), trending topics (computed from tweet velocity), and a notification system. The fan-out service is the most critical component — when a user tweets, the tweet is written to all followers' home timeline caches. For users with millions of followers (celebrities), fan-out is deferred to read time to avoid massive write amplification.",
    realWorldExample: "When a regular Twitter user (< 10K followers) tweets, the fan-out service writes the tweet to each follower's Redis-cached home timeline — 10K writes per tweet. When Elon Musk (150M followers) tweets, fan-out-on-write would require 150M writes per tweet. Instead, celebrity tweets are fetched at read time and merged with the pre-computed timeline. Twitter processes 500M+ tweets per day with this hybrid approach.",
    realWorldCompany: "X (Twitter)",
    advantages: ["Pre-computed timelines for fast reads.", "Hybrid fan-out handles celebrity accounts.", "Real-time search with inverted index.", "Trending detection via velocity.", "Notification fan-out.", "Lists and bookmarks features."],
    disadvantages: ["Fan-out write amplification.", "Storage for billions of tweets.", "Celebrity tweets add read-time complexity.", "Real-time search indexing latency.", "Bot and spam detection.", "Content moderation at scale."],
    useCases: ["Public social networking.", "News and journalism.", "Customer service.", "Real-time event commentary.", "Political discourse.", "Marketing and advertising."],
    interviewQuestions: [
      { id: "tw-q1", question: "How would you design the home timeline for Twitter?", answer: "Hybrid fan-out: For regular users (< 10K followers), fan-out-on-write — when they tweet, push to all followers' Redis timeline caches. For celebrities (> 10K followers), fan-out-on-read — their tweets are fetched at read time and merged. Timeline service: 1) Fetch pre-computed timeline from Redis. 2) Fetch celebrity tweets. 3) Merge and rank by relevance (engagement prediction, recency, relationship). 4) Apply filters (muted words, blocked users). 5) Return paginated results.", difficulty: "Hard" },
      { id: "tw-q2", question: "How does trending topics detection work?", answer: "For each hashtag/topic, track tweet count in sliding windows (1 min, 5 min, 1 hour). Calculate velocity — the rate of increase in mentions. A topic is trending if its velocity exceeds a threshold relative to its baseline (not just absolute count — 'good morning' is always popular but never trending). Filter out spam and bot activity. Localize trends by region. Use Apache Storm or Flink for real-time stream processing of tweet events.", difficulty: "Medium" }
    ],
    scalingExplanation: "Shard tweet storage by tweet ID (Snowflake IDs for globally unique, time-sorted IDs). Cache home timelines in Redis (top 800 tweets per user). Use Kafka for the tweet event stream that powers fan-out, search indexing, and trending. Shard the social graph by user ID. Deploy search indexes per datacenter with real-time replication. Use Manhattan (or Cassandra) for high-throughput tweet storage.",
    visualizerType: "design-twitter",
    lastUpdated: "2024-05-24"
  }
];
