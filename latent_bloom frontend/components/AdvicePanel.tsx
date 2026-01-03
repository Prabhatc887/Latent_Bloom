import React, { useEffect, useState } from 'react';
import { Droplets, Bug, Sprout, Volume2, VolumeX } from 'lucide-react';
import { Advice } from '../types';

interface AdvicePanelProps {
  advice: Advice;
  stageName: string;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export const AdvicePanel: React.FC<AdvicePanelProps> = ({ advice, stageName, isSpeaking, onToggleSpeech }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'water' | 'fertilizer' | 'pests'>('general');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-nepal-gold/20 overflow-hidden h-full flex flex-col">
      <div className="bg-nepal-green/10 p-4 border-b border-nepal-green/10 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-nepal-green uppercase tracking-wider">Expert Guidance</h3>
          <p className="text-xs text-nepal-brown">Stage: {stageName}</p>
        </div>
        <button 
          onClick={onToggleSpeech}
          className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-nepal-green text-white' : 'bg-gray-100 text-nepal-dark hover:bg-nepal-green/20'}`}
          title={isSpeaking ? "Stop Audio" : "Play Advice"}
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="flex border-b border-gray-100">
         <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-nepal-green border-b-2 border-nepal-green bg-nepal-green/5' : 'text-gray-500 hover:text-nepal-dark'}`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('water')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'water' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-nepal-dark'}`}
        >
          Water
        </button>
        <button 
          onClick={() => setActiveTab('fertilizer')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'fertilizer' ? 'text-nepal-brown border-b-2 border-nepal-brown bg-orange-50' : 'text-gray-500 hover:text-nepal-dark'}`}
        >
          Feed
        </button>
        <button 
          onClick={() => setActiveTab('pests')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'pests' ? 'text-red-500 border-b-2 border-red-500 bg-red-50' : 'text-gray-500 hover:text-nepal-dark'}`}
        >
          Pests
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'general' && (
          <div className="animate-fadeIn">
             <div className="flex items-start gap-4 mb-4">
               <div className="bg-nepal-green/20 p-3 rounded-full text-nepal-green mt-1">
                 <Sprout size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-lg text-nepal-dark mb-2">General Care</h4>
                 <p className="text-gray-700 leading-relaxed">{advice.general}</p>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'water' && (
          <div className="animate-fadeIn">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mt-1">
                <Droplets size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-nepal-dark mb-2">Watering Advice</h4>
                <p className="text-gray-700 leading-relaxed">{advice.water}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fertilizer' && (
          <div className="animate-fadeIn">
            <div className="flex items-start gap-4 mb-4">
               <div className="bg-orange-100 p-3 rounded-full text-nepal-brown mt-1">
                <Sprout size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-nepal-dark mb-2">Fertilizer & Soil</h4>
                <p className="text-gray-700 leading-relaxed">{advice.fertilizer}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pests' && (
          <div className="animate-fadeIn">
             <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-500 mt-1">
                <Bug size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-nepal-dark mb-2">Pest Control</h4>
                <p className="text-gray-700 leading-relaxed">{advice.pests}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 text-xs text-gray-400 text-center border-t border-gray-100">
        AI-generated advice based on visual analysis. Always consult local experts.
      </div>
    </div>
  );
};