import React, { useState, useRef, useEffect } from 'react';
import { GraphicCanvasFormat, GraphicElement } from '../../types';
import { GRAPHIC_FORMATS, STARTER_TEMPLATES } from '../../data/templates';
import {
  Type,
  Square,
  Circle,
  Sparkles,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Palette,
  Maximize2,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

interface GraphicStudioProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const GraphicStudio: React.FC<GraphicStudioProps> = ({ onNotify }) => {
  const [selectedFormat, setSelectedFormat] = useState<GraphicCanvasFormat>(GRAPHIC_FORMATS[0]);
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient'>('gradient');
  const [backgroundValue, setBackgroundValue] = useState<string>(
    'linear-gradient(135deg, #18181b 0%, #09090b 100%)'
  );
  const [elements, setElements] = useState<GraphicElement[]>(STARTER_TEMPLATES[0].elements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('title-1');

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const elementStartPos = useRef<{ x: number; y: number } | null>(null);

  const canvasExportRef = useRef<HTMLDivElement | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Gradient presets
  const gradientPresets = [
    { name: 'Dark Slate', val: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)' },
    { name: 'Crimson Glow', val: 'linear-gradient(135deg, #4c0519 0%, #1c1917 100%)' },
    { name: 'Cyberpunk', val: 'linear-gradient(135deg, #0f172a 0%, #311042 50%, #1e1b4b 100%)' },
    { name: 'Emerald Night', val: 'linear-gradient(135deg, #022c22 0%, #064e3b 60%, #020617 100%)' },
    { name: 'Sunset Amber', val: 'linear-gradient(135deg, #78350f 0%, #831843 60%, #0f172a 100%)' },
    { name: 'Pure Obsidian', val: '#09090b' },
  ];

  // Add Elements
  const addTextElement = (type: 'title' | 'subhead' | 'badge') => {
    const id = `el-${Date.now()}`;
    let newEl: GraphicElement;

    if (type === 'title') {
      newEl = {
        id,
        type: 'text',
        text: 'NEW HEADLINE',
        fontSize: 54,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: 'Outfit',
        textAlign: 'center',
        x: Math.round(selectedFormat.width / 2 - 300),
        y: Math.round(selectedFormat.height / 2 - 60),
        width: 600,
        height: 120,
        rotation: 0,
        opacity: 1,
      };
    } else if (type === 'subhead') {
      newEl = {
        id,
        type: 'text',
        text: 'Supporting editorial copy and description.',
        fontSize: 24,
        fontWeight: 'normal',
        color: '#a1a1aa',
        fontFamily: 'Plus Jakarta Sans',
        textAlign: 'center',
        x: Math.round(selectedFormat.width / 2 - 250),
        y: Math.round(selectedFormat.height / 2 + 60),
        width: 500,
        height: 60,
        rotation: 0,
        opacity: 0.9,
      };
    } else {
      newEl = {
        id,
        type: 'text',
        text: 'FEATURED 2026',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f43f5e',
        fontFamily: 'JetBrains Mono',
        textAlign: 'center',
        x: Math.round(selectedFormat.width / 2 - 100),
        y: Math.round(selectedFormat.height / 2 - 140),
        width: 200,
        height: 36,
        rotation: 0,
        opacity: 1,
      };
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(id);
    onNotify('success', 'Added Text Layer');
  };

  const addShapeElement = (shapeType: 'rectangle' | 'circle' | 'pill') => {
    const id = `shape-${Date.now()}`;
    const newEl: GraphicElement = {
      id,
      type: 'shape',
      shapeType,
      x: Math.round(selectedFormat.width / 2 - 150),
      y: Math.round(selectedFormat.height / 2 - 150),
      width: 300,
      height: shapeType === 'pill' ? 80 : 300,
      rotation: 0,
      opacity: 0.8,
      fillColor: '#f43f5e',
      borderRadius: shapeType === 'circle' ? 9999 : shapeType === 'pill' ? 999 : 16,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(id);
    onNotify('success', 'Added Shape Layer');
  };

  const updateSelectedElement = (patch: Partial<GraphicElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, ...patch } : el))
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
    onNotify('info', 'Deleted Layer');
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) return;
    const newId = `el-${Date.now()}`;
    const copy: GraphicElement = {
      ...selectedElement,
      id: newId,
      x: selectedElement.x + 30,
      y: selectedElement.y + 30,
    };
    setElements((prev) => [...prev, copy]);
    setSelectedElementId(newId);
    onNotify('success', 'Duplicated Layer');
  };

  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedElementId) return;
    const index = elements.findIndex((el) => el.id === selectedElementId);
    if (index === -1) return;
    const targetIdx = direction === 'up' ? index + 1 : index - 1;
    if (targetIdx < 0 || targetIdx >= elements.length) return;

    const copy = [...elements];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setElements(copy);
  };

  // Dragging logic
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setDraggingId(id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    const el = elements.find((item) => item.id === id);
    if (el) {
      elementStartPos.current = { x: el.x, y: el.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !dragStartPos.current || !elementStartPos.current) return;
    // Calculate scale factor of rendered canvas container vs natural format
    const canvasEl = canvasExportRef.current;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const scale = selectedFormat.width / rect.width;

    const deltaX = (e.clientX - dragStartPos.current.x) * scale;
    const deltaY = (e.clientY - dragStartPos.current.y) * scale;

    const newX = Math.round(elementStartPos.current.x + deltaX);
    const newY = Math.round(elementStartPos.current.y + deltaY);

    setElements((prev) =>
      prev.map((el) => (el.id === draggingId ? { ...el, x: newX, y: newY } : el))
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    dragStartPos.current = null;
    elementStartPos.current = null;
  };

  // Export Graphic to Canvas / Image
  const handleExportGraphic = () => {
    const canvas = document.createElement('canvas');
    canvas.width = selectedFormat.width;
    canvas.height = selectedFormat.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    if (backgroundValue.includes('gradient')) {
      const grad = ctx.createLinearGradient(0, 0, selectedFormat.width, selectedFormat.height);
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = backgroundValue;
    }
    ctx.fillRect(0, 0, selectedFormat.width, selectedFormat.height);

    // Draw elements
    for (const el of elements) {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      if (el.type === 'shape') {
        ctx.fillStyle = el.fillColor || '#ffffff';
        if (el.borderColor && el.borderWidth) {
          ctx.strokeStyle = el.borderColor;
          ctx.lineWidth = el.borderWidth;
        }

        if (el.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
          if (el.fillColor) ctx.fill();
          if (el.borderColor) ctx.stroke();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
          if (el.borderColor && el.borderWidth) {
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        }
      } else if (el.type === 'text' && el.text) {
        ctx.fillStyle = el.color || '#ffffff';
        ctx.font = `${el.fontWeight === 'bold' ? 'bold' : 'normal'} ${el.fontSize || 32}px "${
          el.fontFamily || 'Outfit'
        }", sans-serif`;
        ctx.textAlign = (el.textAlign as CanvasTextAlign) || 'left';

        const lines = el.text.split('\n');
        const lineHeight = (el.fontSize || 32) * (el.lineHeight || 1.15);
        lines.forEach((line, idx) => {
          const posX = el.textAlign === 'center' ? el.x + el.width / 2 : el.x;
          ctx.fillText(line, posX, el.y + (idx + 1) * lineHeight);
        });
      }
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `graphic-design-${selectedFormat.id}.png`;
    link.href = dataUrl;
    link.click();
    onNotify('success', 'Design Exported', `${selectedFormat.width} × ${selectedFormat.height} px`);
  };

  return (
    <div
      className="flex-1 flex overflow-hidden bg-neutral-950 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Left Design Elements & Format Panel */}
      <aside className="w-72 sm:w-80 border-r border-neutral-800/80 bg-neutral-900/60 flex flex-col shrink-0 overflow-y-auto">
        {/* Canvas Format Selector */}
        <div className="p-4 border-b border-neutral-800/80 space-y-2">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Canvas Dimensions
          </span>
          <div className="grid grid-cols-2 gap-2">
            {GRAPHIC_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  selectedFormat.id === fmt.id
                    ? 'border-rose-500 bg-rose-500/10 text-white font-medium'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-semibold text-neutral-200 text-xs truncate">{fmt.name}</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  {fmt.width} × {fmt.height} ({fmt.aspectRatioDisplay})
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Style */}
        <div className="p-4 border-b border-neutral-800/80 space-y-3">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Canvas Background
          </span>
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((g) => (
              <button
                key={g.name}
                onClick={() => setBackgroundValue(g.val)}
                style={{ background: g.val }}
                className={`h-11 rounded-lg border-2 transition-transform ${
                  backgroundValue === g.val
                    ? 'border-white scale-105 shadow-md'
                    : 'border-neutral-800 hover:scale-102'
                }`}
                title={g.name}
              />
            ))}
          </div>
        </div>

        {/* Add Elements Section */}
        <div className="p-4 border-b border-neutral-800/80 space-y-3">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Add Typography
          </span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => addTextElement('title')}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-200 transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span>Display Headline</span>
            </button>
            <button
              onClick={() => addTextElement('subhead')}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-300 transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-sky-400" />
              <span>Editorial Subhead</span>
            </button>
            <button
              onClick={() => addTextElement('badge')}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Accent Kicker / Badge</span>
            </button>
          </div>
        </div>

        {/* Add Shapes Section */}
        <div className="p-4 space-y-3">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Add Geometric Shapes
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addShapeElement('rectangle')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 flex flex-col items-center gap-1.5 transition-colors text-xs"
            >
              <Square className="w-4 h-4 text-neutral-400" />
              <span>Card Box</span>
            </button>
            <button
              onClick={() => addShapeElement('circle')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 flex flex-col items-center gap-1.5 transition-colors text-xs"
            >
              <Circle className="w-4 h-4 text-neutral-400" />
              <span>Circle</span>
            </button>
            <button
              onClick={() => addShapeElement('pill')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 flex flex-col items-center gap-1.5 transition-colors text-xs"
            >
              <div className="w-5 h-2.5 rounded-full border border-neutral-400" />
              <span>Pill Tag</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Canvas Workspace */}
      <main
        onClick={() => setSelectedElementId(null)}
        className="flex-1 overflow-auto flex items-center justify-center p-8 canvas-checkerboard relative"
      >
        <div
          ref={canvasExportRef}
          style={{
            width: selectedFormat.width > selectedFormat.height ? '680px' : '420px',
            aspectRatio: `${selectedFormat.width} / ${selectedFormat.height}`,
            background: backgroundValue,
          }}
          className="relative shadow-2xl rounded-lg overflow-hidden border border-neutral-800 select-none transition-all duration-200"
        >
          {elements.map((el) => {
            const isSelected = selectedElementId === el.id;
            // Compute percentage positions based on canvas width and height
            const leftPct = (el.x / selectedFormat.width) * 100;
            const topPct = (el.y / selectedFormat.height) * 100;
            const widthPct = (el.width / selectedFormat.width) * 100;
            const heightPct = (el.height / selectedFormat.height) * 100;

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  minHeight: `${heightPct}%`,
                  opacity: el.opacity,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                }}
                className={`absolute cursor-move transition-shadow ${
                  isSelected ? 'ring-2 ring-rose-500 shadow-lg' : 'hover:ring-1 hover:ring-rose-400/40'
                }`}
              >
                {el.type === 'shape' && (
                  <div
                    style={{
                      backgroundColor: el.fillColor,
                      borderColor: el.borderColor,
                      borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
                      borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                    }}
                    className="w-full h-full min-h-[20px]"
                  />
                )}

                {el.type === 'text' && (
                  <div
                    style={{
                      color: el.color,
                      fontFamily: el.fontFamily || 'Plus Jakarta Sans',
                      fontSize: `clamp(10px, ${(el.fontSize || 32) * 0.4}px, 60px)`,
                      fontWeight: el.fontWeight || 'normal',
                      textAlign: el.textAlign || 'left',
                      letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                      lineHeight: el.lineHeight || 1.15,
                    }}
                    className="w-full whitespace-pre-wrap leading-tight select-none"
                  >
                    {el.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick bottom bar for export */}
        <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
          <button
            onClick={handleExportGraphic}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-xl shadow-rose-600/30 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Graphic PNG</span>
          </button>
        </div>
      </main>

      {/* Right Inspector & Layer Control Panel */}
      <aside className="w-72 sm:w-80 border-l border-neutral-800/80 bg-neutral-900/60 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Element Inspector
          </span>
          {selectedElement && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveLayer('up')}
                className="p-1 text-neutral-400 hover:text-white rounded"
                title="Bring Forward"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveLayer('down')}
                className="p-1 text-neutral-400 hover:text-white rounded"
                title="Send Backward"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={duplicateSelectedElement}
                className="p-1 text-neutral-400 hover:text-white rounded"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={deleteSelectedElement}
                className="p-1 text-rose-400 hover:text-rose-300 rounded"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {selectedElement ? (
          <div className="p-4 space-y-5">
            {/* If Text Element */}
            {selectedElement.type === 'text' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">Content</label>
                  <textarea
                    rows={3}
                    value={selectedElement.text || ''}
                    onChange={(e) => updateSelectedElement({ text: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Font Size</span>
                    <span className="font-mono text-neutral-300">{selectedElement.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={120}
                    value={selectedElement.fontSize || 32}
                    onChange={(e) =>
                      updateSelectedElement({ fontSize: parseInt(e.target.value) })
                    }
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">Font Family</label>
                  <select
                    value={selectedElement.fontFamily || 'Outfit'}
                    onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                  >
                    <option value="Outfit">Outfit (Display Bold)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Editorial)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || '#ffffff'}
                      onChange={(e) => updateSelectedElement({ color: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={selectedElement.color || '#ffffff'}
                      onChange={(e) => updateSelectedElement({ color: e.target.value })}
                      className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* If Shape Element */}
            {selectedElement.type === 'shape' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">Fill Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.fillColor || '#f43f5e'}
                      onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={selectedElement.fillColor || '#f43f5e'}
                      onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                      className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Corner Radius</span>
                    <span className="font-mono text-neutral-300">
                      {selectedElement.borderRadius || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) =>
                      updateSelectedElement({ borderRadius: parseInt(e.target.value) })
                    }
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </>
            )}

            {/* Global Opacity */}
            <div className="space-y-1.5 pt-3 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Layer Opacity</span>
                <span className="font-mono text-neutral-300">
                  {Math.round((selectedElement.opacity || 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selectedElement.opacity || 1}
                onChange={(e) =>
                  updateSelectedElement({ opacity: parseFloat(e.target.value) })
                }
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-neutral-500 flex flex-col items-center justify-center h-48 space-y-2">
            <Square className="w-6 h-6 text-neutral-700" />
            <p>Select any element on the canvas to inspect and edit properties.</p>
          </div>
        )}
      </aside>
    </div>
  );
};
