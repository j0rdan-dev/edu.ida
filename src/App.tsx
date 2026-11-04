import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteMetadata from "@/components/RouteMetadata";
import GlobalCharacterBuddy from "@/components/GlobalCharacterBuddy";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { CharacterProvider } from "@/context/CharacterContext";
import { BuddyProvider } from "@/context/BuddyContext";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";
import { lazy, Suspense } from "react";
import { EARTH_GAME_PATH } from "@/data/earthExpedition";

const EarthExpedition = lazy(() => import("./pages/EarthExpedition"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CharacterProvider>
      <BuddyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <GoogleAnalytics />
            <RouteMetadata />
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/grade/:gradeId/textbooks" element={<Index />} />
                  <Route path="/grade/:gradeId/*" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path={EARTH_GAME_PATH} element={<Suspense fallback={<div role="status" className="flex min-h-[60vh] items-center justify-center text-primary">Експедицијата се подготвува...</div>}><EarthExpedition /></Suspense>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
            <GlobalCharacterBuddy />
          </BrowserRouter>
        </TooltipProvider>
      </BuddyProvider>
    </CharacterProvider>
  </QueryClientProvider>
);

export default App;
