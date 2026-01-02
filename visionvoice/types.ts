export enum AppState {
  IDLE = 'IDLE',
  ANALYZING_IMAGE = 'ANALYZING_IMAGE',
  GENERATING_SPEECH = 'GENERATING_SPEECH',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}

export interface ImageFile {
  data: string; // Base64 string without prefix for API, or full for display
  mimeType: string;
  url: string; // Object URL for preview
}
