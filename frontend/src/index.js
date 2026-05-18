import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
  </QueryClientProvider>,
);
