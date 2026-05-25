import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Mock evaluation logic
    // Generate a random score between 6 and 9
    const score = Math.floor(Math.random() * 4) + 6;
    
    const evaluation = {
      score,
      whatYouGotRight: [
        "You correctly identified the main component needed.",
        "Good understanding of the scalability constraints."
      ],
      whatYouMissed: [
        "You didn't mention handling the edge case of node failure.",
        "Could have discussed the storage schema in more depth."
      ],
      modelAnswer: "A complete answer would discuss partitioning the database by user ID, placing a Redis cluster in front to absorb read traffic, and handling leader election via Zookeeper. You should also touch upon rate limiting at the API Gateway level to prevent abuse."
    };

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  }
}
