import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Generate a contextual mock response
    let mockResponse = `I see you're asking about: "${lastMessage}".\n\nAs an AI System Design tutor, I can tell you that in a real distributed system, you'd want to consider the tradeoffs of this approach. For example, using Redis here would reduce latency, but you must handle cache invalidation carefully to avoid stale data.`;
    
    if (lastMessage.toLowerCase().includes("kafka")) {
      mockResponse = "Ah, Kafka! It's a distributed event streaming platform. Unlike RabbitMQ which uses a smart-broker model, Kafka is a dumb-broker/smart-consumer model relying on an append-only log. It scales massively via partitions.";
    } else if (lastMessage.toLowerCase().includes("cap")) {
      mockResponse = "The CAP theorem states that a distributed data store can only simultaneously provide two out of three guarantees: Consistency, Availability, and Partition Tolerance. Since network partitions (P) are inevitable, you must choose between CP and AP.";
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const words = mockResponse.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '));
          await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 10));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch {
    return Response.json({ error: "Failed to connect to AI" }, { status: 500 });
  }
}
