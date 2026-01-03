import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadSection } from './components/UploadSection';
import { LifecyclePlayer } from './components/LifecyclePlayer';
import { AdvicePanel } from './components/AdvicePanel';
import { StageSidebar } from './components/StageSidebar';
import { CropData } from './types';
import { analyzeCropImage } from './services/geminiService';

const App: React.FC = () => {
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if API key is available in environment
    if (process.env.API_KEY) {
      setHasApiKey(true);
    }
  }, []);

  // Text-to-Speech Handler
  useEffect(() => {
    if (!cropData) return;

    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel(); // Stop previous
      const stage = cropData.stages[currentStageIndex];
      // Construct a natural sentence
      const text = `Stage ${stage.name}. ${stage.description}. Advice: ${stage.advice.general}. Watering: ${stage.advice.water}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.rate = 0.9; // Slightly slower for clarity
      synth.speak(utterance);
    } else {
      synth.cancel();
    }

    return () => synth.cancel();
  }, [isSpeaking, currentStageIndex, cropData]);

  const handleImageSelected = async (base64: string) => {
    setUploadedImage(base64);
    setIsLoading(true);
    
    // Strip header for API if present
    const base64Data = base64.split(',')[1] || base64;

    try {
      if (!hasApiKey) {
        // Fallback demo data if no key (for preview purposes if env is missing)
        // In a real scenario, we'd error out or ask for key. 
        // But for this robust mockup, let's try to fetch real data, else alert.
         alert("API Key missing. Ensure process.env.API_KEY is set.");
         setIsLoading(false);
         return;
      }

      const data = await analyzeCropImage(base64Data);
      setCropData(data);
      setCurrentStageIndex(0);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze crop. Please try a clearer image.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setCropData(null);
    setUploadedImage(null);
    setIsLoading(false);
    setCurrentStageIndex(0);
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onReset={resetApp} />

      <main className="flex-grow container mx-auto px-4 py-8">
        {!cropData ? (
          <UploadSection onImageSelected={handleImageSelected} isLoading={isLoading} />
        ) : (
          <div className="animate-fadeIn space-y-8">
            {/* Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-nepal-brown/20 pb-4">
              <div>
                 <h2 className="text-3xl font-serif font-bold text-nepal-dark">{cropData.cropName}</h2>
                 {cropData.scientificName && <p className="text-nepal-brown italic text-lg">{cropData.scientificName}</p>}
              </div>
              <div className="mt-4 md:mt-0">
                <span className="bg-nepal-green/10 text-nepal-green px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide">
                  Nepal Climate Adaptive
                </span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Sidebar - Stage Navigation (Desktop: 2 cols) */}
              <div className="lg:col-span-3 hidden lg:block h-[500px]">
                <StageSidebar 
                  stages={cropData.stages} 
                  currentStageIndex={currentStageIndex} 
                  onStageSelect={(index) => {
                    setCurrentStageIndex(index);
                    setIsSpeaking(false);
                  }} 
                />
              </div>

              {/* Center - Animation/Player (Desktop: 6 cols) */}
              <div className="lg:col-span-6 w-full">
                <LifecyclePlayer 
                  stages={cropData.stages} 
                  currentStageIndex={currentStageIndex} 
                  onStageChange={(index) => {
                    setCurrentStageIndex(index);
                    setIsSpeaking(false);
                  }}
                  baseImage={uploadedImage}
                />
              </div>

              {/* Right - Advice Panel (Desktop: 3 cols) */}
              <div className="lg:col-span-3 h-[500px]">
                <AdvicePanel 
                  advice={cropData.stages[currentStageIndex].advice} 
                  stageName={cropData.stages[currentStageIndex].name}
                  isSpeaking={isSpeaking}
                  onToggleSpeech={() => setIsSpeaking(!isSpeaking)}
                />
              </div>

              {/* Mobile Sidebar (Visible only on small screens below player) */}
              <div className="lg:hidden col-span-1">
                 <StageSidebar 
                  stages={cropData.stages} 
                  currentStageIndex={currentStageIndex} 
                  onStageSelect={(index) => {
                    setCurrentStageIndex(index);
                    setIsSpeaking(false);
                  }} 
                />
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;