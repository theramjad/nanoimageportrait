import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from "@google/genai";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""
});

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

    // Prepare images for Gemini
    const images: Array<{ inlineData: { data: string; mimeType: string } }> = [];

    // Main photo
    const mainPhotoBuffer = Buffer.from(await mainPhoto.arrayBuffer());
    images.push({
      inlineData: {
        data: mainPhotoBuffer.toString("base64"),
        mimeType: mainPhoto.type,
      },
    });

    // Prop images (optional)
    if (prop1 && prop1.type.startsWith('image/')) {
      const prop1Buffer = Buffer.from(await prop1.arrayBuffer());
      images.push({
        inlineData: {
          data: prop1Buffer.toString("base64"),
          mimeType: prop1.type,
        },
      });
    }

    if (prop2 && prop2.type.startsWith('image/')) {
      const prop2Buffer = Buffer.from(await prop2.arrayBuffer());
      images.push({
        inlineData: {
          data: prop2Buffer.toString("base64"),
          mimeType: prop2.type,
        },
      });
    }

    // Generate images synchronously
    const generatedImages: string[] = [];

    for (let i = 0; i < numVariations; i++) {
      try {
        console.log(`Generating variation ${i + 1}/${numVariations}`);

        // Enhance prompt with aspect ratio and variation details
        let enhancedPrompt = prompt;
        if (aspectRatio && aspectRatio !== "1:1") {
          enhancedPrompt += ` in ${aspectRatio} aspect ratio`;
        }
        enhancedPrompt += `. Create a unique variation with creative lighting and composition.`;

        // Prepare content for Gemini API
        const contents = [
          ...images,
          { text: enhancedPrompt }
        ];

        // Call Gemini 2.0 Flash Preview Image Generation model
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-preview-image-generation",
          contents: [{ role: "user", parts: contents }],
          config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
          },
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
          console.warn(`No candidates returned for variation ${i + 1}`);
          continue;
        }

        const content = candidates[0].content;
        if (!content || !content.parts) {
          console.warn(`No content parts returned for variation ${i + 1}`);
          continue;
        }

        // Process response parts
        for (const part of content.parts) {
          if (part.text) {
            console.log(`Gemini response: ${part.text}`);
          } else if (part.inlineData && part.inlineData.data) {
            // Return image as base64 data URL
            const base64Image = `data:image/png;base64,${part.inlineData.data}`;
            generatedImages.push(base64Image);
            console.log(`Generated image ${i + 1}`);
            break;
          }
        }

        // Small delay between generations to avoid rate limiting
        if (i < numVariations - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (variationError) {
        console.error(`Error generating variation ${i + 1}:`, variationError);
      }
    }

    if (generatedImages.length === 0) {
      throw new Error("No images were generated successfully");
    }

    return NextResponse.json({
      status: "completed",
      generatedImages,
      message: `Successfully generated ${generatedImages.length} variations`
    });

  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
