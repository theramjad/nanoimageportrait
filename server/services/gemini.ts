import * as fs from "fs";
import * as path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import { storage } from "../storage";
import { type ImageGeneration } from "@shared/schema";

// Initialize Gemini AI with API key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

/**
 * Generate image variations using Gemini 2.5 Flash Image
 */
export async function generateImageVariations(generation: ImageGeneration): Promise<void> {
  try {
    console.log(`Starting image generation for ID: ${generation.id}`);
    
    // Read and encode images
    const images: Array<{ inlineData: { data: string; mimeType: string } }> = [];
    
    // Main photo (required)
    if (generation.mainPhotoUrl) {
      const mainPhotoData = await fs.promises.readFile(generation.mainPhotoUrl);
      const mainPhotoMimeType = getMimeType(generation.mainPhotoUrl);
      images.push({
        inlineData: {
          data: mainPhotoData.toString("base64"),
          mimeType: mainPhotoMimeType,
        },
      });
    }
    
    // Prop images (optional)
    if (generation.prop1Url) {
      const prop1Data = await fs.promises.readFile(generation.prop1Url);
      const prop1MimeType = getMimeType(generation.prop1Url);
      images.push({
        inlineData: {
          data: prop1Data.toString("base64"),
          mimeType: prop1MimeType,
        },
      });
    }
    
    if (generation.prop2Url) {
      const prop2Data = await fs.promises.readFile(generation.prop2Url);
      const prop2MimeType = getMimeType(generation.prop2Url);
      images.push({
        inlineData: {
          data: prop2Data.toString("base64"),
          mimeType: prop2MimeType,
        },
      });
    }

    // Generate the specified number of variations
    const generatedImagePaths: string[] = [];
    const numVariations = generation.numVariations || 5;
    
    for (let i = 0; i < numVariations; i++) {
      try {
        console.log(`Generating variation ${i + 1}/${numVariations}`);
        
        // Enhance prompt with aspect ratio and variation details
        let enhancedPrompt = generation.prompt;
        if (generation.aspectRatio && generation.aspectRatio !== "1:1") {
          enhancedPrompt += ` in ${generation.aspectRatio} aspect ratio`;
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
        let imageGenerated = false;
        for (const part of content.parts) {
          if (part.text) {
            console.log(`Gemini response: ${part.text}`);
          } else if (part.inlineData && part.inlineData.data) {
            // Save generated image
            const imageData = Buffer.from(part.inlineData.data, "base64");
            const filename = `generated_${generation.id}_${i + 1}_${Date.now()}.png`;
            const imagePath = path.resolve("uploads", filename);
            
            await fs.promises.writeFile(imagePath, imageData);
            generatedImagePaths.push(filename);
            imageGenerated = true;
            
            console.log(`Generated image ${i + 1} saved as ${filename}`);
            break;
          }
        }
        
        if (!imageGenerated) {
          console.warn(`Failed to generate image for variation ${i + 1}`);
        }
        
        // Small delay between generations to avoid rate limiting
        if (i < numVariations - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (variationError) {
        console.error(`Error generating variation ${i + 1}:`, variationError);
        // Continue with next variation even if one fails
      }
    }

    // Update storage with generated images
    if (generatedImagePaths.length > 0) {
      await storage.updateImageGenerationResults(generation.id, generatedImagePaths);
      console.log(`Successfully generated ${generatedImagePaths.length} variations for ${generation.id}`);
    } else {
      throw new Error("No images were generated successfully");
    }

  } catch (error) {
    console.error(`Failed to generate images for ${generation.id}:`, error);
    
    // Update storage to mark as failed (empty array indicates failure)
    await storage.updateImageGenerationResults(generation.id, []);
    
    throw new Error(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get MIME type from file path
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // Default fallback
  }
}

/**
 * Analyze an uploaded image to provide context for generation
 */
export async function analyzeImage(imagePath: string): Promise<string> {
  try {
    const imageBytes = await fs.promises.readFile(imagePath);
    const mimeType = getMimeType(imagePath);

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: mimeType,
        },
      },
      "Analyze this image in detail and describe its key elements, composition, lighting, and style. Focus on details that would be important for AI image generation.",
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    return response.text || "Unable to analyze image";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Image analysis failed";
  }
}
