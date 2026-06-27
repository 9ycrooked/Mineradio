import React from "react";
import { createRoot } from "react-dom/client";
import { createVisualEngine } from "@mineradio/visual-engine";
import { HealthResponseSchema } from "@mineradio/shared";
import "./styles.css";

const healthPreview = HealthResponseSchema.parse({
  ok: true,
  appVersion: "0.0.0-dev",
  apiVersion: "0.1.0",
  schemaVersion: "0.1.0",
  providers: []
});

function App() {
  const visualEngine = createVisualEngine();
  visualEngine.update({ preset: "placeholder", playing: false });
  visualEngine.dispose();

  return (
    <main className="shell">
      <section className="status-panel">
        <p className="eyebrow">Mineradio Tauri Rewrite</p>
        <h1>Tauri Rewrite Shell</h1>
        <dl>
          <div>
            <dt>Sidecar</dt>
            <dd>not connected</dd>
          </div>
          <div>
            <dt>Visual Engine</dt>
            <dd>placeholder</dd>
          </div>
          <div>
            <dt>Schema</dt>
            <dd>{healthPreview.schemaVersion}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
