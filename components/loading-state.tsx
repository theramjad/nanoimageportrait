import React from 'react';

interface LoadingStateProps {
  progress?: number;
  message?: string;
}

export default function LoadingState({ progress = 0, message = "Processing images..." }: LoadingStateProps) {
  return (
    <section className="py-12 animate-slide-in" data-testid="loading-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-xl shadow-lg p-12 border border-border text-center">
          {/* Animated Spinner */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="loading-spinner" data-testid="loading-spinner"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-wand-magic-sparkles text-primary text-2xl animate-pulse-slow"></i>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <h3 className="text-2xl font-bold mb-2 gradient-text">Generating Your Variations...</h3>
          <p className="text-muted-foreground mb-8" data-testid="text-loading-message">
            Google Nano Banana is working its magic. This may take 10-30 seconds.
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto bg-muted/30 rounded-full h-4 overflow-hidden shadow-inner mb-4">
            <div
              className="h-full gradient-bg transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground" data-testid="text-progress">
              {message}
            </p>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>

          {/* Loading Steps */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`flex items-center justify-center gap-2 ${progress > 10 ? 'text-primary' : 'text-muted-foreground'}`}>
              <i className={`fas fa-check-circle ${progress > 10 ? 'text-primary' : 'text-muted-foreground/50'}`}></i>
              <span>Uploading Images</span>
            </div>
            <div className={`flex items-center justify-center gap-2 ${progress > 40 ? 'text-primary' : 'text-muted-foreground'}`}>
              <i className={`fas ${progress > 40 ? 'fa-check-circle text-primary' : 'fa-circle-notch fa-spin text-muted-foreground/50'}`}></i>
              <span>AI Processing</span>
            </div>
            <div className={`flex items-center justify-center gap-2 ${progress >= 100 ? 'text-primary' : 'text-muted-foreground'}`}>
              <i className={`fas ${progress >= 100 ? 'fa-check-circle text-primary' : 'fa-circle text-muted-foreground/50'}`}></i>
              <span>Finalizing Results</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
