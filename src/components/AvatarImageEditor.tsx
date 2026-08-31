import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Sparkles, 
  Check, 
  X, 
  Sliders, 
  Image as ImageIcon,
  Shield,
  Layers,
  Crown,
  Eye
} from 'lucide-react';

export const TACTICAL_PRESET_AVATARS = [
  { id: 'operator1', name: 'Ghost Operator', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator2', name: 'Elite Sniper', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator3', name: 'Armory Lead', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator4', name: 'Warlord Spec', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator5', name: 'Delta Force', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator6', name: 'Night Stalker', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator7', name: 'Cyber Rogue', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { id: 'operator8', name: 'Valkyrie Recon', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' }
];

export const AVATAR_FRAMES = [
  { id: 'gold', name: 'Tactical Gold', borderClass: 'border-2 border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30' },
  { id: 'cyan', name: 'Neon Cyber', borderClass: 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/20 ring-2 ring-cyan-400/30' },
  { id: 'rose', name: 'Warlord Red', borderClass: 'border-2 border-rose-500 shadow-lg shadow-rose-500/20 ring-2 ring-rose-500/30' },
  { id: 'emerald', name: 'Delta Green', borderClass: 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30' },
  { id: 'stealth', name: 'Carbon Dark', borderClass: 'border-2 border-zinc-600 shadow-lg shadow-black ring-1 ring-zinc-700' },
];

export const AVATAR_FILTERS = [
  { id: 'none', name: 'Normal', filterStyle: 'none' },
  { id: 'contrast', name: 'Crisp Taktis', filterStyle: 'contrast(125%) brightness(105%)' },
  { id: 'warm', name: 'Warm Amber', filterStyle: 'sepia(30%) saturate(140%) contrast(110%)' },
  { id: 'stealth', name: 'Stealth Mono', filterStyle: 'grayscale(100%) contrast(120%)' },
  { id: 'nightvision', name: 'Night Vision', filterStyle: 'hue-rotate(85deg) saturate(180%) contrast(120%)' },
];

interface AvatarImageEditorProps {
  initialAvatarUrl?: string;
  displayName?: string;
  onSave: (finalImageUrl: string) => void;
  onCancel: () => void;
}

export const AvatarImageEditor: React.FC<AvatarImageEditorProps> = ({
  initialAvatarUrl = '',
  displayName = 'Operator',
  onSave,
  onCancel,
}) => {
  const [currentImage, setCurrentImage] = useState<string>(initialAvatarUrl || TACTICAL_PRESET_AVATARS[0].url);
  const [zoom, setZoom] = useState<number>(1.0); // 1.0 to 2.5
  const [offsetX, setOffsetX] = useState<number>(0); // -50 to +50 %
  const [offsetY, setOffsetY] = useState<number>(0); // -50 to +50 %
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [selectedFrame, setSelectedFrame] = useState<string>('gold');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar (Maksimal 5MB)');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCurrentImage(event.target.result);
        setZoom(1.0);
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Load URL
  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setCurrentImage(urlInput.trim());
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setUrlInput('');
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setSelectedFilter('none');
  };

  // Bake image on canvas to produce high quality permanent crop & adjust
  const handleApplyAndSave = async () => {
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 320;
      canvas.width = size;
      canvas.height = size;

      if (!ctx) {
        onSave(currentImage);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => {
          // If crossOrigin blocked, fallback
          resolve(false);
        };
        img.src = currentImage;
      });

      // Fill background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, size, size);

      // Save context state for rotation & offset
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply CSS Filter
      const activeFilterObj = AVATAR_FILTERS.find((f) => f.id === selectedFilter);
      if (activeFilterObj && activeFilterObj.filterStyle !== 'none') {
        ctx.filter = activeFilterObj.filterStyle;
      }

      // Scale & Translation calculation
      const scale = zoom;
      const imgAspect = img.width / img.height;
      let drawW = size;
      let drawH = size;

      if (imgAspect > 1) {
        drawW = size * imgAspect;
        drawH = size;
      } else {
        drawW = size;
        drawH = size / imgAspect;
      }

      drawW *= scale;
      drawH *= scale;

      const shiftX = (offsetX / 100) * size;
      const shiftY = (offsetY / 100) * size;

      ctx.drawImage(img, -drawW / 2 + shiftX, -drawH / 2 + shiftY, drawW, drawH);
      ctx.restore();

      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(finalDataUrl);
    } catch (err) {
      console.warn('Canvas export fallback:', err);
      onSave(currentImage);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeFrame = AVATAR_FRAMES.find((f) => f.id === selectedFrame) || AVATAR_FRAMES[0];
  const activeFilter = AVATAR_FILTERS.find((f) => f.id === selectedFilter) || AVATAR_FILTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        
        {/* Header */}
        <div className="bg-zinc-950 px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-tactical text-base sm:text-lg font-bold text-white uppercase tracking-wider">
              Studio Penyesuaian Foto Profil
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top: Interactive Live Preview Showcase */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
            
            {/* 1. Main Large Frame Preview */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Tampilan Utama Profil
              </span>
              <div className={`relative w-28 h-28 rounded-3xl overflow-hidden bg-black ${activeFrame.borderClass}`}>
                <img
                  src={currentImage}
                  alt="Preview"
                  style={{
                    transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg)`,
                    filter: activeFilter.filterStyle,
                    transformOrigin: 'center center',
                  }}
                  className="w-full h-full object-cover transition-transform duration-100 ease-out"
                />
              </div>
            </div>

            {/* 2. Leaderboard & Table Mini Preview */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Tampilan di Leaderboard
              </span>
              <div className="flex items-center space-x-2.5 p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-left">
                <div className={`w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 ${activeFrame.borderClass}`}>
                  <img
                    src={currentImage}
                    alt="Preview Table"
                    style={{
                      transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg)`,
                      filter: activeFilter.filterStyle,
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block truncate max-w-[120px]">{displayName}</span>
                  <span className="text-[10px] text-amber-400 font-mono">Rank #1 Sultan</span>
                </div>
              </div>
            </div>

            {/* 3. Compact Navbar Preview */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Tampilan di Navbar
              </span>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                <div className={`w-7 h-7 rounded-full overflow-hidden bg-black shrink-0 ${activeFrame.borderClass}`}>
                  <img
                    src={currentImage}
                    alt="Preview Nav"
                    style={{
                      transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg)`,
                      filter: activeFilter.filterStyle,
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[70px]">{displayName.split(' ')[0]}</span>
              </div>
            </div>

          </div>

          {/* Adjustment Sliders & Controls */}
          <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold font-tactical uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Pengaturan Zoom & Posisi Fokus</span>
              </span>
              <button
                type="button"
                onClick={handleResetAdjustments}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Reset Pengaturan
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center space-x-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Perbesar / Zoom:</span>
                </span>
                <span className="font-mono font-bold text-amber-400">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Horizontal Alignment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Geser Posisi Horizontal (Kiri - Kanan):</span>
                <span className="font-mono text-zinc-400">{offsetX}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Vertical Alignment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Geser Posisi Vertikal (Atas - Bawah):</span>
                <span className="font-mono text-zinc-400">{offsetY}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Quick Rotate Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-400">Putar Sudut Foto:</span>
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Putar 90° ({rotation}°)</span>
              </button>
            </div>
          </div>

          {/* Tactical Border Frame Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold font-tactical uppercase tracking-wider text-zinc-300 block">
              Pilih Gaya Bingkai Taktis (Border Frame):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {AVATAR_FRAMES.map((frame) => (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    selectedFrame === frame.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {frame.name}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Filters */}
          <div className="space-y-2">
            <span className="text-xs font-bold font-tactical uppercase tracking-wider text-zinc-300 block">
              Pilih Filter Warna Grafis:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {AVATAR_FILTERS.map((filt) => (
                <button
                  key={filt.id}
                  type="button"
                  onClick={() => setSelectedFilter(filt.id)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                    selectedFilter === filt.id
                      ? 'bg-zinc-800 border-amber-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {filt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Image Source Options: Upload file / URL / Presets */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-zinc-700 hover:border-amber-500 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Unggah Foto dari Galeri HP / PC</span>
              </button>

              <form onSubmit={handleLoadUrl} className="flex-1 flex gap-1.5">
                <input
                  type="url"
                  placeholder="Atau Paste Link URL Foto..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer border border-zinc-700"
                >
                  Muat
                </button>
              </form>
            </div>

            {/* Tactical Preset Grid */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Atau Pilih Karakter Operator Bawaan:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {TACTICAL_PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setCurrentImage(av.url);
                      setZoom(1.0);
                      setOffsetX(0);
                      setOffsetY(0);
                      setRotation(0);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      currentImage === av.url
                        ? 'border-amber-500 ring-2 ring-amber-500/50 scale-105'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-950 px-4 sm:px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApplyAndSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-tactical font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Menyimpan...' : 'Terapkan & Simpan Foto'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
