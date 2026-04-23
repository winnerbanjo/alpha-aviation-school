import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
