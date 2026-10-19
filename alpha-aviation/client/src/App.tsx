import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { RoutesConfig } from "./routes";
import { ScrollToTop } from "./components/ScrollToTop";
import { RevealObserver } from "./components/motion/RevealObserver";
import api from "./api";

function App() {
  useEffect(() => {
    const controller = new AbortController();
    api.get("/health", { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <RevealObserver />
      <RoutesConfig />
    </BrowserRouter>
  );
}

export default App;
