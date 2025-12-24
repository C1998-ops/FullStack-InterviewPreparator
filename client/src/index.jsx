import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../styles/style.css";
import { AppProvider } from "./context/AppContext";

const root = ReactDOM.createRoot(document.getElementById("main-app"));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);