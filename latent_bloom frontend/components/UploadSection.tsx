import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Camera } from 'lucide-react';

interface UploadSectionProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix if present for API, but keep it for display. 
      // The Service expects full base64 for display, but might need stripping for API.
      // Actually, genai SDK usually handles base64 string directly if stripped of header, 
      // but let's pass the full string and let the parent/service handle stripping if needed.
      // For the service provided in this answer, we need to strip the prefix for the API call.
      // However, we pass the full string to parent for display purposes.
      onImageSelected(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-nepal-dark mb-4 font-serif">
          Discover Your Crop's Journey
        </h2>
        <p className="text-lg text-nepal-brown/80 max-w-2xl mx-auto">
          Upload a photo of your crop to instantly generate a lifecycle guide tailored for Nepal's climate.
        </p>
      </div>

      <div 
        className={`relative group rounded-3xl border-4 border-dashed transition-all duration-300 ease-in-out bg-white/50 backdrop-blur-sm
          ${dragActive ? 'border-nepal-green bg-nepal-green/5 scale-[1.02]' : 'border-nepal-gold/40 hover:border-nepal-green/60'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-10 md:p-16 flex flex-col items-center justify-center min-h-[400px]">
          <input 
            type="file" 
            id="image-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleChange}
          />
          
          <div className="bg-nepal-green/10 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud size={64} className="text-nepal-green" />
          </div>
          
          <h3 className="text-2xl font-bold text-nepal-dark mb-2">
            Drag & Drop or Click to Upload
          </h3>
          <p className="text-nepal-brown mb-8 text-center max-w-md">
            Supports JPEG, PNG. Take a clear photo of the leaves or fruit for best results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <label 
              htmlFor="image-upload" 
              className="flex-1 flex items-center justify-center gap-2 bg-nepal-green hover:bg-nepal-greenLight text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
            >
              <ImageIcon size={24} />
              Browse Files
            </label>
            
            {/* Camera trigger only works on mobile devices usually, but standard input capture works */}
             <label 
              htmlFor="image-upload" 
              className="flex-1 flex items-center justify-center gap-2 bg-nepal-gold hover:bg-yellow-500 text-nepal-dark px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
            >
               <Camera size={24} />
              Take Photo
            </label>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-nepal-cream/80 flex flex-col items-center justify-center rounded-3xl z-10 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-nepal-green border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-nepal-dark animate-pulse">Analyzing your crop...</p>
            <p className="text-sm text-nepal-brown mt-2">Connecting to agricultural database</p>
          </div>
        )}
      </div>
    </div>
  );
};