// src/langact/useAiAction.ts
import { useContext, useEffect } from "react";
import { LangactContext } from "./LangactContext";
import type { AiAction } from "./types";

export const useAiAction = (action: AiAction) => {
    const context = useContext(LangactContext);

    if (!context) {
        throw new Error("useAiAction must be used within a LangactProvider");
    }

    const { registerAction, unregisterAction } = context;

    useEffect(() => {
        registerAction(action);
        return () => {
            unregisterAction(action.id);
        };
    }, [action, registerAction, unregisterAction]);

    return {
        props: {
            onClick: action.handler,
            "data-langact-id": action.id,
        },
    };
};
