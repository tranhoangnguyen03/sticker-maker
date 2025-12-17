import React, { useCallback } from 'react';
import { Upload, ImagePlus } from 'lucide-react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles: number;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected, maxFiles }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      // Filter for images
      const validFiles = filesArray.filter((f: File) => f.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  }, [onFilesSelected, maxFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const filesArray = Array.from(e.target.files).slice(0, maxFiles);
       const validFiles = filesArray.filter((f: File) => f.type.startsWith('image/'));
       if (validFiles.length > 0) {
         onFilesSelected(validFiles);
       }
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto mt-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label 
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className="p-4 bg-brand-50 dark:bg-slate-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
             <Upload className="w-8 h-8 text-brand-500 dark:text-brand-400" />
          </div>
          <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-300">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            SVG, PNG, JPG or GIF (Max {maxFiles} files)
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple={maxFiles > 1}
          accept="image/*"
          onChange={handleFileInput}
        />
      </label>
      
      {maxFiles > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
           <ImagePlus className="w-4 h-4" />
           <span>Batch mode active: Upload up to {maxFiles} images at once</span>
        </div>
      )}
    </div>
  );
};

export default UploadArea;