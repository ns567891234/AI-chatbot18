import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Globe } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import { ThemeToggle } from './components/ThemeToggle';
import { ISSTrackerWidget } from './components/ISSTrackerWidget';
import { NewsWidget } from './components/NewsWidget';
import { Chatbot } from './components/Chatbot';

function App() {
  const { 
    issData, refreshISS, 
    newsData, newsCategory, isNewsLoading, newsError, loadNews 
  } = useDashboardData();

  const handleISSRefresh = async () => {
    try {
      await refreshISS();
      toast.success("ISS Location updated!");
    } catch (error) {
      toast.error("Failed to update ISS location.");
    }
  };

  const handleNewsRefresh = async (category) => {
    try {
      await loadNews(category);
      toast.success("News updated!");
    } catch (error) {
      toast.error("Failed to update news.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl md:text-2xl">
            <Globe className="animate-pulse" />
            <span>Orbit & Insights</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex flex-col gap-8">
        
        <section>
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time ISS tracking and latest global news.</p>
          </div>
          
          <ISSTrackerWidget 
            issData={issData} 
            onRefresh={handleISSRefresh} 
          />
        </section>

        <section>
          <NewsWidget 
            newsData={newsData}
            currentCategory={newsCategory}
            onCategoryChange={loadNews}
            isLoading={isNewsLoading}
            error={newsError}
            onRefresh={handleNewsRefresh}
          />
        </section>

      </main>

      <Chatbot issData={issData} newsData={newsData} />
      
    </div>
  );
}

export default App;
