import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  );
} else {
  document.body.innerHTML = '<h1>ERROR: Root element not found</h1>';
}
