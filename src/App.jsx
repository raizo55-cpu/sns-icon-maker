import React, { useState } from 'react';
import { Download, Sparkles, Wand2, Loader2, Image as ImageIcon, History, Trash2 } from 'lucide-react';

/**
 * SNS Icon Generator (Final App Version)
 * Features:
 * 1. AI Image Generator (via Imagen API)
 * 2. History Management
 * 3. Enhanced UI/UX
 */

// AI Styles
const AI_STYLES = [
  { id: 'flat', name: 'フラットデザイン', promptSuffix: 'flat vector icon, minimalist, colorful, clean lines, white background, no text' },
  { id: 'anime', name: 'アニメ風', promptSuffix: 'anime style character icon, vibrant colors, detailed eyes, high quality, white background, no text' },
  { id: 'pixel', name: 'ドット絵', promptSuffix: 'pixel art icon, 8-bit style, retro game aesthetic, white background, no text' },
  { id: '3d', name: '3Dキャラクター', promptSuffix: '3D cute character render, claymorphism, soft lighting, 4k, white background, no text' },
  { id: 'watercolor', name: '水彩画風', promptSuffix: 'watercolor painting style icon, artistic, soft edges, pastel colors, white background, no text' },
  { id: 'logo', name: 'ロゴ風', promptSuffix: 'modern logo design, vector graphics, abstract, geometric, minimalist, white background, no text' },
  { id: 'oil', name: '油絵風', promptSuffix: 'oil painting style, textured brushstrokes, artistic, vivid colors, white background, no text' },
  { id: 'cyber', name: 'サイバーパンク', promptSuffix: 'cyberpunk style icon, neon lights, futuristic, high tech, dark background, glowing, no text' },
];

export default function IconGenerator() {
  // --- State ---
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(AI_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [history, setHistory] = useState([]); // Store generated images
  const [aiError, setAiError] = useState('');

  // --- AI Generation Logic ---
  const generateAiImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setAiError('');

    try {
      // Vercel環境変数の読み込み (全角スペース除去済み)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // APIキーが読み込めていない場合のチェック
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。Vercelの環境変数を確認してください。');
      }

      const fullPrompt = `Icon of ${prompt}, ${selectedStyle.promptSuffix}, high quality, no text, no watermark`;
      
      // モデルを imagen-3.0-generate-001 に変更
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{ prompt: fullPrompt }],
            parameters: { 
              sampleCount: 1,
              aspectRatio: "1:1" // 3.0ではアスペクト比指定が可能
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData); // デバッグ用
        throw new Error(`生成に失敗しました (${response.status})。APIキーまたはクォータを確認してください。`);
      }

      const result = await response.json();
      if (result.predictions && result.predictions[0]) {
        const base64Image = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        
        // Add to history and set as current
        const newImageObj = {
            id: Date.now(),
            src: base64Image,
            prompt: prompt,
            style: selectedStyle.name
        };
        
        setCurrentImage(newImageObj);
        setHistory(prev => [newImageObj, ...prev]);

      } else {
        throw new Error('画像データが取得できませんでした。');
      }
    } catch (err) {
      setAiError(err.message || '予期せぬエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageSrc) => {
    if (imageSrc) {
      const downloadLink = document.createElement("a");
      downloadLink.href = imageSrc;
      downloadLink.download = `sns-icon-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const clearHistory = () => {
    if (window.confirm('履歴をすべて削除しますか？')) {
        setHistory([]);
        setCurrentImage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center py-8 md:py-12 font-sans text-gray-800">
      
      {/* Header */}
      <div className="text-center mb-8 px-4 w-full">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
            <Sparkles className="text-purple-600" size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          AI アイコンメーカー
        </h1>
        <p className="text-gray-500 text-sm md:text-base w-full mx-auto">
          キーワードを入れるだけで、AIがあなただけのSNSアイコンを描き上げます。
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl px-4 flex flex-col lg:flex-row gap-8 items-start justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
            
            {/* Prompt Input */}
            <div className="mb-8 space-y-3">
                <label className="block text-sm font-bold text-gray-700">どんなアイコンにしますか？</label>
                <div className="relative group">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例: サイバーパンクな猫, 宇宙服を着た柴犬"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pl-12 shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all text-base md:text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && generateAiImage()}
                />
                {/* Fixed Icon Position: Centered vertically */}
                <Wand2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={24} />
                </div>
            </div>

            {/* Style Selection */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">スタイルを選択</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AI_STYLES.map((style) => (
                    <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-2.5 rounded-xl border text-xs md:text-sm font-medium transition-all text-center relative overflow-hidden group ${
                        selectedStyle.id === style.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500 shadow-md'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-600'
                    }`}
                    >
                    {style.name}
                    {selectedStyle.id === style.id && (
                        <span className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none animate-pulse opacity-50"></span>
                    )}
                    </button>
                ))}
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateAiImage}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform ${
                isGenerating || !prompt.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                }`}
            >
                <Sparkles size={20} className={isGenerating ? "animate-spin" : ""} />
                {isGenerating ? 'AIが描いています...' : 'アイコンを生成'}
            </button>
            
            {aiError && (
                <div className="mt-4 w-full bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                {aiError}
                </div>
            )}
            </div>
        </div>

        {/* Right Column: Preview & History */}
        <div className="w-full lg:w-1/2 flex flex-col items-center gap-6">
            
            {/* Main Preview */}
            <div className="relative w-full max-w-sm aspect-square bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden group">
                {isGenerating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-purple-600 gap-4">
                        <Loader2 className="animate-spin" size={64} />
                        <span className="text-sm font-bold animate-pulse">作成中...</span>
                    </div>
                ) : currentImage ? (
                    <div className="relative w-full h-full">
                        <img src={currentImage.src} alt="Generated Icon" className="w-full h-full object-cover" />
                        
                        {/* Download Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                                onClick={() => downloadImage(currentImage.src)}
                                className="bg-white text-gray-800 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                            >
                                <Download size={20} /> 保存する
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300 gap-3">
                        <ImageIcon size={80} strokeWidth={1} />
                        <span className="text-sm font-medium text-gray-400">プレビュー</span>
                    </div>
                )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="w-full max-w-sm bg-white/60 backdrop-blur rounded-2xl p-4 border border-white/50">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            <History size={16} /> 生成履歴 ({history.length})
                        </h3>
                        <button 
                            onClick={clearHistory}
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={12} /> クリア
                        </button>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar">
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentImage(item)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    currentImage?.id === item.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <img src={item.src} alt="History" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="mt-12 text-center text-gray-400 text-xs">
        <p>Powered by Google Imagen</p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}