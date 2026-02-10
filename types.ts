
export interface VisualizationSource {
  title: string;
  description: string;
  type: 'chart' | 'photo' | 'diagram' | 'map';
  uri?: string;
}

export interface SearchResult {
  summary: string;
  visualizations: VisualizationSource[];
  groundingLinks: { title: string; uri: string }[];
}

export interface GeneratedImages {
  directUrl: string;
  conglomerateUrl: string;
  directPrompt: string;
  conglomeratePrompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
