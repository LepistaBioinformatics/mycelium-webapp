import "./index.css";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import state from "./states/store";
import React from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { NativeAuthProvider } from "@/contexts/NativeAuthContext";
import { BrowserRouter } from "react-router";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={state.store}>
      <PersistGate loading={null} persistor={state.persistor}>
        <ThemeProvider>
          <BrowserRouter>
            <NativeAuthProvider>
              <App />
            </NativeAuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  </React.StrictMode>
);
