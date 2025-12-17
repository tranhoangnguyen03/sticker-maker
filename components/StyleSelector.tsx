import React, { useState, useEffect } from 'react';
import { ARTISTIC_STYLES, THEMATIC_STYLES, FAITHFUL_STYLE, CUSTOM_STYLE_ID, StickerStyle } from '../types';
import { Palette, Sparkles, PenTool, Image as ImageIcon } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: StickerStyle;
  onSelect: (style: StickerStyle) => void;
  disabled: boolean;
}

type StyleCategory = 'faithful' | 'artistic' | 'thematic' | 'custom';

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled }) => {
  const [activeTab, setActiveTab] = useState<StyleCategory>('faithful');
  const [customText, setCustomText] = useState('');

  // Sync active tab with selectedStyle on mount or external change
  useEffect(() => {
    if (selectedStyle.id === 'faithful') {
      setActiveTab('faithful');
    } else if (selectedStyle.id === CUSTOM_STYLE_ID) {
      setActiveTab('custom');
      setCustomText(selectedStyle.promptModifier);
    } else if (ARTISTIC_STYLES.some(s => s.id === selectedStyle.id)) {
      setActiveTab('artistic');
    } else if (THEMATIC_STYLES.some(s => s.id === selectedStyle.id)) {
      setActiveTab('thematic');
    }
  }, [selectedStyle.id]);

  const handleTabClick = (category: StyleCategory) => {
    if (disabled) return;
    setActiveTab(category);

    // Auto-select logic when switching tabs
    if (category === 'faithful') {
      onSelect(FAITHFUL_STYLE);
    } else if (category === 'artistic') {
      // If we are already in an artistic style, keep it, otherwise pick first
      const isAlreadyArtistic = ARTISTIC_STYLES.some(s => s.id === selectedStyle.id);
      if (!isAlreadyArtistic) {
        onSelect(ARTISTIC_STYLES[0]);
      }
    } else if (category === 'thematic') {
      const isAlreadyThematic = THEMATIC_STYLES.some(s => s.id === selectedStyle.id);
      if (!isAlreadyThematic) {
        onSelect(THEMATIC_STYLES[0]);
      }
    } else if (category === 'custom') {
      onSelect({
        id: CUSTOM_STYLE_ID,
        name: 'Custom',
        promptModifier: customText,
        previewColor: 'bg-slate-800'
      });
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCustomText(newText);
    onSelect({
      id: CUSTOM_STYLE_ID,
      name: 'Custom',
      promptModifier: newText,
      previewColor: 'bg-slate-800'
    });
  };

  const renderTabButton = (category: StyleCategory, label: string, Icon: React.ElementType) => {
    const isActive = activeTab === category;
    return (
      <button
        onClick={() => handleTabClick(category)}
        disabled={disabled}
        className={`
          flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all duration-200
          ${isActive 
            ? 'bg-brand-500 text-white shadow-md' 
            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        <span>{label}</span>
      </button>
    );
  };

  const renderStyleGrid = (styles: StickerStyle[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
      {styles.map(style => (
        <button
          key={style.id}
          onClick={() => onSelect(style)}
          disabled={disabled}
          className={`
            relative overflow-hidden rounded-xl border-2 transition-all duration-200 p-3 text-left
            flex flex-col h-24 justify-between group
            ${selectedStyle.id === style.id 
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-200 dark:ring-brand-800' 
              : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className={`w-6 h-6 rounded-full ${style.previewColor} shadow-sm mb-2 group-hover:scale-110 transition-transform`}></div>
          <span className={`text-sm font-medium ${selectedStyle.id === style.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
            {style.name}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {renderTabButton('faithful', 'Faithful', ImageIcon)}
        {renderTabButton('artistic', 'Artistic Styling', Palette)}
        {renderTabButton('thematic', 'Thematic Styling', Sparkles)}
        {renderTabButton('custom', 'Custom Styling', PenTool)}
      </div>

      {/* Content Area */}
      <div className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
        {activeTab === 'faithful' && (
           <div className="h-full flex flex-col items-center justify-center text-center p-4 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                 <ImageIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Original Style Preserved</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                The sticker will look exactly like your photo, with a clean die-cut border.
              </p>
           </div>
        )}

        {activeTab === 'artistic' && renderStyleGrid(ARTISTIC_STYLES)}

        {activeTab === 'thematic' && renderStyleGrid(THEMATIC_STYLES)}

        {activeTab === 'custom' && (
           <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Describe your custom style
              </label>
              <textarea
                value={customText}
                onChange={handleCustomChange}
                disabled={disabled}
                placeholder="e.g. A cyberpunk robot made of stained glass with neon green outlines..."
                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 
                           text-slate-900 dark:text-white text-sm p-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           placeholder:text-slate-400 dark:placeholder:text-slate-500 h-24"
              />
           </div>
        )}
      </div>
    </div>
  );
};

export default StyleSelector;