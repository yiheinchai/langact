// src/langact/types.ts
export interface AiAction {
    id: string;
    description: string;
    handler: () => void;
}

export interface LangactContextType {
    actions: Map<string, AiAction>;
    registerAction: (action: AiAction) => void;
    unregisterAction: (id: string) => void;
}
