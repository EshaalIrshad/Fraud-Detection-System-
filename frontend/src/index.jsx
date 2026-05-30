import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import App from "./App";

// Create query client with global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // don't refetch when tab regains focus
      retry: 2, // retry failed requests twice
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    {/* DevTools — shows query states in development */}
    {/* Appears as a small icon bottom-left of screen */}
    <ReactQueryDevtools initialIsOpen={false} />
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      //global styles
      duration={4000}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        borderRadius: "10px",
        padding: "12px 16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        maxWidth: "400px",
      }}
      //success style
      success={{
        duration: 3000,
        style: {
          background: "#f0fdf4",
          color: "#16a34a",
          border: "1px solid #bbf7do",
        },
        iconTheme: {
          primary: "#16a34a",
          secondary: "#f0fdf4",
        },
      }}
      //error style
      error={{
        duration: 5000,
        style: {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        },
        iconTheme: {
          primary: "#dc2626",
          secondary: "#fef2f2",
        },
      }}
      //loading style
      loading={{
        style: {
          background: "#eff6ff",
          color: "#1a56db",
          border: "1px solid #bfdbfe",
        },
        iconTheme: {
          primary: "#1a56db",
          secondary: "#eff6ff",
        },
      }}
    />
  </QueryClientProvider>,
);
