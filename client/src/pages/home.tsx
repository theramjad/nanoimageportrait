import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import UploadZone from '@/components/upload-zone';
import LoadingState from '@/components/loading-state';
import ImageCarousel from '@/components/image-carousel';

interface GenerationResponse {
  id: string;
  status: 'processing' | 'completed';
  message: string;
}

interface GenerationStatus {
  id: string;
  status: 'processing' | 'completed';
  prompt: string;
  numVariations: number;
  aspectRatio: string;
  generatedImages: string[];
  createdAt: string;
}

export default function Home() {
  const { toast } = useToast();
  
  // Form state
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [prop1, setProp1] = useState<File | null>(null);
  const [prop2, setProp2] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Create an image of me holding both props in a sunny outdoor setting with professional photography lighting');
  const [numVariations, setNumVariations] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generationId, setGenerationId] = useState<string | null>(null);

  // Generate images mutation
  const generateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/generate', formData);
      return response.json() as Promise<GenerationResponse>;
    },
    onSuccess: (data) => {
      setGenerationId(data.id);
      toast({
        title: "Generation Started",
        description: "Your images are being generated. This may take 10-30 seconds.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start image generation",
        variant: "destructive",
      });
    },
  });

  // Poll generation status
  const { data: generationStatus, isLoading: isPolling } = useQuery<GenerationStatus>({
    queryKey: ['/api/generation', generationId],
    enabled: !!generationId,
    refetchInterval: (query) => {
      // Stop polling when complete
      return query.state.data?.status === 'completed' ? false : 2000;
    },
    refetchIntervalInBackground: true,
  });

  const handleGenerate = useCallback(async () => {
    if (!mainPhoto) {
      toast({
        title: "Main Photo Required",
        description: "Please upload a main photo to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim() || prompt.trim().length < 10) {
      toast({
        title: "Invalid Prompt",
        description: "Please provide a prompt with at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('mainPhoto', mainPhoto);
    if (prop1) formData.append('prop1', prop1);
    if (prop2) formData.append('prop2', prop2);
    formData.append('prompt', prompt.trim());
    formData.append('numVariations', numVariations.toString());
    formData.append('aspectRatio', aspectRatio);

    generateMutation.mutate(formData);
  }, [mainPhoto, prop1, prop2, prompt, numVariations, aspectRatio, generateMutation, toast]);

  const handleDownload = useCallback(async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename || `nano-banana-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the image.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDownloadAll = useCallback(async () => {
    if (!generationStatus?.generatedImages.length) return;

    try {
      for (let i = 0; i < generationStatus.generatedImages.length; i++) {
        await handleDownload(generationStatus.generatedImages[i], `nano-banana-variation-${i + 1}.png`);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      toast({
        title: "Bulk Download Failed",
        description: "Some images may not have downloaded successfully.",
        variant: "destructive",
      });
    }
  }, [generationStatus, handleDownload, toast]);

  const handleGenerateMore = useCallback(() => {
    setGenerationId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isGenerating = generateMutation.isPending || (generationId && generationStatus?.status === 'processing');
  const isCompleted = generationStatus?.status === 'completed';
  const generatedImages = generationStatus?.generatedImages.map((url, index) => ({
    id: `${generationId}-${index}`,
    url: `/api/images/${url}`,
    createdAt: new Date(generationStatus.createdAt)
  })) || [];

  const progress = isGenerating ? Math.min(90, Math.random() * 80 + 10) : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <i className="fas fa-wand-magic-sparkles text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Nano Banana</h1>
                <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash Image</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://ai.google.dev/gemini-api/docs/image-generation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-api-docs"
              >
                <i className="fas fa-book mr-2"></i>API Docs
              </a>
              <Button variant="default" size="sm" data-testid="button-api-key">
                <i className="fas fa-key mr-2"></i>API Key
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Create <span className="gradient-text">AI-Powered</span> Image Variations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload your photo and props, then watch Google's Nano Banana generate stunning variations with character consistency and multi-image blending.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <i className="fas fa-check-circle text-primary"></i>
              <span>Character Consistency</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check-circle text-primary"></i>
              <span>Multi-Image Blending</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check-circle text-primary"></i>
              <span>Pixel-Perfect Editing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12" data-testid="upload-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Upload Your Images</h3>
              <p className="text-muted-foreground">Upload one main photo and up to two prop images to create unique AI-generated variations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <UploadZone
                type="main"
                file={mainPhoto}
                onFileSelect={setMainPhoto}
              />
              <UploadZone
                type="prop1"
                file={prop1}
                onFileSelect={setProp1}
              />
              <UploadZone
                type="prop2"
                file={prop2}
                onFileSelect={setProp2}
              />
            </div>

            {/* Prompt Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">
                <i className="fas fa-wand-magic-sparkles text-primary mr-2"></i>Generation Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe how you want the images blended... e.g., 'Create an image of me holding both props in a fancy restaurant with vibrant lighting'"
                className="resize-none"
                data-testid="textarea-prompt"
              />
            </div>

            {/* Generation Settings */}
            <div className="mb-8 p-6 bg-muted/30 rounded-lg border border-border">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-sliders text-primary"></i>
                Generation Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Variations</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={numVariations}
                    onChange={(e) => setNumVariations(parseInt(e.target.value) || 5)}
                    data-testid="input-num-variations"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Generate 1-10 variations</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger data-testid="select-aspect-ratio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="4:3">Classic (4:3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !mainPhoto || !prompt.trim()}
                size="lg"
                className="px-8 py-4 gradient-bg text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                data-testid="button-generate"
              >
                <i className="fas fa-wand-magic-sparkles mr-3"></i>
                {generateMutation.isPending ? 'Starting Generation...' : 'Generate AI Variations'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isGenerating && (
        <LoadingState 
          progress={progress} 
          message="Processing images..."
        />
      )}

      {/* Results Gallery */}
      {isCompleted && generatedImages.length > 0 && (
        <ImageCarousel
          originalImages={{ mainPhoto, prop1, prop2 }}
          generatedImages={generatedImages}
          onDownload={handleDownload}
          onDownloadAll={handleDownloadAll}
          onGenerateMore={handleGenerateMore}
        />
      )}

      {/* How It Works Section */}
      <section className="py-12 bg-muted/30" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How Nano Banana Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powered by Google DeepMind's Gemini 2.5 Flash Image, the world's top-rated image editing model
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl shadow-md border border-border p-8 text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
              </div>
              <h4 className="text-xl font-bold mb-3">1. Upload Images</h4>
              <p className="text-muted-foreground">
                Upload your main photo and up to two prop images. Our system accepts PNG and JPG formats.
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-md border border-border p-8 text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-brain text-white text-2xl"></i>
              </div>
              <h4 className="text-xl font-bold mb-3">2. AI Processing</h4>
              <p className="text-muted-foreground">
                Gemini 2.5 Flash analyzes your images and generates variations with character consistency and perfect blending.
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-md border border-border p-8 text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-images text-white text-2xl"></i>
              </div>
              <h4 className="text-xl font-bold mb-3">3. Get Variations</h4>
              <p className="text-muted-foreground">
                Browse through multiple AI-generated variations and download your favorites in high quality.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-primary text-3xl font-bold mb-2">500M+</div>
              <p className="text-sm text-muted-foreground">Images Edited</p>
            </div>
            <div className="text-center">
              <div className="text-primary text-3xl font-bold mb-2">#1</div>
              <p className="text-sm text-muted-foreground">Globally Ranked</p>
            </div>
            <div className="text-center">
              <div className="text-primary text-3xl font-bold mb-2">10s</div>
              <p className="text-sm text-muted-foreground">Avg. Generation</p>
            </div>
            <div className="text-center">
              <div className="text-primary text-3xl font-bold mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Character Consistent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <i className="fas fa-wand-magic-sparkles text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">Nano Banana</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              AI-powered image generation and editing using Google's Gemini 2.5 Flash Image.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Nano Banana. Powered by Google DeepMind's Gemini 2.5 Flash Image.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
