import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';
import { LifecycleStage } from '../types';

interface LifecyclePlayerProps {
  stages: LifecycleStage[];
  currentStageIndex: number;
  onStageChange: (index: number) => void;
  baseImage: string | null;
}

export const LifecyclePlayer: React.FC<LifecyclePlayerProps> = ({ stages, currentStageIndex, onStageChange, baseImage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        onStageChange((prev) => {
          if (prev < stages.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 4000); // 4 seconds per stage
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, stages.length, onStageChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handlePrev = () => {
    onStageChange(Math.max(0, currentStageIndex - 1));
    setIsPlaying(false);
  };
  
  const handleNext = () => {
    onStageChange(Math.min(stages.length - 1, currentStageIndex + 1));
    setIsPlaying(false);
  };

  const currentStage = stages[currentStageIndex];
  // Calculate progress percentage based on stage index
  const progress = ((currentStageIndex) / (stages.length - 1)) * 100;

  return (
    <div className="bg-nepal-dark rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
      {/* Visual Display Area */}
      <div className="relative flex-1 bg-black/40 overflow-hidden group">
        {/* Background - using uploaded image as base with overlay effects to simulate time passing */}
        <div className="absolute inset-0 flex items-center justify-center">
            {baseImage ? (
                <img 
                    src={baseImage} 
                    alt="Crop Base" 
                    className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
                />
            ) : (
                <div className="w-full h-full bg-nepal-green/20" />
            )}
            
             {/* Overlay for Stages - In a real app, this could be generated images. 
                 Here we use color grading and icons to simulate growth stages visually */}
             <div className={`absolute inset-0 transition-colors duration-1000 mix-blend-overlay
                ${currentStageIndex === 0 ? 'bg-amber-900/60' : ''} // Sowing: Soil heavy
                ${currentStageIndex === 1 ? 'bg-green-600/40' : ''} // Vegetative: Green
                ${currentStageIndex === 2 ? 'bg-yellow-400/30' : ''} // Flowering: Bright
                ${currentStageIndex === 3 ? 'bg-orange-500/30' : ''} // Fruiting: Warm
                ${currentStageIndex === 4 ? 'bg-amber-700/50' : ''} // Harvest: Brown/Gold
             `}></div>
        </div>

        {/* Central Stage Info Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4 tracking-tight animate-fadeSlideUp">
                {currentStage.name}
            </h2>
            <div className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-full text-white/90 flex items-center gap-2 mb-6">
                <Clock size={16} />
                <span>Duration: {currentStage.duration}</span>
            </div>
            <p className="text-lg text-white max-w-lg drop-shadow-md leading-relaxed hidden md:block">
                {currentStage.description}
            </p>
        </div>
        
        {/* Play Overlay Button (appears on hover or pause) */}
        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full text-white animate-pulse">
                    <Play size={48} fill="currentColor" />
                </div>
            </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-white/5 backdrop-blur-md p-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-4">
          
          <button onClick={togglePlay} className="text-white hover:text-nepal-gold transition-colors p-2 rounded-full hover:bg-white/10">
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
          </button>

          <div className="flex-1">
             {/* Progress Bar */}
             <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono uppercase">
                <span>Timeline</span>
                <span>{Math.round(progress)}%</span>
             </div>
             <div className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer relative" onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const clickedProgress = x / rect.width;
                 const newIndex = Math.round(clickedProgress * (stages.length - 1));
                 onStageChange(newIndex);
             }}>
                <div 
                    className="h-full bg-gradient-to-r from-nepal-green to-nepal-gold transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Stage markers */}
                {stages.map((_, idx) => (
                    <div 
                        key={idx}
                        className={`absolute top-0 h-full w-0.5 bg-black/20`}
                        style={{ left: `${(idx / (stages.length - 1)) * 100}%` }}
                    />
                ))}
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={currentStageIndex === 0} className="text-gray-400 hover:text-white disabled:opacity-30">
                <SkipBack size={24} />
            </button>
            <span className="text-white font-mono text-sm w-12 text-center">
                {currentStageIndex + 1}/{stages.length}
            </span>
             <button onClick={handleNext} disabled={currentStageIndex === stages.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30">
                <SkipForward size={24} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};