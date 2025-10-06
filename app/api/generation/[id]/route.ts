import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/server/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generation = await storage.getImageGeneration(id);

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    const isComplete = generation.generatedImages && generation.generatedImages.length > 0;

    return NextResponse.json({
      id: generation.id,
      status: isComplete ? "completed" : "processing",
      prompt: generation.prompt,
      numVariations: generation.numVariations,
      aspectRatio: generation.aspectRatio,
      generatedImages: generation.generatedImages,
      createdAt: generation.createdAt
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to get generation status" },
      { status: 500 }
    );
  }
}
