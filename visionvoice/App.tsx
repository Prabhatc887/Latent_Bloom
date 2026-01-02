import React, { useState, useRef, useEffect } from 'react';
import { AppState, ImageFile } from './types';
import { generateImageDescription, generateSpeechFromText } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioHelper';
import { UploadIcon, PhotoIcon, SparklesIcon, PlayIcon, PauseIcon, TrashIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize AudioContext on mount (or first interaction)
  useEffect(() => {
    return () => {
      // Cleanup
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }

    // Reset state
    resetState();
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    
    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data:image/jpeg;base64, prefix for the API
      const base64Data = base64String.split(',')[1];
      
      setImageFile({
        data: base64Data,
        mimeType: file.type,
        url: url
      });
    };
    reader.readAsDataURL(file);
  };

  const resetState = () => {
    setAppState(AppState.IDLE);
    setDescription("");
    setError(null);
    stopAudio();
    audioBufferRef.current = null;
    setIsPlaying(false);
  };

  const handleReset = () => {
    resetState();
    setImageFile(null);
  };

  const processImage = async () => {
    if (!imageFile) return;

    try {
      // 1. Initialize Audio Context if not already done (must be done on user gesture)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 2. Vision API - Get Description
      setAppState(AppState.ANALYZING_IMAGE);
      const generatedText = await generateImageDescription(imageFile.data, imageFile.mimeType);
      setDescription(generatedText);

      // 3. TTS API - Get Speech
      setAppState(AppState.GENERATING_SPEECH);
      const base64Audio = await generateSpeechFromText(generatedText);

      // 4. Decode Audio
      if (audioContextRef.current) {
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(
          audioBytes,
          audioContextRef.current,
          24000,
          1 // Mono
        );
        audioBufferRef.current = audioBuffer;
        
        // 5. Auto Play
        setAppState(AppState.PLAYING);
        playAudio();
      }

    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setError(err.message || "Something went wrong during processing.");
    }
  };

  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    // Stop existing if any
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    
    audioSourceRef.current = source;
    source.start();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

      <header className="mb-10 text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 tracking-tight">
          VisionVoice
        </h1>
        <p className="text-slate-400 text-lg">
          Upload an image. We'll describe it and speak it out loud.
        </p>
      </header>

      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
        
        {/* State: IDLE or Image Selected */}
        {!imageFile && (
          <div className="w-full aspect-[4/3] border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-slate-700/30 transition-all cursor-pointer relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="text-slate-400 group-hover:text-blue-400 transition-colors flex flex-col items-center gap-3">
              <UploadIcon />
              <span className="font-medium text-lg">Click or drop image</span>
            </div>
          </div>
        )}

        {imageFile && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-700 group">
             {/* Image Preview */}
            <img 
              src={imageFile.url} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Remove Button */}
            {appState !== AppState.ANALYZING_IMAGE && appState !== AppState.GENERATING_SPEECH && (
                <button 
                onClick={handleReset}
                className="absolute top-3 right-3 bg-black/60 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md transition-all"
                >
                <TrashIcon />
                </button>
            )}
          </div>
        )}

        {/* Action / Status Area */}
        <div className="flex flex-col gap-4">
            
            {/* Analyze Button */}
            {imageFile && appState === AppState.IDLE && (
                <button 
                    onClick={processImage}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                >
                    <SparklesIcon />
                    Generate Description & Speech
                </button>
            )}

            {/* Loading States */}
            {(appState === AppState.ANALYZING_IMAGE || appState === AppState.GENERATING_SPEECH) && (
                <div className="flex flex-col items-center justify-center py-6 text-slate-300 gap-3 animate-pulse">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>
                        {appState === AppState.ANALYZING_IMAGE ? 'Analyzing visual details...' : 'Synthesizing speech...'}
                    </span>
                </div>
            )}

            {/* Error Message */}
            {appState === AppState.ERROR && error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center text-sm">
                    {error}
                    <button onClick={() => setAppState(AppState.IDLE)} className="block w-full mt-2 text-xs uppercase tracking-wider font-bold text-red-400 hover:text-red-300">Try Again</button>
                </div>
            )}

            {/* Results */}
            {(appState === AppState.PLAYING || description) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Audio Player Control */}
                    <div className="bg-slate-900/60 rounded-xl p-4 flex items-center gap-4 border border-slate-700">
                        <button 
                            onClick={toggleAudio}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                isPlaying 
                                ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <div className="flex-1">
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full bg-amber-500 ${isPlaying ? 'animate-progress' : 'w-0'}`}></div>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex justify-between">
                                <span>{isPlaying ? 'Playing...' : 'Paused'}</span>
                                <span className="uppercase tracking-wider text-[10px]">Gemini TTS</span>
                            </div>
                        </div>
                    </div>

                    {/* Text Description */}
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <PhotoIcon /> Generated Description
                        </h3>
                        <p className="text-slate-200 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Footer / Info */}
      <div className="mt-8 text-slate-500 text-sm max-w-md text-center">
        <p>Uses Gemini 2.5 Flash for Vision and Gemini 2.5 Flash TTS for audio generation.</p>
      </div>

      <style>{`
        @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .animate-progress {
            animation: progress 10s linear infinite; /* Rough approximation for visual effect */
        }
      `}</style>
    </div>
  );
};

export default App;
