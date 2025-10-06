import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
  type: 'main' | 'prop1' | 'prop2';
  className?: string;
}

const getZoneConfig = (type: string) => {
  switch (type) {
    case 'main':
      return {
        title: 'Main Photo',
        subtitle: 'Drop your photo here',
        icon: 'fas fa-user-circle',
        buttonText: 'Choose File',
        buttonClass: 'bg-primary text-primary-foreground',
        required: true
      };
    case 'prop1':
      return {
        title: 'Prop Image 1',
        subtitle: 'Drop prop image here',
        icon: 'fas fa-image',
        buttonText: 'Choose File',
        buttonClass: 'bg-secondary text-secondary-foreground',
        required: false
      };
    case 'prop2':
      return {
        title: 'Prop Image 2',
        subtitle: 'Drop prop image here',
        icon: 'fas fa-image',
        buttonText: 'Choose File',
        buttonClass: 'bg-secondary text-secondary-foreground',
        required: false
      };
    default:
      return {
        title: 'Upload Image',
        subtitle: 'Drop image here',
        icon: 'fas fa-image',
        buttonText: 'Choose File',
        buttonClass: 'bg-primary text-primary-foreground',
        required: false
      };
  }
};

export default function UploadZone({ onFileSelect, file, type, className }: UploadZoneProps) {
  const config = getZoneConfig(type);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <div className={cn("space-y-3", className)} data-testid={`upload-zone-${type}`}>
      <label className="block text-sm font-semibold">
        {config.title} {config.required && <span className="text-destructive">*</span>}
      </label>
      <div
        {...getRootProps()}
        className={cn(
          "upload-zone rounded-xl p-8 text-center bg-muted/30 min-h-[280px] flex flex-col items-center justify-center cursor-pointer transition-all",
          file && "has-file",
          isDragActive && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} data-testid={`input-${type}`} />
        
        {file ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="max-w-full max-h-40 object-contain rounded-lg mb-4"
              data-testid={`preview-${type}`}
            />
            <p className="text-sm font-medium mb-2">{file.name}</p>
            <p className="text-xs text-muted-foreground mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              data-testid={`button-remove-${type}`}
            >
              <i className="fas fa-trash mr-2"></i>Remove
            </button>
          </div>
        ) : (
          <>
            <i className={cn(config.icon, "text-6xl text-muted-foreground mb-4")}></i>
            <p className="text-sm font-medium mb-1">
              {isDragActive ? "Drop the file here" : config.subtitle}
            </p>
            <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
            <button 
              type="button" 
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity",
                config.buttonClass
              )}
              data-testid={`button-upload-${type}`}
            >
              {config.buttonText}
            </button>
            <p className="text-xs text-muted-foreground mt-4">PNG, JPG up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
