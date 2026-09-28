import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PhotoAdjustments,
  TransformState,
  CropState,
  AspectRatioType,
  CanvasAnnotation,
  CanvasTool,
  FilterPreset,
  PresetFilterId,
  SampleImage,
} from '../../types';
import { SAMPLE_IMAGES } from '../../data/sampleImages';
import { DEFAULT_ADJUSTMENTS, DEFAULT_TRANSFORM, renderCompositionToCanvas } from '../../utils/canvasUtils';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { FiltersPanel } from './FiltersPanel';
import { CropTransformPanel } from './CropTransformPanel';
import { AnnotationPanel } from './AnnotationPanel';
import { CapCutPanel } from './CapCutPanel';
import { ExifPanel } from './ExifPanel';
import { CapCutSticker } from '../../data/capcutItems';
import { CapCutTextStylePreset } from '../../data/capcutTextStyles';
import { ExifMetadata, parseExifFromFile, SAMPLE_EXIF_MAP } from '../../utils/exifParser';
import { soundEffects } from '../../utils/soundEffects';
import {
  Sliders,
  Sparkles,
  Crop,
  PenTool,
  Image as ImageIcon,
  Video,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  RotateCcw,
  Smartphone,
  Split,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

interface PhotoStudioProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  externalImageFile?: File | null;
  onClearExternalImageFile?: () => void;
  canvasExportRef?: React.MutableRefObject<HTMLCanvasElement | null>;
  currentAdjustments: PhotoAdjustments;
  setAdjustments: (adj: PhotoAdjustments) => void;
  activePresetId: PresetFilterId;
  setActivePresetId: (id: PresetFilterId) => void;
  transform: TransformState;
  setTransform: (t: TransformState) => void;
  annotations: CanvasAnnotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<CanvasAnnotation[]>>;
  crop: CropState;
  setCrop: (crop: CropState) => void;
  onRecordHistory: (name: string) => void;
  activeImage: HTMLImageElement | null;
  setActiveImage: (img: HTMLImageElement | null) => void;
  onOpenAppDownload?: () => void;
  onOpenAiEngine?: () => void;
}

export const PhotoStudio: React.FC<PhotoStudioProps> = ({
  onNotify,
  externalImageFile,
  onClearExternalImageFile,
  currentAdjustments,
  setAdjustments,
  activePresetId,
  setActivePresetId,
  transform,
  setTransform,
  annotations,
  setAnnotations,
  crop,
  setCrop,
  onRecordHistory,
  activeImage,
  setActiveImage,
  onOpenAppDownload,
  onOpenAiEngine,
}) => {
  // Navigation tabs in sidebar
  type SidebarTab = 'adjust' | 'filters' | 'crop' | 'draw' | 'capcut' | 'exif' | 'samples';
  const [activeTab, setActiveTab] = useState<SidebarTab>('adjust');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(true);

  // EXIF Metadata State
  const [exifData, setExifData] = useState<ExifMetadata | null>(SAMPLE_EXIF_MAP['nordic-mountains']);

  // Interactive tool states
  const [currentTool, setCurrentTool] = useState<CanvasTool>('cursor');
  const [currentColor, setCurrentColor] = useState<string>('#f43f5e');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [toolOpacity, setToolOpacity] = useState<number>(1);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<'off' | 'toggle' | 'split'>('off');
  const [compareSplitPos, setCompareSplitPos] = useState<number>(50); // percentage 0 - 100
  const isDraggingSplitRef = useRef<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Text overlay draft
  const [textConfig, setTextConfig] = useState({
    text: 'STUDIO EDIT',
    fontSize: 42,
    fontFamily: 'Outfit',
    hasBackground: false,
  });

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing in progress
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Load initial sample image if none loaded
  useEffect(() => {
    if (!activeImage) {
      const defaultSample = SAMPLE_IMAGES[0];
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = defaultSample.url;
      img.onload = () => {
        setActiveImage(img);
        setCrop({
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: 'free',
          isActive: false,
        });
      };
    }
  }, [activeImage, setActiveImage, setCrop]);

  // Handle external image file upload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text input or textarea
      if (
        ['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase() || '')
      ) {
        return;
      }

      // Spacebar hold to compare with original
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsComparing(true);
      } else if (e.key === '\\') {
        e.preventDefault();
        soundEffects.playTick();
        setCompareMode((prev) => (prev === 'toggle' ? 'off' : 'toggle'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsComparing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle external image file upload
  useEffect(() => {
    if (externalImageFile) {
      const url = URL.createObjectURL(externalImageFile);
      const img = new Image();
      img.onload = async () => {
        setActiveImage(img);
        setCrop({
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: 'free',
          isActive: false,
        });
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setTransform(DEFAULT_TRANSFORM);
        setAnnotations([]);
        setActivePresetId('normal');

        // Parse and populate EXIF metadata
        try {
          const parsed = await parseExifFromFile(externalImageFile);
          setExifData({
            ...parsed,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          });
        } catch {
          setExifData({
            fileName: externalImageFile.name,
            fileSizeBytes: externalImageFile.size,
            fileType: externalImageFile.type,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          });
        }

        onRecordHistory('Loaded new image');
        onNotify('success', 'Image Loaded with EXIF', externalImageFile.name);
        if (onClearExternalImageFile) onClearExternalImageFile();
      };
      img.src = url;
    }
  }, [
    externalImageFile,
    setActiveImage,
    setCrop,
    setAdjustments,
    setTransform,
    setAnnotations,
    setActivePresetId,
    onRecordHistory,
    onNotify,
    onClearExternalImageFile,
  ]);

  // Handle Drag and Drop on canvas
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        setActiveImage(img);
        setCrop({
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: 'free',
          isActive: false,
        });
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setTransform(DEFAULT_TRANSFORM);
        setAnnotations([]);

        try {
          const parsed = await parseExifFromFile(file);
          setExifData({
            ...parsed,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          });
        } catch {
          setExifData({
            fileName: file.name,
            fileSizeBytes: file.size,
            fileType: file.type,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          });
        }

        onRecordHistory('Dropped image');
        onNotify('success', 'Image Loaded with EXIF', file.name);
      };
      img.src = url;
    }
  };

  // Re-render canvas whenever image, adjustments, transform, annotations, crop, or compare mode changes
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !activeImage) return;

    const canvas = canvasRef.current;
    const isShowingOriginal = isComparing || compareMode === 'toggle';

    if (isShowingOriginal) {
      // Render pristine original without adjustments, crop, or annotations
      renderCompositionToCanvas(
        canvas,
        activeImage,
        DEFAULT_ADJUSTMENTS,
        DEFAULT_TRANSFORM,
        [],
        undefined,
        1
      );
      return;
    }

    if (compareMode === 'split') {
      // Create or use offscreen canvases to composite Before (left) & After (right)
      const offscreenOriginal = document.createElement('canvas');
      const offscreenEdited = document.createElement('canvas');

      renderCompositionToCanvas(
        offscreenOriginal,
        activeImage,
        DEFAULT_ADJUSTMENTS,
        DEFAULT_TRANSFORM,
        [],
        crop,
        1
      );

      renderCompositionToCanvas(
        offscreenEdited,
        activeImage,
        currentAdjustments,
        transform,
        annotations,
        crop,
        1
      );

      const w = offscreenEdited.width;
      const h = offscreenEdited.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Edited ("After") as base full image
      ctx.drawImage(offscreenEdited, 0, 0);

      // 2. Draw Original ("Before") on the left side up to the split position
      const splitX = Math.round((w * Math.max(0, Math.min(100, compareSplitPos))) / 100);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      ctx.drawImage(offscreenOriginal, 0, 0);
      ctx.restore();

      // 3. Draw vertical divider bar with subtle glow line
      ctx.save();
      // Divider shadow / contrast line
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Divider main white / bright line
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Central divider handle circle
      const handleY = h / 2;
      const radius = Math.min(22, Math.max(14, Math.round(w * 0.015)));

      ctx.beginPath();
      ctx.arc(splitX, handleY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#f43f5e';
      ctx.stroke();

      // Handle double arrow arrows icon
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(radius * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◂ ▸', splitX, handleY);

      // "BEFORE" & "AFTER" watermark badges on canvas
      const badgeY = Math.max(28, Math.round(h * 0.05));
      const badgeFontSize = Math.max(12, Math.min(18, Math.round(w * 0.014)));
      ctx.font = `bold ${badgeFontSize}px "Outfit", sans-serif`;

      // BEFORE badge (left)
      if (splitX > 90) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect(16, badgeY - 14, 80, 26, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'left';
        ctx.fillText('BEFORE', 26, badgeY + 3);
      }

      // AFTER badge (right)
      if (w - splitX > 90) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect(w - 96, badgeY - 14, 80, 26, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('AFTER', w - 82, badgeY + 3);
      }

      ctx.restore();
      return;
    }

    // Default regular edit mode
    renderCompositionToCanvas(
      canvas,
      activeImage,
      currentAdjustments,
      transform,
      annotations,
      crop,
      1
    );
  }, [
    activeImage,
    currentAdjustments,
    transform,
    annotations,
    crop,
    isComparing,
    compareMode,
    compareSplitPos,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Preset Selection
  const handleSelectPreset = (preset: FilterPreset) => {
    setActivePresetId(preset.id);
    const newAdj: PhotoAdjustments = {
      ...DEFAULT_ADJUSTMENTS,
      ...preset.adjustments,
    };
    setAdjustments(newAdj);
    soundEffects.playTick();
    onRecordHistory(`Filter: ${preset.name}`);
    onNotify('info', `Preset Applied: ${preset.name}`);
  };

  // Adjustments Change
  const handleAdjustmentsChange = (newAdj: PhotoAdjustments) => {
    setAdjustments(newAdj);
    setActivePresetId('normal');
  };

  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActivePresetId('normal');
    onRecordHistory('Reset adjustments');
    onNotify('info', 'Adjustments Reset', 'All sliders returned to baseline.');
  };

  // Sample Image Selection
  const handleLoadSample = (sample: SampleImage) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sample.url;
    img.onload = () => {
      setActiveImage(img);
      setCrop({
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: 'free',
        isActive: false,
      });
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setTransform(DEFAULT_TRANSFORM);
      setAnnotations([]);
      setActivePresetId('normal');

      // Set sample EXIF metadata
      const knownExif = SAMPLE_EXIF_MAP[sample.id];
      if (knownExif) {
        setExifData({
          ...knownExif,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        });
      } else {
        setExifData({
          fileName: `${sample.id}.jpg`,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          fileType: 'image/jpeg',
          dateTimeOriginal: '2025-01-15 12:00:00',
        });
      }

      onRecordHistory(`Sample: ${sample.title}`);
      onNotify('success', 'Sample Image Loaded', `${sample.title} by ${sample.author}`);
    };
  };

  // Convert mouse event coordinates to Canvas natural image coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Canvas Mouse Events for Annotations & Drawings & Split Slider Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeImage) return;

    // Check if dragging split slider in split compare mode
    if (compareMode === 'split') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const clickPercent = ((e.clientX - rect.left) / rect.width) * 100;
        setCompareSplitPos(Math.max(0, Math.min(100, Math.round(clickPercent))));
        isDraggingSplitRef.current = true;
        return;
      }
    }

    if (currentTool === 'cursor') return;
    const coords = getCanvasCoords(e);
    isDrawingRef.current = true;
    startPosRef.current = coords;

    if (currentTool === 'brush' || currentTool === 'highlighter') {
      currentPathRef.current = [coords];
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeImage) return;

    if (compareMode === 'split' && isDraggingSplitRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        setCompareSplitPos(Math.max(0, Math.min(100, Math.round(percent))));
        return;
      }
    }

    if (!isDrawingRef.current || currentTool === 'cursor') return;
    const coords = getCanvasCoords(e);

    if (currentTool === 'brush' || currentTool === 'highlighter') {
      currentPathRef.current.push(coords);
      // Quick live preview on canvas
      renderCanvas();
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && currentPathRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = currentTool === 'highlighter' ? toolOpacity * 0.4 : toolOpacity;
        ctx.beginPath();
        ctx.moveTo(currentPathRef.current[0].x, currentPathRef.current[0].y);
        for (let i = 1; i < currentPathRef.current.length; i++) {
          ctx.lineTo(currentPathRef.current[i].x, currentPathRef.current[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    } else if (
      currentTool === 'shape-rect' ||
      currentTool === 'shape-circle' ||
      currentTool === 'shape-arrow' ||
      currentTool === 'shape-line'
    ) {
      // Shape dragging preview
      renderCanvas();
      const ctx = canvasRef.current?.getContext('2d');
      const start = startPosRef.current;
      if (ctx && start) {
        ctx.save();
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = toolOpacity;

        if (currentTool === 'shape-rect') {
          ctx.strokeRect(start.x, start.y, coords.x - start.x, coords.y - start.y);
        } else if (currentTool === 'shape-circle') {
          const rx = Math.abs((coords.x - start.x) / 2);
          const ry = Math.abs((coords.y - start.y) / 2);
          const cx = Math.min(start.x, coords.x) + rx;
          const cy = Math.min(start.y, coords.y) + ry;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (currentTool === 'shape-line' || currentTool === 'shape-arrow') {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingSplitRef.current) {
      isDraggingSplitRef.current = false;
      return;
    }

    if (!isDrawingRef.current || !activeImage || currentTool === 'cursor') return;
    isDrawingRef.current = false;
    const endCoords = getCanvasCoords(e);
    const start = startPosRef.current;

    if ((currentTool === 'brush' || currentTool === 'highlighter') && currentPathRef.current.length > 1) {
      const newAnn: CanvasAnnotation = {
        id: `ann-${Date.now()}`,
        tool: currentTool,
        points: [...currentPathRef.current],
        color: currentColor,
        strokeWidth,
        opacity: toolOpacity,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      onRecordHistory('Brush stroke');
    } else if (start) {
      const w = endCoords.x - start.x;
      const h = endCoords.y - start.y;
      if (Math.abs(w) > 4 || Math.abs(h) > 4) {
        const newAnn: CanvasAnnotation = {
          id: `shape-${Date.now()}`,
          tool: currentTool,
          x: Math.min(start.x, endCoords.x),
          y: Math.min(start.y, endCoords.y),
          width: Math.abs(w),
          height: Math.abs(h),
          endX: endCoords.x,
          endY: endCoords.y,
          color: currentColor,
          strokeWidth,
          opacity: toolOpacity,
        };
        setAnnotations((prev) => [...prev, newAnn]);
        onRecordHistory(`Shape: ${currentTool}`);
      }
    }

    currentPathRef.current = [];
    startPosRef.current = null;
  };

  // Add Centered Text Annotation
  const handleAddTextCenter = () => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const newAnn: CanvasAnnotation = {
      id: `text-${Date.now()}`,
      tool: 'text',
      text: textConfig.text,
      fontSize: textConfig.fontSize,
      fontFamily: textConfig.fontFamily,
      fontWeight: '700',
      color: currentColor,
      x: Math.round(w / 4),
      y: Math.round(h / 2),
      opacity: toolOpacity,
      backgroundColor: textConfig.hasBackground ? 'rgba(0,0,0,0.75)' : undefined,
      shadow: true,
      strokeWidth: 2,
    };
    setAnnotations((prev) => [...prev, newAnn]);
    onRecordHistory('Added text layer');
    onNotify('success', 'Text Overlay Added', textConfig.text);
  };

  // Apply Crop Action
  const handleApplyCrop = () => {
    if (!crop.isActive || !activeImage) return;
    // Create new cropped image bitmap or canvas
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = crop.width;
    cropCanvas.height = crop.height;
    const ctx = cropCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        activeImage,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      const newImg = new Image();
      newImg.src = cropCanvas.toDataURL();
      newImg.onload = () => {
        setActiveImage(newImg);
        setCrop({
          x: 0,
          y: 0,
          width: crop.width,
          height: crop.height,
          aspectRatio: 'free',
          isActive: false,
        });
        onRecordHistory('Applied crop');
        onNotify('success', 'Image Cropped', `${crop.width} × ${crop.height} px`);
      };
    }
  };

  const handleCancelCrop = () => {
    if (!activeImage) return;
    setCrop({
      x: 0,
      y: 0,
      width: activeImage.naturalWidth,
      height: activeImage.naturalHeight,
      aspectRatio: 'free',
      isActive: false,
    });
  };

  // CapCut Pro Actions
  const handleApplyCapCutColorPreset = (name: string, presetAdjustments: Partial<PhotoAdjustments>) => {
    setAdjustments({
      ...DEFAULT_ADJUSTMENTS,
      ...presetAdjustments,
    });
    onRecordHistory(`CapCut Grade: ${name}`);
    onNotify('success', `CapCut Grade Applied`, name);
  };

  const handleSetCapCutRatio = (aspect: AspectRatioType, name: string) => {
    if (!activeImage) return;
    const origW = activeImage.naturalWidth || activeImage.width;
    const origH = activeImage.naturalHeight || activeImage.height;

    let targetW = origW;
    let targetH = origH;

    if (aspect === '9:16') {
      targetW = Math.min(origW, Math.round(origH * (9 / 16)));
      targetH = Math.round(targetW * (16 / 9));
    } else if (aspect === '16:9') {
      targetW = origW;
      targetH = Math.min(origH, Math.round(origW * (9 / 16)));
      targetW = Math.round(targetH * (16 / 9));
    } else if (aspect === '1:1') {
      const minDim = Math.min(origW, origH);
      targetW = minDim;
      targetH = minDim;
    } else if (aspect === '4:5') {
      targetW = Math.min(origW, Math.round(origH * (4 / 5)));
      targetH = Math.round(targetW * (5 / 4));
    }

    const cropX = Math.max(0, Math.round((origW - targetW) / 2));
    const cropY = Math.max(0, Math.round((origH - targetH) / 2));

    setCrop({
      x: cropX,
      y: cropY,
      width: targetW,
      height: targetH,
      aspectRatio: aspect,
      isActive: true,
    });
    onRecordHistory(`CapCut Crop: ${name}`);
    onNotify('info', `CapCut Frame Selected: ${name}`, `${targetW} × ${targetH}`);
  };

  const handleAddCapCutSticker = (sticker: CapCutSticker) => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    const newAnn: CanvasAnnotation = {
      id: `cc-sticker-${Date.now()}`,
      tool: 'text',
      text: sticker.label ? `${sticker.emoji} ${sticker.label}` : sticker.emoji,
      fontSize: sticker.label ? 28 : 56,
      fontFamily: 'Outfit',
      fontWeight: '700',
      color: sticker.color || '#ffffff',
      x: Math.round(w / 2 - (sticker.label ? 100 : 30)),
      y: Math.round(h / 2),
      opacity: 1,
      backgroundColor: sticker.label ? 'rgba(0,0,0,0.85)' : undefined,
      shadow: true,
      strokeWidth: 2,
    };

    setAnnotations((prev) => [...prev, newAnn]);
    onRecordHistory(`Sticker: ${sticker.name}`);
    onNotify('success', `Added CapCut Item`, sticker.name);
  };

  const handleAddCinematicBars = () => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const barHeight = Math.round(h * 0.12);

    const topBar: CanvasAnnotation = {
      id: `cinematic-bar-top-${Date.now()}`,
      tool: 'shape-rect',
      x: 0,
      y: 0,
      width: w,
      height: barHeight,
      color: '#000000',
      strokeWidth: barHeight,
      opacity: 1,
    };

    const bottomBar: CanvasAnnotation = {
      id: `cinematic-bar-bottom-${Date.now()}`,
      tool: 'shape-rect',
      x: 0,
      y: h - barHeight,
      width: w,
      height: barHeight,
      color: '#000000',
      strokeWidth: barHeight,
      opacity: 1,
    };

    setAnnotations((prev) => [...prev, topBar, bottomBar]);
    onRecordHistory('CapCut 2.35:1 Cinematic Bars');
    onNotify('success', 'Cinematic Bars Added');
  };

  const handleAddVhsOverlay = () => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    const recIndicator: CanvasAnnotation = {
      id: `vhs-rec-${Date.now()}`,
      tool: 'text',
      text: '● REC  [SP]  00:04:18:22',
      fontSize: Math.max(16, Math.round(w * 0.024)),
      fontFamily: 'JetBrains Mono',
      fontWeight: '700',
      color: '#f43f5e',
      x: Math.round(w * 0.05),
      y: Math.round(h * 0.08),
      opacity: 0.95,
      shadow: true,
      strokeWidth: 2,
    };

    const timestamp: CanvasAnnotation = {
      id: `vhs-time-${Date.now()}`,
      tool: 'text',
      text: 'SEP 27 2026  PM 09:42:15',
      fontSize: Math.max(16, Math.round(w * 0.022)),
      fontFamily: 'JetBrains Mono',
      fontWeight: '600',
      color: '#facc15',
      x: Math.round(w * 0.05),
      y: Math.round(h * 0.94),
      opacity: 0.9,
      shadow: true,
      strokeWidth: 2,
    };

    setAnnotations((prev) => [...prev, recIndicator, timestamp]);
    onRecordHistory('CapCut VHS Camcorder HUD');
    onNotify('success', 'VHS Overlay Added');
  };

  const handleAddSubtitlesOverlay = (text: string) => {
    if (!canvasRef.current || !text) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    const subtitle: CanvasAnnotation = {
      id: `subtitles-${Date.now()}`,
      tool: 'text',
      text: text.toUpperCase(),
      fontSize: Math.max(22, Math.round(w * 0.045)),
      fontFamily: 'Outfit',
      fontWeight: '800',
      color: '#facc15', // Iconic yellow TikTok subtitle
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      x: Math.round(w * 0.15),
      y: Math.round(h * 0.82),
      opacity: 1,
      shadow: true,
      strokeWidth: 3,
    };

    setAnnotations((prev) => [...prev, subtitle]);
    onRecordHistory('CapCut Viral Caption');
    onNotify('success', 'Caption Overlay Added');
  };

  const handleAddCapCutProText = (preset: CapCutTextStylePreset, customText: string) => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    const contentText = customText.trim() || preset.previewText;
    const fontSize = preset.style.fontSize
      ? Math.round(preset.style.fontSize * (w / 1200))
      : Math.round(w * 0.045);

    const newAnnotation: CanvasAnnotation = {
      id: `cc-pro-text-${Date.now()}`,
      tool: 'text',
      text: contentText,
      color: preset.style.color || '#ffffff',
      fontSize: Math.max(24, fontSize),
      fontFamily: preset.style.fontFamily || 'Outfit',
      fontWeight: preset.style.fontWeight || '800',
      fontStyle: preset.style.fontStyle || 'normal',
      strokeWidth: preset.style.strokeWidth || 3,
      opacity: 1,
      x: Math.round(w * 0.12),
      y: Math.round(h * 0.5),
      // CapCut Pro Styles
      textStrokeColor: preset.style.textStrokeColor,
      textStrokeWidth: preset.style.textStrokeWidth
        ? Math.round(preset.style.textStrokeWidth * (w / 1200))
        : undefined,
      textGlowColor: preset.style.textGlowColor,
      textGlowBlur: preset.style.textGlowBlur,
      textGradient: preset.style.textGradient,
      backgroundColor: preset.style.backgroundColor,
      textBadgeStyle: preset.style.textBadgeStyle,
      shadow: preset.style.shadow,
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    soundEffects.playStamp();
    onRecordHistory(`CapCut Pro Text: ${preset.name}`);
    onNotify('success', `CapCut Pro Text Added`, `${preset.name} applied to canvas`);
  };

  const imgDimensions = activeImage
    ? { width: activeImage.naturalWidth || activeImage.width, height: activeImage.naturalHeight || activeImage.height }
    : { width: 1920, height: 1080 };

  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-950">
      {/* Primary Left Navigation Rail */}
      <aside className="w-14 border-r border-neutral-800/80 bg-neutral-950 flex flex-col items-center py-3 gap-2 select-none shrink-0 z-10">
        <button
          onClick={() => setActiveTab('adjust')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'adjust'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Tone & Color Adjustments"
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[9px] font-medium">Tune</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'filters'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Color Grading Presets"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px] font-medium">Filters</span>
        </button>

        <button
          onClick={() => setActiveTab('crop')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'crop'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Crop & Geometry"
        >
          <Crop className="w-4 h-4" />
          <span className="text-[9px] font-medium">Crop</span>
        </button>

        <button
          onClick={() => setActiveTab('draw')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'draw'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Draw & Annotate"
        >
          <PenTool className="w-4 h-4" />
          <span className="text-[9px] font-medium">Mark</span>
        </button>

        <button
          onClick={() => setActiveTab('capcut')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'capcut'
              ? 'bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-rose-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="CapCut Viral Suite (Color Grading, Stickers & Overlays)"
        >
          <Video className="w-4 h-4 text-cyan-400" />
          <span className="text-[9px] font-bold tracking-tight">CapCut</span>
        </button>

        <button
          onClick={() => setActiveTab('exif')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'exif'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="EXIF & Camera Metadata (Camera, Shutter, ISO, Date)"
        >
          <Info className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] font-medium">EXIF</span>
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'samples'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Sample Library"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[9px] font-medium">Photos</span>
        </button>
      </aside>

      {/* Secondary Drawer / Panel */}
      <section className="w-72 sm:w-80 border-r border-neutral-800/80 bg-neutral-900/60 flex flex-col shrink-0 overflow-hidden">
        {activeTab === 'adjust' && (
          <AdjustmentsPanel
            adjustments={currentAdjustments}
            onChange={handleAdjustmentsChange}
            onReset={handleResetAdjustments}
          />
        )}
        {activeTab === 'filters' && (
          <FiltersPanel
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />
        )}
        {activeTab === 'crop' && (
          <CropTransformPanel
            transform={transform}
            crop={crop}
            onTransformChange={setTransform}
            onCropChange={setCrop}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
            imageDimensions={imgDimensions}
          />
        )}
        {activeTab === 'draw' && (
          <AnnotationPanel
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            currentColor={currentColor}
            onColorChange={setCurrentColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            opacity={toolOpacity}
            onOpacityChange={setToolOpacity}
            annotationsCount={annotations.length}
            onClearAnnotations={() => {
              setAnnotations([]);
              onRecordHistory('Cleared annotations');
            }}
            textConfig={textConfig}
            onTextConfigChange={setTextConfig}
            onAddTextToCenter={handleAddTextCenter}
          />
        )}
        {activeTab === 'capcut' && (
          <CapCutPanel
            adjustments={currentAdjustments}
            onApplyColorPreset={handleApplyCapCutColorPreset}
            onSetAspectRatio={handleSetCapCutRatio}
            onAddStickerAnnotation={handleAddCapCutSticker}
            onAddCinematicBars={handleAddCinematicBars}
            onAddVhsOverlay={handleAddVhsOverlay}
            onAddSubtitlesOverlay={handleAddSubtitlesOverlay}
            onAddCapCutProText={handleAddCapCutProText}
            onNotify={onNotify}
          />
        )}
        {activeTab === 'exif' && (
          <ExifPanel
            metadata={exifData}
            imageDimensions={imgDimensions}
            onNotify={onNotify}
          />
        )}
        {activeTab === 'samples' && (
          <div className="h-full flex flex-col overflow-hidden text-neutral-200">
            <div className="p-3 border-b border-neutral-800/80 bg-neutral-900/40">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Sample Library
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Curated high-resolution photo assets
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {SAMPLE_IMAGES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-rose-500/50 cursor-pointer transition-all shadow-md"
                >
                  <img
                    src={sample.thumbnail}
                    alt={sample.title}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-xs font-semibold text-white">{sample.title}</span>
                    <span className="text-[10px] text-neutral-400">Photo by {sample.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Main Canvas Viewport Area */}
      <main
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex-1 flex flex-col relative overflow-hidden bg-neutral-950"
      >
        {/* Top Viewport Utility Bar */}
        <div className="h-10 px-4 border-b border-neutral-800/60 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-between text-xs select-none z-10 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.25, z - 0.15))}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-neutral-300 min-w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((z) => Math.min(3, z + 0.15))}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(1)}
              className="px-1.5 py-0.5 rounded text-[10px] text-neutral-400 hover:text-white transition-colors font-mono"
              title="Reset Zoom (100%)"
            >
              Fit
            </button>
          </div>

          {/* Quick info & Image Resolution */}
          <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-[11px]">
            {exifData && (exifData.aperture || exifData.shutterSpeed || exifData.iso) && (
              <button
                onClick={() => setActiveTab('exif')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-300 font-mono text-[10px] transition-colors"
                title="Click to inspect full EXIF metadata"
              >
                <span>{exifData.focalLength || '35mm'}</span>
                <span>·</span>
                <span>{exifData.aperture || 'ƒ/2.8'}</span>
                <span>·</span>
                <span>{exifData.shutterSpeed || '1/250s'}</span>
                <span>·</span>
                <span>ISO {exifData.iso || 100}</span>
              </button>
            )}
            <span className="font-mono text-neutral-400">
              {imgDimensions.width} × {imgDimensions.height} px
            </span>
            {activePresetId !== 'normal' && (
              <>
                <span aria-hidden="true" className="text-neutral-700">·</span>
                <span className="text-rose-400 font-medium">Preset: {activePresetId}</span>
              </>
            )}
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2">
            {onOpenAiEngine && (
              <button
                onClick={onOpenAiEngine}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-rose-900/60 to-purple-900/60 hover:from-rose-800/80 hover:to-purple-800/80 border border-rose-500/40 text-rose-300 hover:text-white transition-all shadow-sm active:scale-95"
                title="Launch Gemini AI Engine (Auto-Enhance, Critique, Captions)"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>AI Auto-Enhance</span>
              </button>
            )}

            {onOpenAppDownload && (
              <button
                onClick={onOpenAppDownload}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-rose-300 hover:text-white transition-all shadow-sm"
                title="Download Zoro. Studio App for mobile & desktop"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                <span>Get Mobile App</span>
              </button>
            )}

            {/* Before/After Comparison Suite */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 shadow-sm">
              {/* Split Slider View Toggle Button */}
              <button
                onClick={() => {
                  soundEffects.playTick();
                  setCompareMode((prev) => (prev === 'split' ? 'off' : 'split'));
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  compareMode === 'split'
                    ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
                title="Interactive Before/After split comparison slider"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Split Slider</span>
              </button>

              {/* Instant Before/After Toggle Button */}
              <button
                onClick={() => {
                  soundEffects.playTick();
                  setCompareMode((prev) => (prev === 'toggle' ? 'off' : 'toggle'));
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  compareMode === 'toggle'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
                title="Click to toggle between Original and Edited image"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{compareMode === 'toggle' ? 'Showing Original' : 'Toggle Before'}</span>
              </button>

              {/* Hold to Compare Button */}
              <button
                onMouseDown={() => setIsComparing(true)}
                onMouseUp={() => setIsComparing(false)}
                onMouseLeave={() => setIsComparing(false)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isComparing
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
                title="Hold down mouse/touch to preview original unedited photo (or press Space)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{isComparing ? 'Original' : 'Hold'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Display Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 canvas-checkerboard relative">
          {/* Split Mode Slider Floating Bar */}
          {compareMode === 'split' && (
            <div className="absolute top-4 z-20 flex items-center gap-3 px-3 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 shadow-xl text-xs">
              <span className="text-[11px] font-bold text-amber-400 font-mono tracking-wider">BEFORE</span>
              <input
                type="range"
                min="0"
                max="100"
                value={compareSplitPos}
                onChange={(e) => setCompareSplitPos(Number(e.target.value))}
                className="w-36 accent-rose-500 cursor-ew-resize"
                title="Drag split position"
              />
              <span className="text-[11px] font-bold text-sky-400 font-mono tracking-wider">AFTER</span>
              <span className="text-[10px] text-neutral-400 font-mono pl-1 border-l border-neutral-800">
                {compareSplitPos}%
              </span>
              <button
                onClick={() => setCompareMode('off')}
                className="ml-1 p-0.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
                title="Exit split comparison"
              >
                ✕
              </button>
            </div>
          )}

          {/* Toggle Mode Active Floating Indicator */}
          {compareMode === 'toggle' && (
            <div className="absolute top-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/50 shadow-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-300">Showing Original (Unedited)</span>
              <button
                onClick={() => setCompareMode('off')}
                className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 text-[11px] font-medium transition-colors"
              >
                Show Edits
              </button>
            </div>
          )}

          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
            }}
            className="shadow-2xl rounded-sm overflow-hidden border border-neutral-800/80 relative"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`block max-h-[76vh] max-w-[70vw] object-contain select-none ${
                compareMode === 'split'
                  ? 'cursor-ew-resize'
                  : currentTool !== 'cursor'
                  ? 'cursor-crosshair'
                  : 'cursor-default'
              }`}
            />

            {/* Interactive Crop Frame Overlay if Active */}
            {crop.isActive && canvasRef.current && (
              <div
                className="absolute inset-0 pointer-events-none border-2 border-rose-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                style={{
                  left: `${(crop.x / (activeImage?.naturalWidth || 1)) * 100}%`,
                  top: `${(crop.y / (activeImage?.naturalHeight || 1)) * 100}%`,
                  width: `${(crop.width / (activeImage?.naturalWidth || 1)) * 100}%`,
                  height: `${(crop.height / (activeImage?.naturalHeight || 1)) * 100}%`,
                }}
              >
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-rose-500/40" />
                  <div className="border-r border-b border-rose-500/40" />
                  <div className="border-b border-rose-500/40" />
                  <div className="border-r border-b border-rose-500/40" />
                  <div className="border-r border-b border-rose-500/40" />
                  <div className="border-b border-rose-500/40" />
                  <div className="border-r border-rose-500/40" />
                  <div className="border-r border-rose-500/40" />
                  <div />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
