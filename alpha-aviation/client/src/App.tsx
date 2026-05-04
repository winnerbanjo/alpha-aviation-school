import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { RoutesConfig } from "./routes";
import { ScrollToTop } from "./components/ScrollToTop";
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
      <RoutesConfig />
    </BrowserRouter>
  );
}

export default App;
