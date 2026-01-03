import React from 'react';
import { Sprout, Menu, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-50 bg-nepal-cream/95 backdrop-blur-sm border-b-2 border-nepal-gold/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={onReset}>
            <div className="p-2 bg-nepal-green rounded-full text-white mr-3">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-nepal-green font-serif tracking-tight">
                Latent_Bloom
              </h1>
              <p className="text-xs text-nepal-brown hidden sm:block">Smart Farming for Nepal</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button onClick={onReset} className="text-nepal-dark hover:text-nepal-green font-medium transition-colors">Home</button>
            <button className="text-nepal-dark hover:text-nepal-green font-medium transition-colors">Guidance</button>
            <button className="text-nepal-dark hover:text-nepal-green font-medium transition-colors">Community</button>
          </nav>

          <div className="flex items-center space-x-4">
             <button className="p-2 text-nepal-dark hover:bg-nepal-green/10 rounded-full md:hidden">
              <Menu size={24} />
            </button>
            <button className="hidden md:flex items-center text-nepal-brown hover:text-nepal-clay font-medium text-sm">
              <HelpCircle size={16} className="mr-1" /> Help
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};