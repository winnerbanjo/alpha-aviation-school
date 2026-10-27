import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/toast";

// index.html carries site-wide meta tags for link-preview bots that do not run JavaScript.
// Drop them before the app renders each page's own, so no page ends up with two descriptions
// or a canonical pointing at the homepage.
document.head.querySelectorAll("[data-fallback]").forEach((el) => el.remove());

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
