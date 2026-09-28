import React from 'react';
import { AspectRatioType, CropState, TransformState } from '../../types';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Maximize2,
} from 'lucide-react';

interface CropTransformPanelProps {
  transform: TransformState;
  crop: CropState;
  onTransformChange: (transform: TransformState) => void;
  onCropChange: (crop: CropState) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  imageDimensions: { width: number; height: number };
}

export const CropTransformPanel: React.FC<CropTransformPanelProps> = ({
  transform,
  crop,
  onTransformChange,
  onCropChange,
  onApplyCrop,
  onCancelCrop,
  imageDimensions,
}) => {
  const aspectRatios: { id: AspectRatioType; label: string; ratio?: number }[] = [
    { id: 'free', label: 'Freeform' },
    { id: '1:1', label: '1:1 (Square)', ratio: 1 },
    { id: '4:5', label: '4:5 (Portrait)', ratio: 4 / 5 },
    { id: '16:9', label: '16:9 (Cinema)', ratio: 16 / 9 },
    { id: '9:16', label: '9:16 (Story)', ratio: 9 / 16 },
    { id: '4:3', label: '4:3 (Standard)', ratio: 4 / 3 },
    { id: '3:2', label: '3:2 (35mm)', ratio: 3 / 2 },
  ];

  const handleRatioSelect = (aspect: AspectRatioType) => {
    let newW = imageDimensions.width;
    let newH = imageDimensions.height;

    if (aspect === '1:1') {
      const minDim = Math.min(imageDimensions.width, imageDimensions.height);
      newW = minDim;
      newH = minDim;
    } else if (aspect === '4:5') {
      newW = Math.min(imageDimensions.width, Math.round(imageDimensions.height * (4 / 5)));
      newH = Math.round(newW * (5 / 4));
    } else if (aspect === '16:9') {
      newW = imageDimensions.width;
      newH = Math.min(imageDimensions.height, Math.round(imageDimensions.width * (9 / 16)));
      newW = Math.round(newH * (16 / 9));
    } else if (aspect === '9:16') {
      newW = Math.min(imageDimensions.width, Math.round(imageDimensions.height * (9 / 16)));
      newH = Math.round(newW * (16 / 9));
    } else if (aspect === '4:3') {
      newW = imageDimensions.width;
      newH = Math.min(imageDimensions.height, Math.round(imageDimensions.width * (3 / 4)));
    } else if (aspect === '3:2') {
      newW = imageDimensions.width;
      newH = Math.min(imageDimensions.height, Math.round(imageDimensions.width * (2 / 3)));
    }

    const cropX = Math.round((imageDimensions.width - newW) / 2);
    const cropY = Math.round((imageDimensions.height - newH) / 2);

    onCropChange({
      x: cropX,
      y: cropY,
      width: newW,
      height: newH,
      aspectRatio: aspect,
      isActive: true,
    });
  };

  const rotate90 = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    const newRot = (transform.rotation + delta + 360) % 360;
    onTransformChange({
      ...transform,
      rotation: newRot,
    });
  };

  const toggleFlip = (axis: 'h' | 'v') => {
    onTransformChange({
      ...transform,
      [axis === 'h' ? 'flipH' : 'flipV']: !transform[axis === 'h' ? 'flipH' : 'flipV'],
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden text-neutral-200">
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Transform & Rotation */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
            Orientation & Flip
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => rotate90('ccw')}
              className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-400 flex flex-col items-center gap-1.5 transition-colors"
              title="Rotate 90° CCW"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[10px] font-mono">-90°</span>
            </button>
            <button
              onClick={() => rotate90('cw')}
              className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-400 flex flex-col items-center gap-1.5 transition-colors"
              title="Rotate 90° CW"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[10px] font-mono">+90°</span>
            </button>
            <button
              onClick={() => toggleFlip('h')}
              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-colors ${
                transform.flipH
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                  : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400'
              }`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-[10px] font-mono">Flip H</span>
            </button>
            <button
              onClick={() => toggleFlip('v')}
              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-colors ${
                transform.flipV
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                  : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400'
              }`}
              title="Flip Vertical"
            >
              <FlipVertical className="w-4 h-4" />
              <span className="text-[10px] font-mono">Flip V</span>
            </button>
          </div>
        </div>

        {/* Fine rotation slider */}
        <div className="space-y-2 pt-2 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Angle Tilt</span>
            <span className="font-mono text-neutral-300">{transform.rotation}°</span>
          </div>
          <input
            type="range"
            min={-45}
            max={45}
            value={transform.rotation > 180 ? transform.rotation - 360 : transform.rotation}
            onChange={(e) =>
              onTransformChange({
                ...transform,
                rotation: parseInt(e.target.value),
              })
            }
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Aspect Ratio Presets */}
        <div className="space-y-3 pt-4 border-t border-neutral-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
              Aspect Ratio Presets
            </span>
            {crop.isActive && (
              <span className="text-[10px] text-rose-400 font-mono">Cropping Active</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((item) => {
              const isSelected = crop.isActive && crop.aspectRatio === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleRatioSelect(item.id)}
                  className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/10 text-white font-medium'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Crop Action Controls */}
        {crop.isActive && (
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Target Frame</span>
              <span className="font-mono text-neutral-300">
                {crop.width} × {crop.height} px
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancelCrop}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={onApplyCrop}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
