import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import LoginPage from "@/pages/login-page";
import React from "react";

function Router() {
  // Simple authentication check - replace with a more robust solution in a real app
  const isAuthenticated = () => {
    // For this example, we'll consider the user logged in if they have successfully navigated from the login page
    // In a real app, this would check a token, local storage, or session.
    return localStorage.getItem("isAuthenticated") === "true";
  };

  return (
    <WouterRouter>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard">
          {isAuthenticated() ? <Dashboard /> : <LoginPage />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
