import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertImageGenerationSchema } from "@shared/schema";
import { generateImageVariations } from "./services/gemini";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Nano Banana API" });
  });

  // Upload images and create generation request
  app.post("/api/generate", upload.fields([
    { name: 'mainPhoto', maxCount: 1 },
    { name: 'prop1', maxCount: 1 },
    { name: 'prop2', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { prompt, numVariations = 5, aspectRatio = "1:1" } = req.body;

      if (!files.mainPhoto?.[0]) {
        return res.status(400).json({ error: "Main photo is required" });
      }

      if (!prompt || prompt.trim().length < 10) {
        return res.status(400).json({ error: "Prompt must be at least 10 characters" });
      }

      // Validate request data
      const validatedData = insertImageGenerationSchema.parse({
        mainPhotoUrl: files.mainPhoto[0].path,
        prop1Url: files.prop1?.[0]?.path || null,
        prop2Url: files.prop2?.[0]?.path || null,
        prompt: prompt.trim(),
        numVariations: parseInt(numVariations),
        aspectRatio,
      });

      // Create generation record
      const generation = await storage.createImageGeneration(validatedData);

      // Start image generation in background
      generateImageVariations(generation).catch(console.error);

      res.json({ 
        id: generation.id, 
        status: "processing",
        message: "Image generation started"
      });

    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Generation failed" });
    }
  });

  // Get generation status and results
  app.get("/api/generation/:id", async (req, res) => {
    try {
      const generation = await storage.getImageGeneration(req.params.id);
      
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }

      const isComplete = generation.generatedImages && generation.generatedImages.length > 0;
      
      res.json({
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
      res.status(500).json({ error: "Failed to get generation status" });
    }
  });

  // Serve uploaded and generated images
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const imagePath = path.resolve("uploads", filename);
      
      // Check if file exists
      await fs.access(imagePath);
      
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).json({ error: "Image not found" });
    }
  });

  // Download generated image
  app.get("/api/download/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const imagePath = path.resolve("uploads", filename);
      
      await fs.access(imagePath);
      
      res.download(imagePath, `nano-banana-${Date.now()}.png`);
    } catch (error) {
      res.status(404).json({ error: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
