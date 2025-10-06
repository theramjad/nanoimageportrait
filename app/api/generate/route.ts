import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { storage } from '@/lib/server/storage';
import { insertImageGenerationSchema } from '@/lib/shared/schema';
import { generateImageVariations } from '@/lib/server/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const mainPhoto = formData.get('mainPhoto') as File | null;
    const prop1 = formData.get('prop1') as File | null;
    const prop2 = formData.get('prop2') as File | null;
    const prompt = formData.get('prompt') as string;
    const numVariations = parseInt(formData.get('numVariations') as string || '5');
    const aspectRatio = formData.get('aspectRatio') as string || '1:1';

    if (!mainPhoto) {
      return NextResponse.json({ error: "Main photo is required" }, { status: 400 });
    }

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Prompt must be at least 10 characters" }, { status: 400 });
    }

    // Validate file types
    if (!mainPhoto.type.startsWith('image/')) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Save uploaded files
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Save main photo
    const mainPhotoBuffer = Buffer.from(await mainPhoto.arrayBuffer());
    const mainPhotoPath = path.join(uploadDir, `main_${Date.now()}_${mainPhoto.name}`);
    await writeFile(mainPhotoPath, mainPhotoBuffer);

    // Save prop images if provided
    let prop1Path: string | null = null;
    let prop2Path: string | null = null;

    if (prop1 && prop1.type.startsWith('image/')) {
      const prop1Buffer = Buffer.from(await prop1.arrayBuffer());
      prop1Path = path.join(uploadDir, `prop1_${Date.now()}_${prop1.name}`);
      await writeFile(prop1Path, prop1Buffer);
    }

    if (prop2 && prop2.type.startsWith('image/')) {
      const prop2Buffer = Buffer.from(await prop2.arrayBuffer());
      prop2Path = path.join(uploadDir, `prop2_${Date.now()}_${prop2.name}`);
      await writeFile(prop2Path, prop2Buffer);
    }

    // Validate request data
    const validatedData = insertImageGenerationSchema.parse({
      mainPhotoUrl: mainPhotoPath,
      prop1Url: prop1Path,
      prop2Url: prop2Path,
      prompt: prompt.trim(),
      numVariations,
      aspectRatio,
    });

    // Create generation record
    const generation = await storage.createImageGeneration(validatedData);

    // Start image generation in background (don't await)
    generateImageVariations(generation).catch(console.error);

    return NextResponse.json({
      id: generation.id,
      status: "processing",
      message: "Image generation started"
    });

  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
