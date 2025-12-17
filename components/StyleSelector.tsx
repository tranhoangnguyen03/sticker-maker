import React from 'react';
import { STYLES, StickerStyle } from '../types';
import { Palette } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: StickerStyle;
  onSelect: (style: StickerStyle) => void;
  disabled: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled }) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-5 h-5 text-brand-500" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Choose Style</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            disabled={disabled}
            className={`
              relative overflow-hidden rounded-xl border-2 transition-all duration-200 p-3 text-left
              flex flex-col h-24 justify-between
              ${selectedStyle.id === style.id 
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-200 dark:ring-brand-800' 
                : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`w-6 h-6 rounded-full ${style.previewColor} shadow-sm mb-2`}></div>
            <span className={`text-sm font-medium ${selectedStyle.id === style.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;