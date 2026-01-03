import React from 'react';
import { Heart, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-nepal-dark text-nepal-cream mt-auto border-t-4 border-nepal-gold">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-nepal-gold mb-4">Latent_Bloom</h3>
            <p className="text-sm text-gray-300 max-w-xs">
              Empowering Nepalese farmers with AI-driven crop lifecycle analysis and personalized care advice.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-nepal-gold mb-4">Contact Support</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center"><Phone size={16} className="mr-2 text-nepal-greenLight" /> +977 9800000000 (Toll Free)</li>
              <li className="flex items-center"><MapPin size={16} className="mr-2 text-nepal-greenLight" /> Kathmandu, Nepal</li>
            </ul>
          </div>
          
          <div>
             <h3 className="text-lg font-bold text-nepal-gold mb-4">Access</h3>
             <p className="text-sm text-gray-300">
               This service is free for all farmers in Nepal. Supported by agricultural development grants.
             </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Latent_Bloom. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-400">
            <span>Made with</span>
            <Heart size={14} className="mx-1 text-red-500 fill-current" />
            <span>for Nepal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};