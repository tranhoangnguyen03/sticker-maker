import React from 'react';
import { PenTool, Sparkles, Zap, Github, Mail, Globe, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      {/* Hero Section */}
      <div className="text-center max-w-4xl space-y-6 px-4">
        <div className="inline-flex items-center justify-center p-4 bg-brand-100 dark:bg-brand-900/30 rounded-3xl mb-4 shadow-inner">
           <Sparkles className="w-12 h-12 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Turn Photos into <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Custom Stickers</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Create high-quality, die-cut stickers from your images in seconds using the power of Google's latest image generative model.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
        <FeatureCard 
          icon={<Zap className="w-6 h-6" />}
          title="Single & Batch Mode"
          description="Process a single masterpiece or generate up to 6 stickers at once for your collection."
        />
        <FeatureCard 
          icon={<PenTool className="w-6 h-6" />}
          title="Precision Control"
          description="Draw a rough outline around your subject to guide the AI, or let it auto-detect the magic."
        />
        <FeatureCard 
          icon={<Sparkles className="w-6 h-6" />}
          title="Creative Styles"
          description="Choose from faithful reproductions, pixel art, cartoons, cyberpunk, and more."
        />
      </div>

      {/* API Key Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 max-w-2xl text-center mx-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center justify-center gap-2">
           Warning: Paid API Key Required
        </h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          This app uses the latest and high-quality <strong>Gemini Image</strong> model. You will need a personal Google Cloud API Key with billing enabled to generate stickers. 
        </p>
      </div>

      {/* CTA */}
      <div className="pt-4 pb-8">
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-5 text-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-brand-600 to-purple-600 rounded-full hover:shadow-2xl hover:shadow-brand-500/40 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600"
        >
          <span>Try it out now</span>
          <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer / Credits */}
      <div className="pt-12 border-t border-slate-200 dark:border-slate-800 w-full max-w-4xl text-center space-y-6">
        <div>
            <p className="text-slate-900 dark:text-white font-medium mb-2">
            Created by Nguyen H. Tran
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
            Reach out for feature requests!
            </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-slate-600 dark:text-slate-400">
          <a href="mailto:tranhoangnguyen03@gmail.com" className="flex items-center hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <Mail className="w-4 h-4 mr-2" />
            tranhoangnguyen03@gmail.com
          </a>
          <a href="https://aboutme.davidustranus.space" target="_blank" rel="noreferrer" className="flex items-center hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <Globe className="w-4 h-4 mr-2" />
            aboutme.davidustranus.space
          </a>
          <a href="https://github.com/tranhoangnguyen03/sticker-maker" target="_blank" rel="noreferrer" className="flex items-center hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <Github className="w-4 h-4 mr-2" />
            GitHub Repo
          </a>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 transition-all hover:shadow-md">
    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6">
      {icon}
    </div>
    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;