import { type User, type InsertUser, type ImageGeneration, type InsertImageGeneration } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createImageGeneration(generation: InsertImageGeneration): Promise<ImageGeneration>;
  getImageGeneration(id: string): Promise<ImageGeneration | undefined>;
  updateImageGenerationResults(id: string, generatedImages: string[]): Promise<ImageGeneration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private imageGenerations: Map<string, ImageGeneration>;

  constructor() {
    this.users = new Map();
    this.imageGenerations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createImageGeneration(generation: InsertImageGeneration): Promise<ImageGeneration> {
    const id = randomUUID();
    const imageGeneration: ImageGeneration = {
      ...generation,
      id,
      generatedImages: [],
      createdAt: new Date(),
    };
    this.imageGenerations.set(id, imageGeneration);
    return imageGeneration;
  }

  async getImageGeneration(id: string): Promise<ImageGeneration | undefined> {
    return this.imageGenerations.get(id);
  }

  async updateImageGenerationResults(id: string, generatedImages: string[]): Promise<ImageGeneration | undefined> {
    const generation = this.imageGenerations.get(id);
    if (!generation) return undefined;
    
    const updated = { ...generation, generatedImages };
    this.imageGenerations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
