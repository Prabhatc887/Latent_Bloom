import React from 'react';
import { LifecycleStage } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface StageSidebarProps {
  stages: LifecycleStage[];
  currentStageIndex: number;
  onStageSelect: (index: number) => void;
}

export const StageSidebar: React.FC<StageSidebarProps> = ({ stages, currentStageIndex, onStageSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-nepal-gold/20 p-4 h-full">
      <h3 className="font-bold text-nepal-dark mb-4 px-2">Lifecycle Stages</h3>
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isPast = index < currentStageIndex;

          return (
            <button
              key={stage.id}
              onClick={() => onStageSelect(index)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-left
                ${isActive ? 'bg-nepal-green text-white shadow-md transform scale-[1.02]' : 'hover:bg-nepal-green/10 text-gray-600'}
              `}
            >
              <div className={`mr-3 ${isActive ? 'text-white' : isPast ? 'text-nepal-green' : 'text-gray-300'}`}>
                {isPast ? <CheckCircle2 size={20} /> : <Circle size={20} fill={isActive ? "currentColor" : "none"} />}
              </div>
              <div>
                <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-nepal-dark'}`}>{stage.name}</div>
                <div className={`text-xs ${isActive ? 'text-nepal-cream' : 'text-gray-500'}`}>{stage.duration}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};