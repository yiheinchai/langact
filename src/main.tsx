import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css"; // We'll put all our styles here

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
