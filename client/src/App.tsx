import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Roles from "@/pages/roles";
import IncentivePlan from "@/pages/incentive-plan";
import DealDetails from "@/pages/deal-details";

function Router() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/roles" component={Roles} />
            <Route path="/incentive-plan" component={IncentivePlan} />
            <Route path="/deals/:id">
              {params => <DealDetails params={params} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Sales Team Role Management
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Help & Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  );
}

export default App;
