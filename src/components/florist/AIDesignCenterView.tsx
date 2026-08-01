import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, Copy, Check, Lightbulb, Wand2 } from 'lucide-react';

export default function AIDesignCenterView() {
  const [flowerType, setFlowerType] = useState('Naivasha Red Roses & Gypsophila');
  const [occasion, setOccasion] = useState('Anniversary');
  const [tone, setTone] = useState('Romantic & Luxurious');
  const [generating, setGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setAiOutput(null);

    try {
      const res = await axios.post('/api/v1/florist/ai/generate-description', {
        flowerType,
        occasion,
        tone
      });
      setAiOutput(res.data);
      setGenerating(false);
    } catch (err) {
      console.error('AI generation failed:', err);
      // Fallback response if offline
      setAiOutput({
        title: `Royal ${occasion} ${flowerType.split('&')[0]} Arrangement`,
        description: `Hand-crafted with fresh ${flowerType}, selected at peak bloom for unforgettable elegance. Designed for ${occasion.toLowerCase()} celebrations with a ${tone.toLowerCase()} touch.`,
        suggestedTags: ['luxury', 'fresh-flowers', occasion.toLowerCase(), 'kenyan-grown']
      });
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1e3a1b] to-[#2D5A27] rounded-2xl p-6 text-white shadow-md space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-emerald-300" size={20} />
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-300">
            Flora_X AI Design Studio
          </span>
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-50">AI Creative Copy & Arrangement Generator</h2>
        <p className="text-xs text-stone-200/90 max-w-2xl leading-relaxed">
          Leverage Gemini AI to automatically compose product titles, poetic product descriptions, and search tags tailored to the Kenyan marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-stone-800 text-sm border-b border-stone-100 pb-2">
            Arrangement Parameters
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Primary Flowers Included
              </label>
              <input
                type="text"
                required
                value={flowerType}
                onChange={(e) => setFlowerType(e.target.value)}
                placeholder="e.g. Naivasha Red Roses & Gypsophila"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Target Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
              >
                <option value="Anniversary">Anniversary</option>
                <option value="Birthday">Birthday</option>
                <option value="Valentine's Day">Valentine's Day</option>
                <option value="Mother's Day">Mother's Day</option>
                <option value="Sympathy & Funeral">Sympathy & Funeral</option>
                <option value="Congratulations">Congratulations</option>
                <option value="Corporate Event">Corporate Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Brand Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
              >
                <option value="Romantic & Luxurious">Romantic & Luxurious</option>
                <option value="Vibrant & Playful">Vibrant & Playful</option>
                <option value="Elegant & Minimalist">Elegant & Minimalist</option>
                <option value="Warm & Heartfelt">Warm & Heartfelt</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full bg-[#2D5A27] hover:bg-[#23471f] text-white font-semibold py-2.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              {generating ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
              <span>{generating ? 'Composing Copy...' : 'Generate AI Description'}</span>
            </button>
          </form>
        </div>

        {/* AI Output Result Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h3 className="font-serif font-bold text-stone-800 text-sm">Generated AI Listing Copy</h3>
              {aiOutput && (
                <button
                  onClick={() => copyToClipboard(`${aiOutput.title}\n\n${aiOutput.description}`)}
                  className="text-xs font-semibold text-[#2D5A27] hover:underline flex items-center space-x-1"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Copy'}</span>
                </button>
              )}
            </div>

            {aiOutput ? (
              <div className="space-y-4 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Suggested Title
                  </span>
                  <h4 className="font-serif font-bold text-stone-800 text-sm bg-[#FAF9F6] p-3 rounded-xl border border-stone-200/60">
                    {aiOutput.title}
                  </h4>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Product Description
                  </span>
                  <p className="text-xs text-stone-700 bg-[#FAF9F6] p-3 rounded-xl border border-stone-200/60 leading-relaxed">
                    {aiOutput.description}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Suggested Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiOutput.suggestedTags?.map((tag: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400 space-y-2">
                <Lightbulb size={36} className="mx-auto text-stone-300" />
                <p className="text-xs">Fill out parameters and click generate to compose high-converting bouquet copy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
