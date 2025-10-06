import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GeneratedImage {
  id: string;
  url: string;
  createdAt: Date;
}

interface ImageCarouselProps {
  originalImages: {
    mainPhoto: File | null;
    prop1: File | null;
    prop2: File | null;
  };
  generatedImages: GeneratedImage[];
  onDownload: (imageUrl: string, filename?: string) => void;
  onDownloadAll: () => void;
  onGenerateMore: () => void;
}

export default function ImageCarousel({ 
  originalImages, 
  generatedImages, 
  onDownload, 
  onDownloadAll, 
  onGenerateMore 
}: ImageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!generatedImages.length) {
    return null;
  }

  return (
    <section className="py-12" data-testid="results-gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Generated Variations</h3>
            <p className="text-muted-foreground">Browse through your AI-generated image variations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollCarousel('left')}
              data-testid="button-scroll-left"
            >
              <i className="fas fa-chevron-left"></i>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollCarousel('right')}
              data-testid="button-scroll-right"
            >
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </div>

        {/* Original Images */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-images text-primary"></i>
            Original Uploads
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Main Photo */}
            {originalImages.mainPhoto && (
              <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden" data-testid="card-original-main">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img 
                    src={URL.createObjectURL(originalImages.mainPhoto)} 
                    alt="Original main photo" 
                    className="w-full h-full object-cover"
                    data-testid="img-original-main"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">Main Photo</p>
                  <p className="text-xs text-muted-foreground">Original upload</p>
                </div>
              </div>
            )}

            {/* Prop 1 */}
            {originalImages.prop1 && (
              <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden" data-testid="card-original-prop1">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img 
                    src={URL.createObjectURL(originalImages.prop1)} 
                    alt="Prop 1" 
                    className="w-full h-full object-cover"
                    data-testid="img-original-prop1"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">Prop 1</p>
                  <p className="text-xs text-muted-foreground">{originalImages.prop1.name}</p>
                </div>
              </div>
            )}

            {/* Prop 2 */}
            {originalImages.prop2 && (
              <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden" data-testid="card-original-prop2">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img 
                    src={URL.createObjectURL(originalImages.prop2)} 
                    alt="Prop 2" 
                    className="w-full h-full object-cover"
                    data-testid="img-original-prop2"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">Prop 2</p>
                  <p className="text-xs text-muted-foreground">{originalImages.prop2.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Variations */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-sparkles text-secondary"></i>
            AI-Generated Variations <span className="text-sm font-normal text-muted-foreground ml-2" data-testid="text-variation-count">({generatedImages.length} variations)</span>
          </h4>
        </div>

        <div 
          ref={carouselRef}
          className="carousel-container pb-4" 
          data-testid="carousel-container"
        >
          {generatedImages.map((image, index) => (
            <div key={image.id} className="carousel-item" data-testid={`carousel-item-${index}`}>
              <div className="image-card bg-card rounded-xl shadow-lg border border-border overflow-hidden w-80">
                <div className="relative aspect-square bg-muted">
                  <img 
                    src={image.url} 
                    alt={`Generated variation ${index + 1}`} 
                    className="w-full h-full object-cover"
                    data-testid={`img-generated-${index}`}
                  />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Variation {index + 1}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Generated</span>
                    </div>
                    <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${index}`}>
                      {new Date(image.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => onDownload(image.url, `nano-banana-variation-${index + 1}.png`)}
                      data-testid={`button-download-${index}`}
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
                      data-testid={`button-view-${index}`}
                    >
                      <i className="fas fa-expand"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="mt-8 flex items-center justify-between p-6 bg-muted/30 rounded-xl border border-border" data-testid="bulk-actions">
          <div className="flex items-center gap-3">
            <i className="fas fa-info-circle text-primary text-xl"></i>
            <div>
              <p className="text-sm font-medium">All variations generated successfully</p>
              <p className="text-xs text-muted-foreground" data-testid="text-bulk-count">
                {generatedImages.length} images ready for download
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onDownloadAll}
              data-testid="button-download-all"
            >
              <i className="fas fa-download mr-2"></i>
              Download All
            </Button>
            <Button 
              onClick={onGenerateMore}
              className="gradient-bg text-white hover:opacity-90"
              data-testid="button-generate-more"
            >
              <i className="fas fa-plus mr-2"></i>
              Generate More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
