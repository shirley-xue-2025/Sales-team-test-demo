import { createRoot } from "react-dom/client";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import App from "./App";
import "./index.css";
import * as stylingReset from "sonner";

// Extend Window interface to include our custom dropdown property
declare global {
  interface Window {
    __openDropdownId: string | null;
  }
}

// Initialize the global variable
window.__openDropdownId = null;

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <title>Sales Team Role Management</title>
      <meta name="description" content="Manage sales team roles, permissions, and team assignments." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      <link rel="icon" type="image/svg+xml" href="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/user-group.svg" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <App />
  </HelmetProvider>
);
