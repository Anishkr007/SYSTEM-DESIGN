import { Topic } from "@/types";

export const topicsV2: Topic[] = [
  {
    id: "url-shortener",
    slug: "url-shortener",
    title: "Design a URL Shortener",
    emoji: "🔗",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a scalable service like Bit.ly that takes long URLs and generates short, unique aliases.",
    definition: "A URL shortener is a service that creates a short alias for a long URL. When users click the short alias, they are redirected to the original URL. This system requires high availability, low latency redirects, and an immense storage capacity for generating and resolving billions of links.",
    realWorldExample: "Bit.ly is the most famous URL shortener, processing billions of redirects daily while providing real-time analytics on click data.",
    realWorldCompany: "Bitly",
    advantages: [
      "Saves space when sharing links (e.g., SMS, Twitter).",
      "Hides original URL structure and parameters.",
      "Allows tracking of click analytics and geographic data.",
      "Can provide custom branded links.",
      "Reduces typos when users manually copy links."
    ],
    disadvantages: [
      "Adds an extra DNS resolution and network hop, increasing latency.",
      "If the service goes down, all shortened links break (SPOF).",
      "Can be abused by spammers to hide malicious URLs.",
      "Requires massive storage and caching infrastructure.",
      "Analytics processing requires heavy asynchronous pipelines."
    ],
    useCases: [
      "Social media link sharing.",
      "SMS marketing campaigns.",
      "Affiliate link masking.",
      "Click tracking and analytics."
    ],
    interviewQuestions: [
      {
        id: "url-q1",
        question: "Why use Base62 encoding instead of MD5 directly?",
        answer: "MD5 produces 128-bit hex output (32 chars). Base62 encoding of the first 7 characters produces URLs safe for browsers without special characters. 7 chars of Base62 = 62^7 = 3.5 trillion unique URLs.",
        difficulty: "Medium"
      },
      {
        id: "url-q2",
        question: "SQL vs NoSQL for URL shortener?",
        answer: "NoSQL (Cassandra/DynamoDB) preferred. High write QPS, simple key-value lookups, horizontal scaling. SQL adds unnecessary complexity for this access pattern.",
        difficulty: "Easy"
      },
      {
        id: "url-q3",
        question: "Why use 302 (temporary) redirect instead of 301 (permanent)?",
        answer: "302 forces browser to always hit our server, allowing analytics tracking. 301 is cached by browser — we lose click analytics.",
        difficulty: "Medium"
      },
      {
        id: "url-q4",
        question: "How to handle hash collisions?",
        answer: "Append user ID to URL before hashing. If collision detected, append predefined string '+1' and rehash. Use Bloom filter to check existence before DB.",
        difficulty: "Hard"
      },
      {
        id: "url-q5",
        question: "How to scale to 1B URLs/day?",
        answer: "Distributed ID generator (Snowflake), consistent hashing across DB shards, Redis cluster for caching, CDN for redirect responses, async analytics pipeline.",
        difficulty: "Hard"
      }
    ],
    scalingExplanation: "To scale to 100x load, you must decouple ID generation from the web tier using a distributed service like Twitter Snowflake or Zookeeper ranges. Implement a massive Redis cluster with LRU eviction for the 20% of URLs generating 80% of the traffic. Move analytics to an asynchronous Kafka queue to prevent blocking the redirect response.",
    visualizerType: "url-shortener",
    lastUpdated: "2024-05-20"
  },
  {
    id: "notification-system",
    slug: "notification-system",
    title: "Notification System",
    emoji: "🔔",
    category: "case-studies",
    difficulty: "advanced",
    summary: "Design a highly available distributed system that sends Push, SMS, and Email notifications at massive scale.",
    definition: "A notification system acts as a centralized hub for sending alerts to users across various channels (iOS, Android, SMS, Email). It must handle rate limiting, user preferences, deduplication, and reliable delivery using third-party providers.",
    realWorldExample: "LinkedIn uses a massive notification system to alert millions of users about profile views, messages, and job alerts with strict deduplication and batching logic.",
    realWorldCompany: "LinkedIn",
    advantages: [
      "Centralized logic for user preferences and opt-outs.",
      "Decouples microservices from third-party vendor APIs.",
      "Built-in retry mechanisms and dead-letter queues.",
      "Enables rate limiting to prevent spamming users.",
      "Cross-channel deduplication."
    ],
    disadvantages: [
      "Complex retry logic and state management.",
      "High dependency on third-party provider reliability (Twilio, SendGrid, APNs).",
      "Data privacy concerns when logging notification payloads.",
      "Can suffer from massive queue backlogs during viral events.",
      "Requires careful handling of idempotent operations."
    ],
    useCases: [
      "Transactional alerts (OTP, password resets).",
      "Marketing campaigns.",
      "Social media engagement loops.",
      "System health alerts."
    ],
    interviewQuestions: [
      {
        id: "notif-q1",
        question: "How do you prevent a single point of failure (SPOF)?",
        answer: "Deploy worker nodes across multiple Availability Zones. Use a distributed message broker like Kafka to persist events so no messages are lost if a worker crashes.",
        difficulty: "Medium"
      },
      {
        id: "notif-q2",
        question: "How do you handle third-party API rate limits?",
        answer: "Implement a token bucket rate limiter in the worker pool. If the API returns 429 Too Many Requests, put the message back into a delayed retry queue with exponential backoff.",
        difficulty: "Medium"
      },
      {
        id: "notif-q3",
        question: "What is a Dead Letter Queue (DLQ)?",
        answer: "A DLQ is a secondary queue where messages are sent after they fail delivery a maximum number of times. This prevents poison pills from infinitely blocking the main queue and allows engineers to manually inspect failures.",
        difficulty: "Easy"
      },
      {
        id: "notif-q4",
        question: "How do you ensure idempotency?",
        answer: "Generate a unique `eventId` at the source. The notification service checks a Redis cache or DB for this ID before sending to prevent duplicate dispatches if the source retries.",
        difficulty: "Hard"
      },
      {
        id: "notif-q5",
        question: "How do you handle a sudden spike of 10M marketing emails?",
        answer: "Separate transactional and marketing queues. Give transactional queues higher priority. Use a scalable worker pool that auto-scales based on queue depth to process the marketing backlog.",
        difficulty: "Hard"
      }
    ],
    scalingExplanation: "At peak loads, separate your Kafka topics by channel (Push vs Email vs SMS) and priority (Transactional vs Promotional). Implement dynamic auto-scaling for your worker pools based on consumer lag. Use Redis to cache user contact info and opt-out preferences to avoid crushing your database during a massive broadcast.",
    visualizerType: "notification-system",
    lastUpdated: "2024-05-20"
  },
  {
    id: "kafka",
    slug: "kafka",
    title: "Kafka & Message Queues",
    emoji: "📨",
    category: "messaging-queue",
    difficulty: "advanced",
    summary: "Deep dive into distributed pub/sub messaging, partitions, consumer groups, and exactly-once semantics.",
    definition: "Apache Kafka is a distributed event streaming platform capable of handling trillions of events a day. Unlike traditional message queues, Kafka uses an append-only log architecture, allowing multiple consumer groups to read the same data at their own pace.",
    realWorldExample: "Uber uses Kafka to stream real-time location data from drivers to match them with riders, calculate ETAs, and process payments asynchronously.",
    realWorldCompany: "Uber",
    advantages: [
      "Massive throughput via partition-level parallelism.",
      "Durability through replication and disk persistence.",
      "Allows replayability (events are not deleted on consumption).",
      "Decouples microservices completely.",
      "Supports exactly-once processing semantics."
    ],
    disadvantages: [
      "Complex to operate and tune (Zookeeper/KRaft, JVM GC).",
      "Not designed for complex routing (use RabbitMQ instead).",
      "Head-of-line blocking if a single partition gets stuck.",
      "High storage costs if retention policies are long.",
      "Rebalancing consumer groups can cause temporary pauses."
    ],
    useCases: [
      "Activity tracking and clickstream data.",
      "Log aggregation.",
      "Stream processing (fraud detection).",
      "Event sourcing architectures."
    ],
    interviewQuestions: [
      {
        id: "kafka-q1",
        question: "How does Kafka achieve high throughput?",
        answer: "Sequential disk I/O, zero-copy network transfers (sendfile system call), message batching, and horizontal scaling via partitions.",
        difficulty: "Medium"
      },
      {
        id: "kafka-q2",
        question: "What is a Consumer Group?",
        answer: "A logical grouping of consumers that cooperate to consume a topic. Each partition in the topic is assigned to exactly one consumer in the group, ensuring parallel processing without duplicate processing.",
        difficulty: "Easy"
      },
      {
        id: "kafka-q3",
        question: "How do you guarantee message ordering?",
        answer: "Kafka only guarantees ordering within a single partition. You must use a consistent routing key (like `userId`) when producing messages so all events for that user land in the same partition.",
        difficulty: "Medium"
      },
      {
        id: "kafka-q4",
        question: "RabbitMQ vs Kafka?",
        answer: "RabbitMQ is a smart broker / dumb consumer model, good for complex routing and task queues. Kafka is a dumb broker / smart consumer model, optimized for massive throughput and event streaming.",
        difficulty: "Medium"
      },
      {
        id: "kafka-q5",
        question: "What happens during a Consumer Rebalance?",
        answer: "When a consumer joins or leaves a group, Kafka revokes all partition assignments and reassigns them among the active consumers. This stops consumption temporarily (stop-the-world) unless using incremental cooperative rebalancing.",
        difficulty: "Hard"
      }
    ],
    scalingExplanation: "To scale Kafka, increase the number of partitions for a topic, which allows you to add more consumers to your consumer group. Ensure your partition keys are evenly distributed to avoid hot partitions. Tune `linger.ms` and `batch.size` on the producer to optimize network round trips.",
    visualizerType: "kafka",
    lastUpdated: "2024-05-20"
  },
  {
    id: "caching",
    slug: "caching",
    title: "Caching Systems",
    emoji: "⚡",
    category: "caching",
    difficulty: "advanced",
    summary: "Explore Cache-Aside, Write-Through, LRU algorithms, and Redis architectures.",
    definition: "Caching is the technique of storing copies of frequently accessed data in a temporary, high-speed storage layer (usually RAM). This significantly reduces database load and improves application latency.",
    realWorldExample: "Twitter uses massive Redis clusters to cache user timelines. Generating a timeline via SQL joins on every request would crash their databases, so timelines are pre-computed and cached.",
    realWorldCompany: "Twitter",
    advantages: [
      "Drastically reduces read latency (sub-millisecond).",
      "Reduces load on the primary database.",
      "Handles sudden traffic spikes (thundering herd protection).",
      "Cheaper to scale reads via cache than via DB replicas.",
      "Can store complex pre-computed data structures (Redis sets, lists)."
    ],
    disadvantages: [
      "Introduces cache invalidation complexity (stale data).",
      "Adds another infrastructure component to maintain.",
      "Data loss if cache goes down (unless persisted).",
      "Memory is expensive compared to SSD storage.",
      "Cache stampede risks on cold starts."
    ],
    useCases: [
      "Database query caching.",
      "Session storage.",
      "Rate limiting counters.",
      "Leaderboards (Redis Sorted Sets)."
    ],
    interviewQuestions: [
      {
        id: "cache-q1",
        question: "What is a Cache Stampede (Thundering Herd)?",
        answer: "When a highly popular cached item expires, thousands of concurrent requests miss the cache and hit the database simultaneously, crushing it. Prevented using locking (mutex) so only one thread fetches from DB.",
        difficulty: "Hard"
      },
      {
        id: "cache-q2",
        question: "Cache-aside vs Write-through?",
        answer: "Cache-aside: App checks cache, if miss, fetches DB and writes to cache. Write-through: App writes to cache and DB simultaneously. Cache-aside is best for read-heavy workloads.",
        difficulty: "Medium"
      },
      {
        id: "cache-q3",
        question: "Explain LRU eviction.",
        answer: "Least Recently Used. When cache is full, the item that hasn't been accessed for the longest time is deleted. Typically implemented using a Hash Map and a Doubly Linked List.",
        difficulty: "Medium"
      },
      {
        id: "cache-q4",
        question: "Redis vs Memcached?",
        answer: "Memcached is a simple, multithreaded key-value store. Redis is single-threaded but supports advanced data structures (Lists, Sets, Hashes), persistence to disk, and pub/sub.",
        difficulty: "Easy"
      },
      {
        id: "cache-q5",
        question: "How do you handle cache invalidation?",
        answer: "Use TTLs for eventual consistency. For strong consistency, application must explicitly delete the cache key when updating the database, or use a CDC (Change Data Capture) tool to invalidate cache asynchronously.",
        difficulty: "Hard"
      }
    ],
    scalingExplanation: "Scale caches horizontally using Consistent Hashing to distribute keys across multiple Redis nodes. Implement Redis Cluster for automatic sharding and failover. Use a multi-tiered caching strategy (Browser Cache -> CDN -> Local API Memory Cache -> Distributed Redis Cache) to filter traffic at the edge.",
    visualizerType: "caching-simulator",
    lastUpdated: "2024-05-20"
  },
  {
    id: "auth-security",
    slug: "auth-security",
    title: "Auth & Security",
    emoji: "🛡️",
    category: "auth-security",
    difficulty: "advanced",
    summary: "Master JWTs, OAuth 2.0, Session Management, and Role-Based Access Control.",
    definition: "Authentication verifies WHO a user is, while Authorization verifies WHAT they are allowed to do. Modern distributed systems rely on stateless tokens (like JWTs), secure password hashing, and zero-trust internal network policies.",
    realWorldExample: "Auth0 provides Identity-as-a-Service, handling complex OAuth flows, MFA, and federated login across thousands of global applications.",
    realWorldCompany: "Auth0",
    advantages: [
      "Stateless JWTs eliminate the need for central session databases.",
      "OAuth allows delegating auth to trusted providers (Google, GitHub).",
      "RBAC simplifies permission management.",
      "Refresh tokens minimize the impact of stolen access tokens.",
      "Bcrypt hashing protects passwords even if the DB is leaked."
    ],
    disadvantages: [
      "JWTs cannot be easily revoked before expiration without a blacklist.",
      "OAuth flows are complex to implement securely.",
      "Storing tokens in localStorage exposes them to XSS attacks.",
      "High compute cost for strong password hashing algorithms.",
      "RBAC can become rigid; PBAC/ABAC is harder to build."
    ],
    useCases: [
      "Single Sign-On (SSO) across microservices.",
      "API rate limiting per user tier.",
      "Third-party API access (OAuth).",
      "Secure password storage."
    ],
    interviewQuestions: [
      {
        id: "auth-q1",
        question: "Sessions vs JWTs?",
        answer: "Sessions require a database lookup (or Redis) on every request to validate state. JWTs are cryptographically signed and stateless, meaning the API can verify them using just a CPU operation and a public/private key pair.",
        difficulty: "Medium"
      },
      {
        id: "auth-q2",
        question: "Where should you store a JWT on the frontend?",
        answer: "HttpOnly, Secure cookies. Storing them in localStorage makes them vulnerable to XSS (Cross-Site Scripting) attacks where malicious scripts can read the token.",
        difficulty: "Medium"
      },
      {
        id: "auth-q3",
        question: "How do you revoke a JWT?",
        answer: "Since they are stateless, you can't natively. You must either wait for expiration, or implement a Redis blacklist of revoked token IDs (JTI), which defeats the stateless benefit.",
        difficulty: "Hard"
      },
      {
        id: "auth-q4",
        question: "Why use bcrypt instead of SHA-256?",
        answer: "SHA-256 is fast, making it vulnerable to brute-force and dictionary attacks. Bcrypt uses a configurable 'work factor' to intentionally slow down the hashing process, defending against massive GPU cracking.",
        difficulty: "Easy"
      },
      {
        id: "auth-q5",
        question: "Explain the Access/Refresh token pattern.",
        answer: "Access tokens are short-lived (15 mins) and used for API requests. Refresh tokens are long-lived (7 days), stored securely, and used ONLY to request new access tokens when they expire.",
        difficulty: "Medium"
      }
    ],
    scalingExplanation: "In a microservices architecture, implement an API Gateway that acts as the centralized Auth enforcing point. The gateway validates the JWT signature, injects the decoded user context into HTTP headers, and proxies the request to internal microservices, ensuring internal services don't need to duplicate auth logic.",
    visualizerType: "auth-flow",
    lastUpdated: "2024-05-20"
  },
  {
    id: "rate-limiting",
    slug: "rate-limiting",
    title: "Rate Limiting Algorithms",
    emoji: "🚦",
    category: "rate-limiting",
    difficulty: "advanced",
    summary: "Visualize and understand how distributed systems protect APIs from overload, abuse, and traffic spikes using Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window algorithms.",
    definition: "Rate limiting is a technique used to control the rate of requests that clients can make to an API. It protects services from being overwhelmed by too many requests, whether from legitimate traffic spikes or malicious attacks like DDoS. Algorithms like Token Bucket allow controlled bursts while maintaining an average rate, Leaky Bucket enforces a strict constant output rate, Fixed Window Counter tracks requests within discrete time intervals, Sliding Window Counter uses weighted calculations across overlapping windows for better accuracy, and Sliding Window Log maintains precise per-request timestamps for the highest accuracy at the cost of memory.",
    realWorldExample: "Stripe uses a sophisticated Token Bucket rate limiter on their payment API. Each merchant gets a bucket of tokens that refills at a set rate. Normal API calls consume one token, but burst-heavy endpoints consume more. If a merchant exhausts their tokens, Stripe returns HTTP 429 with a Retry-After header, preventing any single integration from degrading service for others.",
    realWorldCompany: "Stripe",
    advantages: [
      "Prevents API abuse and protects backend services from overload.",
      "Ensures fair resource distribution across all API consumers.",
      "Mitigates DDoS attacks by throttling suspicious traffic patterns.",
      "Token Bucket allows controlled bursts — ideal for real-world traffic patterns.",
      "Sliding Window algorithms provide smooth, accurate rate enforcement without edge-burst issues.",
      "Enables tiered pricing models (free tier = 100 req/min, pro = 10,000 req/min)."
    ],
    disadvantages: [
      "Fixed Window Counter suffers from edge-burst vulnerability at window boundaries.",
      "Sliding Window Log has high memory overhead (stores every request timestamp).",
      "Distributed rate limiting requires synchronization (Redis), adding latency.",
      "Leaky Bucket can drop legitimate burst traffic that Token Bucket would allow.",
      "Complex to tune — too aggressive limits hurt UX, too lenient limits risk outages.",
      "Race conditions in distributed environments can cause over-counting or under-counting."
    ],
    useCases: [
      "API gateway request throttling (Kong, AWS API Gateway).",
      "Login brute-force prevention (max 5 attempts per minute).",
      "DDoS mitigation at the edge (Cloudflare, Akamai).",
      "Payment API protection (Stripe, PayPal).",
      "Social media post rate limits (Twitter: 300 tweets/3hr).",
      "Database query throttling to prevent cascade failures."
    ],
    interviewQuestions: [
      {
        id: "rl-q1",
        question: "What is the difference between Token Bucket and Leaky Bucket?",
        answer: "Token Bucket allows bursts — if the bucket has accumulated tokens, a client can send many requests at once until tokens are depleted. Leaky Bucket enforces a strict constant output rate regardless of input — requests queue up and are processed at a fixed rate, making it a traffic shaper rather than a rate limiter. Token Bucket is preferred when you want to allow occasional bursts (like API gateways), while Leaky Bucket is preferred when you need smooth, predictable output (like network traffic shaping).",
        difficulty: "Medium"
      },
      {
        id: "rl-q2",
        question: "Why is the Fixed Window Counter vulnerable to edge bursts?",
        answer: "Consider a limit of 100 requests per minute. A client can send 100 requests at 00:59 and another 100 at 01:00. That is 200 requests in 2 seconds — double the intended rate — because the counter resets at the window boundary. Sliding Window algorithms solve this by considering traffic from the previous window when calculating the current rate.",
        difficulty: "Medium"
      },
      {
        id: "rl-q3",
        question: "How does Redis help in distributed rate limiting?",
        answer: "In a multi-server setup, each server needs a shared view of the request count. Redis provides atomic operations like INCR and EXPIRE that allow all servers to share a single counter. Using Redis Lua scripts, you can atomically check-and-increment the counter, preventing race conditions. Redis Cluster can be used for high availability, and the TTL feature naturally handles window expiration.",
        difficulty: "Hard"
      },
      {
        id: "rl-q4",
        question: "Which algorithm is best for burst traffic handling?",
        answer: "Token Bucket is the best for handling burst traffic. It accumulates tokens over time, allowing a client to 'save up' capacity and use it in a burst. For example, with a refill rate of 10 tokens/sec and a bucket size of 100, a client that was idle for 10 seconds can burst 100 requests instantly. AWS API Gateway, Stripe, and most cloud providers use Token Bucket for this reason.",
        difficulty: "Easy"
      },
      {
        id: "rl-q5",
        question: "How would you scale a rate limiter globally?",
        answer: "Use a tiered approach: (1) Local in-memory rate limiters at each edge server for fast, approximate limiting, (2) Regional Redis clusters for accurate per-region counting, (3) Asynchronous synchronization between regions using eventual consistency. Accept that global consistency is impractical — allow slight over-limit in exchange for low latency. Use sticky sessions or consistent hashing to route the same client to the same limiter when possible.",
        difficulty: "Hard"
      },
      {
        id: "rl-q6",
        question: "What is the Sliding Window Counter algorithm?",
        answer: "Sliding Window Counter is a hybrid of Fixed Window and Sliding Window Log. It keeps counters for the current and previous windows, then calculates a weighted count: count = current_window_count + previous_window_count × overlap_percentage. For example, if 70% of the previous window overlaps with the current sliding window, the effective count is current + 0.7 × previous. This provides better accuracy than Fixed Window with much less memory than Sliding Window Log.",
        difficulty: "Medium"
      },
      {
        id: "rl-q7",
        question: "How do you handle rate limiting in microservices?",
        answer: "Implement rate limiting at the API Gateway level (centralized) rather than in each microservice (decentralized). The gateway uses a shared Redis store to track request counts per client/IP/API key. For internal service-to-service calls, use circuit breakers (Hystrix pattern) instead of rate limiters. Apply different limits per endpoint — a health check endpoint should have higher limits than a payment endpoint.",
        difficulty: "Hard"
      }
    ],
    scalingExplanation: "To scale rate limiting to millions of requests per second, implement a multi-layered approach: Layer 1 — Edge-level rate limiting using in-memory counters at CDN/reverse proxy (Nginx, Envoy) for ultra-low latency. Layer 2 — API Gateway with Redis-backed Token Bucket for accurate per-key limiting. Layer 3 — Application-level circuit breakers for downstream protection. Use Redis Cluster with read replicas for the shared counter store. Implement rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) so clients can self-throttle.",
    visualizerType: "rate-limiting",
    lastUpdated: "2024-05-22"
  }
];
