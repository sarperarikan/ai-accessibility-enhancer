// Popup component types and interfaces
// WCAG 2.2-AA uyumlu tip tanımları

export interface AlertConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface ElementAnalysis {
  elementType: string;
  elementId?: string;
  elementClass?: string;
  analysis: string;
  timestamp: string;
  suggestions: string[];
  htmlContent?: string; // Element HTML kodları için
  elementSelector?: string; // CSS selector
  wcagCriteria?: string[]; // İlgili WCAG kriterleri
  // Metadata özellikleri
  url?: string;
  domain?: string;
  wcagScore?: number;
  aiScore?: number;
  issuesFound?: number;
  id?: string;
  wcagResult?: string;
}

export type AIProvider = 'gemini' | 'ollama';
export type ActiveTab = 'elements' | 'gemini' | 'settings' | 'history' | 'shortcuts';

export interface PopupState {
  activeTab: ActiveTab;
  error: string | null;
  elementAnalyses: ElementAnalysis[];
  alertState: AlertConfig | null;
  isExporting: boolean;
  geminiApiKey: string;
  geminiModel: string;
  aiProvider: AIProvider;
}


export interface ExportOptions {
  fileName: string;
  timestamp: string;
  includeMetadata: boolean;
}