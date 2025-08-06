import { LangactProvider } from "./langact/LangactContext";
import { TodoList } from "./components/TodoList";
import { CommandBar } from "./components/CommandBar";

function App() {
    return (
        <LangactProvider>
            <div className="app">
                <div className="app-header">
                    <div className="app-icon">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <div className="app-title">
                        <h1>Langact</h1>
                        <p>AI-powered action registry</p>
                    </div>
                </div>

                <div className="app-content">
                    <CommandBar />
                    <div className="app-main">
                        <TodoList />
                    </div>
                </div>
            </div>
        </LangactProvider>
    );
}

export default App;
