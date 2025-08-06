// src/components/CommandBar.tsx
import React, { useState, useContext } from "react";
import { LangactContext } from "../langact/LangactContext";
import type { AiAction } from "../langact/types";

export const CommandBar = () => {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const context = useContext(LangactContext);

    const findAndExecuteAction = (command: string) => {
        if (!context || !command.trim()) return;

        const { actions } = context;
        let bestAction: AiAction | null = null;
        let maxScore = 0;
        const commandWords = command.toLowerCase().split(/\s+/);

        for (const action of actions.values()) {
            let currentScore = 0;
            const description = action.description.toLowerCase();

            for (const word of commandWords) {
                if (description.includes(word)) {
                    currentScore++;
                }
            }

            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestAction = action;
            }
        }

        if (bestAction) {
            setStatus(`Executing: "${bestAction.description}"`);
            bestAction.handler();
            setQuery("");
        } else {
            setStatus(`Sorry, I don't know how to do that.`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        findAndExecuteAction(query);
    };

    return (
        <div className="command-bar">
            <div className="search-container">
                <div className="search-icon">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="m21 21-4.35-4.35"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for actions..."
                        aria-label="AI Command Input"
                        className="search-input"
                    />
                </form>
                {query && (
                    <div className="search-hint">
                        <kbd>↵</kbd> to execute
                    </div>
                )}
            </div>

            {status && (
                <div className="status-message">
                    <div className="status-icon">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    {status}
                </div>
            )}

            <div className="actions-panel">
                <div className="actions-header">
                    <span>Available Actions</span>
                    <span className="actions-count">
                        {context?.actions.size || 0}
                    </span>
                </div>
                <div className="actions-list">
                    {context &&
                        Array.from(context.actions.values()).map((action) => (
                            <div key={action.id} className="action-item">
                                <div className="action-content">
                                    <div className="action-id">{action.id}</div>
                                    <div className="action-description">
                                        {action.description}
                                    </div>
                                </div>
                                <div className="action-shortcut">
                                    <kbd>⌘</kbd>
                                    <kbd>K</kbd>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};
