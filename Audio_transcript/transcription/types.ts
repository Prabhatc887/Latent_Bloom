export enum ProcessingStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Text generation
  SYNTHESIZING = 'SYNTHESIZING', // Audio generation
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface AnalysisResult {
  caption: string;
  advice: string;
}

export interface CropStage {
  id: string;
  file: File;
  previewUrl: string;
  status: ProcessingStatus;
  result?: AnalysisResult;
  audioUrl?: string; // Blob URL for playback
  audioBlob?: Blob; // For download
  error?: string;
}

export interface WavHeaderOptions {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
}