// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

/*
  Ten plik dynamicznie importuje najpierw ./App.intense, a gdy go nie ma,
  próbuje ./App. Dzięki temu nie trzeba ręcznie zmieniać importu.
  Działa w Vite/modern bundlerach (dynamic import).
*/

async function mountApp() {
  let AppModule = null;

  // próbujemy najpierw App.intense (tak jak masz teraz), potem ./App
  try {
    AppModule = await import("./App.intense");
  } catch (e1) {
    try {
      AppModule = await import("./App");
    } catch (e2) {
      console.error("Nie udało się zaimportować ./App.intense ani ./App:", e1, e2);
      // pokaż prosty komunikat w DOM zamiast rzucać
      const el = document.getElementById("root");
      if (el) el.innerHTML = "<div style='padding:20px;color:#900;background:#fee;border-radius:8px'>Błąd: nie znaleziono pliku App.intense ani App. Sprawdź pliki w src/.</div>";
      return;
    }
  }

  const App = AppModule?.default ?? AppModule;

  // jeśli to Telegram WebApp, zainicjalizuj (bez błędów, jeśli nie ma)
  try {
    if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.ready === "function") {
      window.Telegram.WebApp.ready();
    }
  } catch (e) {
    // ignore
  }

  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("Brak elementu #root w index.html");
    return;
  }

  const root = createRoot(rootEl);
  root.render(<App />);
}

// Uruchamiamy mount
mountApp();