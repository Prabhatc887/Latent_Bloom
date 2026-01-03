export enum StageType {
  Sowing = 'Sowing',
  Vegetative = 'Vegetative',
  Flowering = 'Flowering',
  Fruiting = 'Fruiting',
  Harvest = 'Harvest'
}

export interface Advice {
  water: string;
  fertilizer: string;
  pests: string;
  general: string;
}

export interface LifecycleStage {
  id: number;
  name: string;
  duration: string;
  description: string;
  advice: Advice;
  imageUrl?: string; // Optional generated image URL
}

export interface CropData {
  cropName: string;
  scientificName?: string;
  stages: LifecycleStage[];
}

export interface AppState {
  hasKey: boolean;
  isLoading: boolean;
  error: string | null;
  cropData: CropData | null;
  uploadedImage: string | null;
}