import React, { useState, useCallback } from 'react';
import { Sprout, RotateCcw, FolderDown } from 'lucide-react';
import JSZip from 'jszip';
import UploadArea from './components/UploadArea';
import StageCard from './components/StageCard';
import { CropStage, ProcessingStatus } from './types';
import { analyzeCropImage, generateAudioNarration } from './services/geminiService';

function App() {
  const [stages, setStages] = useState<CropStage[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    const newStages: CropStage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: ProcessingStatus.IDLE
    }));
    // Sort by name to ensure sequential processing order from folder
    newStages.sort((a, b) => a.file.name.localeCompare(b.file.name));
    setStages(prev => [...prev, ...newStages]);
  };

  const processQueue = useCallback(async () => {
    if (stages.length === 0) return;
    setIsProcessingQueue(true);

    const queue = [...stages];

    for (let i = 0; i < queue.length; i++) {
      const stage = queue[i];

      if (stage.status === ProcessingStatus.COMPLETED) continue;

      try {
        setStages(prev => prev.map(s => s.id === stage.id ? { ...s, status: ProcessingStatus.ANALYZING } : s));
        
        const analysis = await analyzeCropImage(stage.file);

        setStages(prev => prev.map(s => s.id === stage.id ? {
          ...s,
          result: analysis,
          status: ProcessingStatus.SYNTHESIZING
        } : s));

        const textToRead = `${analysis.caption}. ${analysis.advice}`;
        const audioBlob = await generateAudioNarration(textToRead);
        const audioUrl = URL.createObjectURL(audioBlob);

        setStages(prev => prev.map(s => s.id === stage.id ? {
          ...s,
          audioUrl,
          audioBlob,
          status: ProcessingStatus.COMPLETED
        } : s));

      } catch (error: any) {
        console.error("Processing error for stage", stage.id, error);
        setStages(prev => prev.map(s => s.id === stage.id ? {
          ...s,
          status: ProcessingStatus.ERROR,
          error: error.message || "Unknown error occurred"
        } : s));
      }
    }

    setIsProcessingQueue(false);
  }, [stages]);

  const handleDownloadAll = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const textFolder = zip.folder("text_output");
      const audioFolder = zip.folder("audio_output");

      stages.forEach((stage, index) => {
        if (stage.status === ProcessingStatus.COMPLETED && stage.result && stage.audioBlob) {
          const baseName = `stage_${(index + 1).toString().padStart(2, '0')}`;
          
          const textContent = `Stage: ${stage.result.caption}\n\nAdvice:\n${stage.result.advice}`;
          textFolder?.file(`${baseName}.txt`, textContent);
          audioFolder?.file(`${baseName}.wav`, stage.audioBlob);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Latent_Bloom_Output.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to zip files", e);
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    stages.forEach(s => {
      URL.revokeObjectURL(s.previewUrl);
      if (s.audioUrl) URL.revokeObjectURL(s.audioUrl);
    });
    setStages([]);
    setIsProcessingQueue(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <Sprout className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Latent Bloom</h1>
              <p className="text-xs text-gray-500 font-medium">Nepali Agri Assistant</p>
            </div>
          </div>
          {stages.length > 0 && (
            <button
              onClick={handleReset}
              disabled={isProcessingQueue}
              className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
              title="Reset All"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {stages.length === 0 && (
          <div className="mb-8 text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Select Images Folder</h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Select your <code>images</code> folder. The system will generate Nepali advice (~15s audio) and create a downloadable package with <code>audio_output</code> and <code>text_output</code> folders.
            </p>
          </div>
        )}

        <div className="mb-8">
          <UploadArea onFilesSelected={handleFilesSelected} disabled={isProcessingQueue} />
        </div>

        {stages.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700">
              Processing Queue <span className="text-gray-400 font-normal">({stages.length})</span>
            </h2>
            <div className="flex gap-2">
               {/* Process Button */}
              <button
                onClick={processQueue}
                disabled={isProcessingQueue || stages.every(s => s.status === ProcessingStatus.COMPLETED)}
                className={`
                  px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg
                  transition-all transform active:scale-95
                  ${isProcessingQueue || stages.every(s => s.status === ProcessingStatus.COMPLETED)
                    ? 'bg-gray-300 shadow-none cursor-not-allowed text-gray-500'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'}
                `}
              >
                {isProcessingQueue ? 'Processing...' : 'Start Batch Process'}
              </button>

              {/* Download All Button */}
              {stages.some(s => s.status === ProcessingStatus.COMPLETED) && (
                <button
                  onClick={handleDownloadAll}
                  disabled={isZipping || isProcessingQueue}
                  className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FolderDown className="w-5 h-5" />
                  {isZipping ? 'Zipping...' : 'Download Output'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {stages.map((stage, index) => (
            <StageCard key={stage.id} stage={stage} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;