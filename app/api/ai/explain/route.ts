import { NextRequest } from 'next/server';

const MOCK_EXPLANATION = `Here is a breakdown of this distributed system concept:

**Architecture Overview**
*   **Client Interface:** The entry point for all requests.
*   **Load Balancer:** Distributes traffic evenly across available nodes.
*   **Service Tier:** The core application logic handlers.
*   **Data Layer:** Persistent storage (SQL/NoSQL) and caching (Redis).

**Key Bottlenecks**
*   Database write contention under heavy load.
*   Network latency between microservices.
*   Cache invalidation delays causing stale reads.

**Design Tradeoffs**
*   **Consistency vs. Availability (CAP Theorem):** Opting for high availability means accepting eventual consistency during network partitions.
*   **Latency vs. Throughput:** Batching requests increases throughput but slightly increases individual request latency.

**How to Scale to 10x Load**
*   Implement horizontal sharding at the database layer.
*   Introduce read replicas to offload read-heavy traffic.
*   Decouple heavy tasks using message queues (Kafka).

**Common Interview Mistakes**
*   *Jumping straight to a solution* without clarifying read/write ratios and capacity estimations.
*   *Overcomplicating the design* by adding Kafka or Redis before identifying a clear bottleneck that requires them.
`;

export async function POST(req: NextRequest) {
  try {
    await req.json();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Mock streaming logic
        const words = MOCK_EXPLANATION.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '));
          // Simulate network delay between 20ms and 50ms
          await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch {
    return Response.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
