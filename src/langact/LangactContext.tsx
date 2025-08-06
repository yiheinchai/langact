// src/langact/LangactContext.tsx
import React, { createContext, useState, useCallback, useMemo } from "react";
import type { AiAction, LangactContextType } from "./types";

export const LangactContext = createContext<LangactContextType | undefined>(
    undefined
);

export const LangactProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [actions, setActions] = useState(new Map<string, AiAction>());

    const registerAction = useCallback((action: AiAction) => {
        setActions((prevActions) =>
            new Map(prevActions).set(action.id, action)
        );
    }, []);

    const unregisterAction = useCallback((id: string) => {
        setActions((prevActions) => {
            const newActions = new Map(prevActions);
            newActions.delete(id);
            return newActions;
        });
    }, []);

    const value = useMemo(
        () => ({
            actions,
            registerAction,
            unregisterAction,
        }),
        [actions, registerAction, unregisterAction]
    );

    return (
        <LangactContext.Provider value={value}>
            {children}
        </LangactContext.Provider>
    );
};
