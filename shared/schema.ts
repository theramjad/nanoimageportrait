import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const imageGenerations = pgTable("image_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mainPhotoUrl: text("main_photo_url").notNull(),
  prop1Url: text("prop1_url"),
  prop2Url: text("prop2_url"),
  prompt: text("prompt").notNull(),
  numVariations: integer("num_variations").default(5),
  aspectRatio: text("aspect_ratio").default("1:1"),
  generatedImages: text("generated_images").array().$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertImageGenerationSchema = createInsertSchema(imageGenerations).omit({
  id: true,
  createdAt: true,
}).extend({
  mainPhotoUrl: z.string().min(1, "Main photo is required"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  numVariations: z.number().min(1).max(10).optional(),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3"]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ImageGeneration = typeof imageGenerations.$inferSelect;
export type InsertImageGeneration = z.infer<typeof insertImageGenerationSchema>;
