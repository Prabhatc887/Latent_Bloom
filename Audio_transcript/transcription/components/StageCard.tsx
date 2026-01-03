import React from 'react';
import { CropStage, ProcessingStatus } from '../types';
import { Loader2, Play, Download, CheckCircle, FileText, Music } from 'lucide-react';

interface StageCardProps {
  stage: CropStage;
  index: number;
}

const StageCard: React.FC<StageCardProps> = ({ stage, index }) => {
  const isProcessing = stage.status === ProcessingStatus.ANALYZING || stage.status === ProcessingStatus.SYNTHESIZING;
  const isComplete = stage.status === ProcessingStatus.COMPLETED;
  const isError = stage.status === ProcessingStatus.ERROR;

  const handleDownloadText = () => {
    if (!stage.result) return;
    const content = `Stage: ${stage.result.caption}\n\nAdvice:\n${stage.result.advice}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stage_${(index + 1).toString().padStart(2, '0')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = () => {
    if (!stage.audioUrl) return;
    const a = document.createElement('a');
    a.href = stage.audioUrl;
    a.download = `stage_${(index + 1).toString().padStart(2, '0')}.wav`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row animate-fade-in">
      {/* Image Section */}
      <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-100">
        <img
          src={stage.previewUrl}
          alt={`Stage ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          Stage {index + 1}
        </div>
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm p-4 text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
            <span className="text-xs font-medium text-green-700">
              {stage.status === ProcessingStatus.ANALYZING ? "Analyzing Image..." : "Generating Audio..."}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800 text-lg">
              {stage.file.name}
            </h3>
            {isComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
            {isError && <span className="text-red-500 text-sm font-medium">Processing Failed</span>}
          </div>

          {stage.result ? (
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Identified Stage</span>
                <p className="text-gray-900 font-medium">{stage.result.caption}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Farming Advice</span>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">
                  {stage.result.advice}
                </p>
              </div>
            </div>
          ) : (
            !isError && <p className="text-gray-400 text-sm italic">Waiting to process...</p>
          )}

          {stage.error && (
            <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              Error: {stage.error}
            </div>
          )}
        </div>

        {/* Action Bar */}
        {isComplete && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-3 items-center">
             {/* Audio Player */}
             {stage.audioUrl && (
              <div className="flex-1 min-w-[200px] bg-green-50 rounded-full px-3 py-1.5 flex items-center gap-2">
                <Music className="w-4 h-4 text-green-700" />
                <audio controls src={stage.audioUrl} className="w-full h-8" />
              </div>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleDownloadText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Download Text"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Text</span>
              </button>
              <button
                onClick={handleDownloadAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                title="Download Audio"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Audio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageCard;