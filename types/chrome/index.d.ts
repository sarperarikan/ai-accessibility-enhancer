/// <reference types="chrome"/>

declare namespace chrome {
  export namespace storage {
    export interface LocalStorageItems {
      geminiApiKey?: string;
      aiProvider?: 'gemini' | 'gemini-2.5' | 'ollama';
      ollamaUrl?: string;
      ollamaModel?: string;
    }

    export interface StorageArea {
      get(
        keys: string | string[] | LocalStorageItems | null,
        callback: (items: LocalStorageItems) => void
      ): void;
      set(items: LocalStorageItems, callback?: () => void): void;
    }
  }

  export namespace runtime {
    export interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }

    export interface Message {
      type: string;
      analysisResult?: any;
      error?: string;
      suggestion?: string;
      url?: string;
      results?: any;
    }
  }
}
