import React, { useRef } from 'react';
import { Upload, FolderInput } from 'lucide-react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      onFilesSelected(validFiles);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
        ${disabled ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-green-400 bg-green-50 hover:bg-green-100 hover:border-green-600'}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        // @ts-ignore - webkitdirectory is not in standard React definitions
        webkitdirectory=""
        directory=""
      />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="bg-white p-3 rounded-full shadow-sm">
          <Upload className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Select Input Folder</h3>
          <p className="text-sm text-gray-500 mt-1">
            Click to select a folder containing your crop images.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FolderInput className="w-4 h-4" />
          <span>Batch processes entire folder</span>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;