import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import Resources from "@/pages/Resources";

/**
 * Static entry point for the public GitHub Pages build.
 *
 * The main Base44 app (src/App.jsx) needs a backend for auth and entities,
 * which does not exist on GitHub Pages. This root renders only the fully
 * static resource library, with no SDK, auth gate or data fetching.
 *
 * HashRouter is used deliberately: GitHub Pages has no SPA rewrite, so a
 * path-based deep link would 404. Hash routing keeps every URL resolvable
 * from the single index.html.
 */
export default function StandaloneApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Resources />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
