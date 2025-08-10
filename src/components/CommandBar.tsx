// src/components/CommandBar.tsx
import React, { useState, useContext } from "react";
import { LangactActionContext } from "../langact/Langact";

export const CommandBar: React.FC = () => {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const context = useContext(LangactActionContext);

    const sendQueryToLLM = async (query: string) => {
        if (!query.trim() || !context) return;
        setLoading(true);
        setStatus("Thinking...");
        try {
            const apiKey =
                "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";
            const siteUrl = window.location.origin;
            const siteTitle = document.title;
            const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "HTTP-Referer": siteUrl,
                        "X-Title": siteTitle,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-oss-20b:free",
                        messages: [
                            {
                                role: "system",
                                content:
                                    'You are an AI assistant for a React app. You are given a semantic structure of the UI and a map of available actions. When the user asks for something, respond with a JSON object containing \'actionId\' and \'parameters\' (array). If no action is appropriate, respond with {"actionId": "none"}. Example: {"actionId": "action_0", "parameters": ["hello world"]}',
                            },
                            {
                                role: "user",
                                content: JSON.stringify({
                                    query,
                                    semanticStructure:
                                        context.semanticStructure,
                                    llmActionMap: context.llmActionMap,
                                }),
                            },
                        ],
                    }),
                }
            );
            if (!response.ok) {
                setStatus("LLM API error: " + response.statusText);
                setLoading(false);
                return;
            }
            const data = await response.json();
            // Try to extract the action id and parameters from the LLM's response
            let actionId = "";
            let parameters: any[] = [];

            // Parse JSON response from LLM
            if (
                data.choices &&
                data.choices[0] &&
                data.choices[0].message &&
                data.choices[0].message.content
            ) {
                try {
                    const llmResponse = JSON.parse(
                        data.choices[0].message.content.trim()
                    );
                    actionId = llmResponse.actionId || "";
                    parameters = llmResponse.parameters || [];
                } catch (parseError) {
                    // Fallback: try to extract just action id if JSON parsing fails
                    actionId = data.choices[0].message.content
                        .trim()
                        .replace(/\"/g, "");
                }
            }
            setQuery("");

            console.log("LLM Response:", {
                actionId,
                parameters,
            });

            if (
                actionId &&
                actionId !== "none" &&
                context.actionRegistry[actionId]
            ) {
                setStatus(
                    `Executing action: ${actionId} with parameters: ${JSON.stringify(
                        parameters
                    )}`
                );
                // Execute the action with parameters
                try {
                    context.actionRegistry[actionId].execute(...parameters);
                } catch (err) {
                    setStatus(`Action execution error: ${String(err)}`);
                    setLoading(false);
                    return;
                }
            } else if (actionId === "none") {
                setStatus("No suitable action found for your request.");
            } else {
                setStatus("LLM did not return a valid action id.");
            }
        } catch (err) {
            setStatus("Error: " + String(err));
        }
        setLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendQueryToLLM(query);
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
                        placeholder={
                            loading
                                ? "Waiting for AI..."
                                : "Ask the AI anything..."
                        }
                        aria-label="AI Command Input"
                        className="search-input"
                        disabled={loading}
                    />
                </form>
                {query && !loading && (
                    <div className="search-hint">
                        <kbd>↵</kbd> to send
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
        </div>
    );
};
