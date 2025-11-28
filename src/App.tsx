import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import TaskManager from "@/pages/TaskManager";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TaskManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors closeButton theme="system" />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
