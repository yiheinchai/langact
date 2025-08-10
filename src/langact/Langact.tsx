/**
 * Converts a React Fiber node into a simplified, pruned component tree object.
 * The output object contains only `name`, `props`, and an array of `children`.
 *
 * @param {object} fiberNode - The root of the React Fiber tree to process.
 * @returns {object | null} A simplified tree object, or null if the input is invalid.
 */
import React, { useEffect } from "react";
import type { ReactNode } from "react";

// Types for Fiber Node (partial, for our use)
type FiberNode = {
    elementType?: any;
    props?: Record<string, any>;
    memoizedProps?: Record<string, any>;
    pendingProps?: Record<string, any>;
    child?: FiberNode | null;
    sibling?: FiberNode | null;
};

type ComponentTree = {
    name: string;
    props: { [key: string]: any };
    children: ComponentTree[];
};

type SemanticStructure = {
    component: string;
    actions?: Array<{
        event: string;
        handler: string;
        path: string;
    }>;
    children?: SemanticStructure[];
    text?: string;
    className?: string;
    id?: string;
    type?: string;
    value?: any;
    placeholder?: string;
    href?: string;
    [key: string]: any;
};

type ActionRegistryEntry = {
    id: string;
    component: string;
    event: string;
    path: string;
    semanticId: string;
    identifyingProps: Record<string, any>;
    description: string;
    execute: (...args: any[]) => any;
    metadata: {
        functionName: string;
        toString: string;
    };
};

type ActionRegistry = Record<string, ActionRegistryEntry>;

type LLMActionMap = Record<
    string,
    {
        description: string;
        component: string;
        event: string;
        path: string;
        semanticId: string;
        identifyingProps: Record<string, any>;
        parameters: string[];
        signature: string;
    }
>;

interface LangactProps {
    children: React.ReactElement;
}

// Context types
interface LangactActionContextType {
    actionRegistry: ActionRegistry;
    llmActionMap: LLMActionMap;
    semanticStructure: SemanticStructure | null;
}

export const LangactActionContext = React.createContext<
    LangactActionContextType | undefined
>(undefined);

function fiberToComponentTree(
    fiberNode: FiberNode | null
): ComponentTree | null {
    // Base case: if the node is null, we've reached the end of a branch.
    if (!fiberNode) {
        return null;
    }

    // Helper to get a readable name from the fiber's 'elementType'.
    const getDisplayName = (node: FiberNode): string => {
        const { elementType } = node;
        if (typeof elementType === "string") {
            return elementType; // e.g., 'div'
        }
        if (typeof elementType === "function") {
            return elementType.displayName || elementType.name || "Component";
        }
        // For forwarded refs, memo, etc., the component is often in `type` or `render`.
        if (typeof elementType === "object" && elementType !== null) {
            const render = elementType.render || elementType.type;
            if (render) {
                return render.displayName || render.name || "ComplexComponent";
            }
        }
        return "Unknown";
    };

    // 1. Get the component's name and props.
    const name = getDisplayName(fiberNode);

    // Extract props more comprehensively, including functions
    const props: { [key: string]: any } = {};

    // Check multiple possible locations for props
    const propsSource =
        fiberNode.props ||
        fiberNode.memoizedProps ||
        fiberNode.pendingProps ||
        {};

    // Copy all props, including functions
    for (const key in propsSource) {
        if (propsSource.hasOwnProperty(key)) {
            const value = propsSource[key];

            // Include all prop types, including functions
            if (typeof value === "function") {
                // For functions, store metadata instead of the actual function
                (props as any)[key] = {
                    __type: "function",
                    __name: value.name || "anonymous",
                    __toString: value.toString(),
                };
            } else if (value !== null && typeof value === "object") {
                // For objects (including React elements), create a safe representation
                (props as any)[key] = {
                    __type: "object",
                    __constructor: value.constructor?.name || "Object",
                    __keys: Object.keys(value),
                };
            } else {
                // For primitives, store as-is
                (props as any)[key] = value;
            }
        }
    }

    // 2. Process all children by traversing the linked list (child -> sibling).
    // This creates the clean `children` array you requested, without a `sibling` property.
    const children = [];
    let currentChildNode = fiberNode.child;

    while (currentChildNode) {
        // Recursively convert the child fiber node.
        const childComponent = fiberToComponentTree(currentChildNode);
        if (childComponent) {
            children.push(childComponent);
        }
        // Move to the next child in the linked list.
        currentChildNode = currentChildNode.sibling;
    }

    // 3. Assemble and return the final JavaScript object for this node.
    return {
        name,
        props,
        children,
    };
}

/**
 * Converts a detailed component tree into a concise semantic representation for LLMs.
 * Focuses on actionable elements and their onClick handlers.
 *
 * @param {object} componentTree - The detailed component tree from fiberToComponentTree
 * @returns {object} A concise semantic structure
 */
function createSemanticStructure(
    componentTree: ComponentTree | null
): SemanticStructure | null {
    if (!componentTree) return null;

    const semantic: SemanticStructure = {
        component: componentTree.name,
        actions: [],
        children: [],
    };

    // Extract semantic information from props
    const props = componentTree.props || {};

    // Add text content if it's a text element or has meaningful text props
    if (props.children && typeof props.children === "string") {
        (semantic as any).text = props.children;
    }

    // Add class/styling info for context
    if (props.className) {
        (semantic as any).className = props.className;
    }

    // Extract actionable props (onClick, onSubmit, onChange, etc.)
    Object.keys(props).forEach((key) => {
        const prop = props[key];

        // Check for event handlers
        if (key.startsWith("on") && prop && prop.__type === "function") {
            (semantic.actions as Array<any>).push({
                event: key,
                handler: prop.__name || "anonymous",
                path: `props.${key}`,
            });
        }

        // Add other meaningful props (but keep it concise)
        if (["id", "type", "value", "placeholder", "href"].includes(key)) {
            (semantic as any)[key] = prop;
        }
    });

    // Process children recursively
    if (componentTree.children && componentTree.children.length > 0) {
        componentTree.children.forEach((child) => {
            const childSemantic = createSemanticStructure(child);
            if (childSemantic) {
                (semantic.children as Array<any>).push(childSemantic);
            }
        });
    }

    // Clean up empty arrays to keep it concise
    if (semantic.actions && semantic.actions.length === 0)
        delete semantic.actions;
    if (semantic.children && semantic.children.length === 0)
        delete semantic.children;

    return semantic;
}

/**
 * Creates a hashmap of all actionable functions from the fiber tree for LLM access
 * @param {object} fiberNode - The root fiber node
 * @returns {object} A hashmap with function IDs as keys and executable functions as values
 */
function createActionRegistry(fiberNode: FiberNode | null): ActionRegistry {
    const actionRegistry: ActionRegistry = {};
    let actionId = 0;
    const componentCounts: Record<string, number> = {};

    function traverseAndExtractActions(
        node: FiberNode | null,
        path: string[] = []
    ): void {
        if (!node) return;

        // Get the component name for context
        const getDisplayName = (fiberNode: FiberNode): string => {
            const { elementType } = fiberNode;
            if (typeof elementType === "string") {
                return elementType;
            }
            if (typeof elementType === "function") {
                return (
                    elementType.displayName || elementType.name || "Component"
                );
            }
            return "Unknown";
        };

        const componentName = getDisplayName(node);

        // Create unique identifier for repeated components
        const componentKey = path.join(">") + ">" + componentName;
        componentCounts[componentKey] =
            (componentCounts[componentKey] || 0) + 1;
        const instanceNumber = componentCounts[componentKey] - 1;

        // Enhanced path with instance info
        const instanceIdentifier =
            instanceNumber > 0
                ? `${componentName}[${instanceNumber}]`
                : componentName;
        const currentPath = [...path, instanceIdentifier];

        // Check all possible prop sources
        const propsSource =
            node.props || node.memoizedProps || node.pendingProps || {};

        // Extract identifying props for better differentiation
        const identifyingProps: Record<string, any> = {};
        ["id", "num", "index", "value", "name", "className"].forEach((prop) => {
            if (propsSource[prop] !== undefined) {
                identifyingProps[prop] = propsSource[prop];
            }
        });

        // Create a semantic identifier based on props
        let semanticId = "";
        if (identifyingProps.num !== undefined) {
            semanticId = `[num=${identifyingProps.num}]`;
        } else if (identifyingProps.index !== undefined) {
            semanticId = `[index=${identifyingProps.index}]`;
        } else if (identifyingProps.id) {
            semanticId = `[id=${identifyingProps.id}]`;
        } else if (identifyingProps.key) {
            semanticId = `[key=${identifyingProps.key}]`;
        } else if (instanceNumber > 0) {
            semanticId = `[instance=${instanceNumber}]`;
        }

        // Extract event handlers
        Object.keys(propsSource).forEach((propKey) => {
            const propValue = propsSource[propKey];

            if (propKey.startsWith("on") && typeof propValue === "function") {
                const functionId = `action_${actionId++}`;

                // Enhanced description with semantic information
                let description = `${propKey} handler on ${componentName}`;
                if (semanticId) {
                    description += ` ${semanticId}`;
                }
                description += ` at ${currentPath.join(" > ")}`;

                actionRegistry[functionId] = {
                    id: functionId,
                    component: componentName,
                    event: propKey,
                    path: currentPath.join(" > "),
                    semanticId: semanticId,
                    identifyingProps: identifyingProps,
                    description: description,
                    execute: propValue,
                    metadata: {
                        functionName: propValue.name || "anonymous",
                        toString: propValue.toString(),
                    },
                };
            }
        });

        // Traverse children
        let child = node.child;
        while (child) {
            traverseAndExtractActions(child, currentPath);
            child = child.sibling;
        }
    }

    traverseAndExtractActions(fiberNode);
    return actionRegistry;
}

/**
 * Creates a simplified action map for LLM consumption
 * @param {object} actionRegistry - The full action registry
 * @returns {object} Simplified action descriptions for LLM
 */
function createLLMActionMap(actionRegistry: ActionRegistry): LLMActionMap {
    const llmActionMap: LLMActionMap = {};
    Object.keys(actionRegistry).forEach((actionId) => {
        const action = actionRegistry[actionId];

        // Extract function parameters from toString
        const functionString = action.metadata.toString;
        const paramMatch = functionString.match(/\(([^)]*)\)/);
        const paramString = paramMatch ? paramMatch[1].trim() : "";
        const parameters = paramString
            ? paramString.split(",").map((p) => p.trim())
            : [];

        llmActionMap[actionId] = {
            description: action.description,
            component: action.component,
            event: action.event,
            path: action.path,
            semanticId: action.semanticId,
            identifyingProps: action.identifyingProps,
            parameters: parameters,
            signature: `${action.metadata.functionName}(${paramString})`,
        };
    });
    return llmActionMap;
}

export function Langact({ children }: LangactProps) {
    const [actionRegistry, setActionRegistry] = React.useState<ActionRegistry>(
        {}
    );
    const [llmActionMap, setLLMActionMap] = React.useState<LLMActionMap>({});
    const [semanticStructure, setSemanticStructure] =
        React.useState<SemanticStructure | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const updateTimeoutRef = React.useRef<number | undefined>(undefined);

    const updateActionMaps = React.useCallback(() => {
        // @ts-ignore
        const fiberRoot = (children as any)._owner?.child;
        if (!fiberRoot) {
            console.warn("No fiber root found for children");
            setActionRegistry({});
            setLLMActionMap({});
            setSemanticStructure(null);
            return;
        }
        // Create the component tree and semantic structure
        const componentTree = fiberToComponentTree(fiberRoot);
        const newSemanticStructure = createSemanticStructure(componentTree);
        setSemanticStructure(newSemanticStructure);
        // Create the action registry and LLM action map
        const newActionRegistry = createActionRegistry(fiberRoot);
        const newLLMActionMap = createLLMActionMap(newActionRegistry);
        setActionRegistry(newActionRegistry);
        setLLMActionMap(newLLMActionMap);
        // Optionally expose for debugging
        (window as any).reactActionRegistry = newActionRegistry;
        (window as any).reactLLMActionMap = newLLMActionMap;
        (window as any).reactSemanticStructure = newSemanticStructure;
    }, [children]);

    // Debounced update function to avoid too frequent re-analysis
    const debouncedUpdate = React.useCallback(() => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }
        updateTimeoutRef.current = setTimeout(updateActionMaps, 100); // 100ms debounce
    }, [updateActionMaps]);

    useEffect(() => {
        // Initial update
        updateActionMaps();
    }, [children, updateActionMaps]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Set up mutation observer to detect DOM changes
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            for (const mutation of mutations) {
                // Check for attribute changes that might affect functionality
                if (mutation.type === "attributes") {
                    const target = mutation.target as Element;
                    if (
                        target.tagName === "INPUT" ||
                        target.tagName === "BUTTON" ||
                        target.tagName === "SELECT"
                    ) {
                        shouldUpdate = true;
                        break;
                    }
                }
                // Check for childList changes (elements added/removed)
                else if (mutation.type === "childList") {
                    shouldUpdate = true;
                    break;
                }
            }

            if (shouldUpdate) {
                debouncedUpdate();
            }
        });

        observer.observe(containerRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
                "disabled",
                "value",
                "checked",
                "selected",
                "class",
                "data-*",
            ],
        });

        return () => {
            observer.disconnect();
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [debouncedUpdate]);

    // Provide the context to children
    return (
        <div ref={containerRef}>
            <LangactActionContext.Provider
                value={{ actionRegistry, llmActionMap, semanticStructure }}
            >
                {children}
            </LangactActionContext.Provider>
        </div>
    );
}
