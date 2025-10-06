import React from 'react';

interface LoadingStateProps {
  progress?: number;
  message?: string;
}

export default function LoadingState({ progress = 0, message = "Processing images..." }: LoadingStateProps) {
  return (
    <section className="py-12" data-testid="loading-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-xl shadow-lg p-12 border border-border text-center">
          <div className="flex justify-center mb-6">
            <div className="loading-spinner" data-testid="loading-spinner"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Generating Your Variations...</h3>
          <p className="text-muted-foreground mb-6" data-testid="text-loading-message">
            Google Nano Banana is working its magic. This may take 10-30 seconds.
          </p>
          <div className="max-w-md mx-auto bg-muted/30 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full gradient-bg animate-pulse-slow transition-all duration-500" 
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3" data-testid="text-progress">
            {message} <span>{Math.round(progress)}%</span>
          </p>
        </div>
      </div>
    </section>
  );
}
