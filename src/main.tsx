import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  document.body.innerHTML = '<h1>ERROR: Root element not found</h1>';
}
