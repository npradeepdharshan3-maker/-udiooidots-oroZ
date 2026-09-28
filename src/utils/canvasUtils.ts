import { CanvasAnnotation, CropState, PhotoAdjustments, TransformState } from '../types';

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  grain: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
};

export const DEFAULT_TRANSFORM: TransformState = {
  rotation: 0,
  flipH: false,
  flipV: false,
  scale: 1,
};

/**
 * Builds CSS filter string for basic accelerated properties
 */
export function buildCssFilter(adj: PhotoAdjustments): string {
  // exposure: -100..100 maps to 0..2x brightness
  const expFactor = 1 + adj.exposure / 100;
  // brightness: -100..100 maps to 0..2x
  const brightFactor = Math.max(0, (1 + adj.brightness / 100) * expFactor);
  // contrast: -100..100 maps to 0..2x
  const contrastFactor = Math.max(0, 1 + adj.contrast / 100);
  // saturation: -100..100 maps to 0..2x
  const satFactor = Math.max(0, 1 + adj.saturation / 100);
  // sepia: 0..100%
  const sepiaFactor = Math.max(0, Math.min(100, adj.sepia));
  // invert: 0..100%
  const invertFactor = Math.max(0, Math.min(100, adj.invert));
  // blur: 0..40px
  const blurPx = Math.max(0, adj.blur);
  // hue-rotate: 0..360deg
  const hueDeg = adj.hueRotate || 0;

  const filters: string[] = [];
  if (brightFactor !== 1) filters.push(`brightness(${brightFactor.toFixed(3)})`);
  if (contrastFactor !== 1) filters.push(`contrast(${contrastFactor.toFixed(3)})`);
  if (satFactor !== 1) filters.push(`saturate(${satFactor.toFixed(3)})`);
  if (sepiaFactor > 0) filters.push(`sepia(${sepiaFactor}%)`);
  if (invertFactor > 0) filters.push(`invert(${invertFactor}%)`);
  if (hueDeg !== 0) filters.push(`hue-rotate(${hueDeg}deg)`);
  if (blurPx > 0) filters.push(`blur(${blurPx}px)`);

  return filters.length ? filters.join(' ') : 'none';
}

/**
 * Applies high-fidelity pixel operations: Temperature, Tint, Highlights, Shadows, Vignette, Grain
 */
export function applyPixelEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adj: PhotoAdjustments
) {
  const needsPixelOps =
    adj.temperature !== 0 ||
    adj.tint !== 0 ||
    adj.highlights !== 0 ||
    adj.shadows !== 0 ||
    adj.vignette > 0 ||
    adj.grain > 0;

  if (!needsPixelOps) return;

  // 1. Temperature & Tint & Highlights/Shadows
  const needsColorTweak = adj.temperature !== 0 || adj.tint !== 0 || adj.highlights !== 0 || adj.shadows !== 0;
  if (needsColorTweak) {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const len = data.length;

      const tempR = adj.temperature * 0.4;
      const tempB = -adj.temperature * 0.4;
      const tintG = -adj.tint * 0.35;
      const tintM = adj.tint * 0.35; // magenta/pink

      const highFactor = adj.highlights * 0.5;
      const shadowFactor = adj.shadows * 0.5;

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Temp & Tint
        r += tempR + tintM * 0.5;
        g += tintG;
        b += tempB;

        // Highlights & Shadows
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance > 128) {
          // Highlight adjustment
          const hRatio = (luminance - 128) / 127;
          r += highFactor * hRatio;
          g += highFactor * hRatio;
          b += highFactor * hRatio;
        } else {
          // Shadow adjustment
          const sRatio = (128 - luminance) / 128;
          r += shadowFactor * sRatio;
          g += shadowFactor * sRatio;
          b += shadowFactor * sRatio;
        }

        data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
        data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Cross-origin image or context failure fallback
    }
  }

  // 2. Vignette
  if (adj.vignette > 0) {
    const radius = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * 0.3,
      width / 2,
      height / 2,
      radius
    );
    const alpha = (adj.vignette / 100) * 0.85;
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 3. Film Grain
  if (adj.grain > 0) {
    const grainCanvas = document.createElement('canvas');
    const grainW = Math.min(width, 400);
    const grainH = Math.min(height, 400);
    grainCanvas.width = grainW;
    grainCanvas.height = grainH;
    const gCtx = grainCanvas.getContext('2d');
    if (gCtx) {
      const gImgData = gCtx.createImageData(grainW, grainH);
      const gData = gImgData.data;
      const grainIntensity = (adj.grain / 100) * 60;
      for (let i = 0; i < gData.length; i += 4) {
        const noise = (Math.random() - 0.5) * grainIntensity;
        const val = 128 + noise;
        gData[i] = val;
        gData[i + 1] = val;
        gData[i + 2] = val;
        gData[i + 3] = (adj.grain / 100) * 110;
      }
      gCtx.putImageData(gImgData, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(grainCanvas, 0, 0, width, height);
      ctx.restore();
    }
  }
}

/**
 * Draws all annotations on the canvas
 */
export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: CanvasAnnotation[]
) {
  for (const ann of annotations) {
    ctx.save();
    ctx.globalAlpha = ann.opacity ?? 1;
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = ann.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (ann.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = (ann.opacity ?? 0.4) * 0.5;
    }

    if ((ann.tool === 'brush' || ann.tool === 'highlighter') && ann.points && ann.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        ctx.lineTo(ann.points[i].x, ann.points[i].y);
      }
      ctx.stroke();
    } else if (ann.tool === 'shape-rect' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
    } else if (ann.tool === 'shape-circle' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
      const rx = Math.abs(ann.width / 2);
      const ry = Math.abs(ann.height / 2);
      const cx = ann.x + ann.width / 2;
      const cy = ann.y + ann.height / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (ann.tool === 'shape-line' && ann.x !== undefined && ann.y !== undefined && ann.endX !== undefined && ann.endY !== undefined) {
      ctx.beginPath();
      ctx.moveTo(ann.x, ann.y);
      ctx.lineTo(ann.endX, ann.endY);
      ctx.stroke();
    } else if (ann.tool === 'shape-arrow' && ann.x !== undefined && ann.y !== undefined && ann.endX !== undefined && ann.endY !== undefined) {
      const headlen = 15 + ann.strokeWidth;
      const angle = Math.atan2(ann.endY - ann.y, ann.endX - ann.x);
      ctx.beginPath();
      ctx.moveTo(ann.x, ann.y);
      ctx.lineTo(ann.endX, ann.endY);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(ann.endX, ann.endY);
      ctx.lineTo(ann.endX - headlen * Math.cos(angle - Math.PI / 6), ann.endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ann.endX - headlen * Math.cos(angle + Math.PI / 6), ann.endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (ann.tool === 'text' && ann.text && ann.x !== undefined && ann.y !== undefined) {
      const fontSize = ann.fontSize || 32;
      const fontFam = ann.fontFamily || 'Plus Jakarta Sans';
      const weight = ann.fontWeight || '600';
      const style = ann.fontStyle || 'normal';
      ctx.font = `${style} ${weight} ${fontSize}px "${fontFam}", sans-serif`;

      const metrics = ctx.measureText(ann.text);
      const textWidth = metrics.width;
      const padX = Math.round(fontSize * 0.4);
      const padY = Math.round(fontSize * 0.25);
      const bgX = ann.x - padX;
      const bgY = ann.y - fontSize;
      const bgW = textWidth + padX * 2;
      const bgH = fontSize + padY * 2;

      // 1. Draw Background Badge / Pill if specified
      if (ann.backgroundColor) {
        ctx.save();
        ctx.fillStyle = ann.backgroundColor;
        if (ann.textBadgeStyle === 'pill') {
          const radius = bgH / 2;
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgW, bgH, radius);
          ctx.fill();
        } else if (ann.textBadgeStyle === 'box') {
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgW, bgH, 8);
          ctx.fill();
        } else if (ann.textBadgeStyle === 'gradient') {
          const grad = ctx.createLinearGradient(bgX, bgY, bgX + bgW, bgY);
          grad.addColorStop(0, '#f43f5e');
          grad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgW, bgH, 10);
          ctx.fill();
        } else {
          ctx.fillRect(bgX, bgY, bgW, bgH);
        }
        ctx.restore();
      }

      // 2. Neon Glow effect
      if (ann.textGlowColor) {
        ctx.save();
        ctx.shadowColor = ann.textGlowColor;
        ctx.shadowBlur = ann.textGlowBlur || 24;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, ann.x, ann.y);
        ctx.restore();
      }

      // 3. Shadow
      if (ann.shadow && !ann.textGlowColor) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = Math.round(fontSize * 0.25);
        ctx.shadowOffsetX = Math.round(fontSize * 0.06);
        ctx.shadowOffsetY = Math.round(fontSize * 0.08);
      }

      // 4. CapCut Pro Outer Stroke / Outline
      if (ann.textStrokeColor && ann.textStrokeWidth) {
        ctx.save();
        ctx.strokeStyle = ann.textStrokeColor;
        ctx.lineWidth = ann.textStrokeWidth;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(ann.text, ann.x, ann.y);
        ctx.restore();
      }

      // 5. Fill (Solid or Gradient)
      if (ann.textGradient === 'gold') {
        const goldGrad = ctx.createLinearGradient(ann.x, ann.y - fontSize, ann.x, ann.y);
        goldGrad.addColorStop(0, '#fef08a');
        goldGrad.addColorStop(0.5, '#f59e0b');
        goldGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = goldGrad;
      } else if (ann.textGradient === 'cyber') {
        const cyberGrad = ctx.createLinearGradient(ann.x, ann.y - fontSize, ann.x + textWidth, ann.y);
        cyberGrad.addColorStop(0, '#06b6d4');
        cyberGrad.addColorStop(0.5, '#3b82f6');
        cyberGrad.addColorStop(1, '#ec4899');
        ctx.fillStyle = cyberGrad;
      } else if (ann.textGradient === 'fire') {
        const fireGrad = ctx.createLinearGradient(ann.x, ann.y - fontSize, ann.x, ann.y);
        fireGrad.addColorStop(0, '#fef08a');
        fireGrad.addColorStop(0.5, '#f97316');
        fireGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = fireGrad;
      } else if (ann.textGradient === 'chrome') {
        const chromeGrad = ctx.createLinearGradient(ann.x, ann.y - fontSize, ann.x, ann.y);
        chromeGrad.addColorStop(0, '#ffffff');
        chromeGrad.addColorStop(0.48, '#e2e8f0');
        chromeGrad.addColorStop(0.52, '#64748b');
        chromeGrad.addColorStop(1, '#334155');
        ctx.fillStyle = chromeGrad;
      } else {
        ctx.fillStyle = ann.color;
      }

      ctx.fillText(ann.text, ann.x, ann.y);
    }
    ctx.restore();
  }
}

/**
 * Renders full image composition onto a target canvas at arbitrary scale
 */
export function renderCompositionToCanvas(
  targetCanvas: HTMLCanvasElement,
  img: HTMLImageElement,
  adj: PhotoAdjustments,
  transform: TransformState,
  annotations: CanvasAnnotation[],
  crop?: CropState,
  scaleFactor: number = 1
) {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // Determine base dimensions depending on crop
  const cropX = crop && crop.isActive ? crop.x : 0;
  const cropY = crop && crop.isActive ? crop.y : 0;
  const cropW = crop && crop.isActive ? crop.width : origW;
  const cropH = crop && crop.isActive ? crop.height : origH;

  const isRotated90 = Math.abs(transform.rotation) === 90 || Math.abs(transform.rotation) === 270;
  const destW = Math.round((isRotated90 ? cropH : cropW) * scaleFactor);
  const destH = Math.round((isRotated90 ? cropW : cropH) * scaleFactor);

  targetCanvas.width = destW;
  targetCanvas.height = destH;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, destW, destH);
  ctx.save();

  // Handle transforms (rotation, flip)
  ctx.translate(destW / 2, destH / 2);
  if (transform.rotation !== 0) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }
  if (transform.flipH || transform.flipV) {
    ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
  }

  // Draw image with CSS filter applied
  ctx.filter = buildCssFilter(adj);
  const drawW = Math.round((isRotated90 ? destH : destW));
  const drawH = Math.round((isRotated90 ? destW : destH));

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropW,
    cropH,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );

  ctx.filter = 'none';
  ctx.restore();

  // Apply pixel effects (vignette, grain, temp/tint)
  applyPixelEffects(ctx, destW, destH, adj);

  // Draw scaled annotations
  if (annotations.length > 0) {
    const scaleRatio = destW / cropW;
    const scaledAnnotations = annotations.map((ann) => {
      const scaled = { ...ann };
      scaled.strokeWidth = Math.max(1, ann.strokeWidth * scaleRatio);
      if (scaled.fontSize) scaled.fontSize = Math.round(scaled.fontSize * scaleRatio);
      if (scaled.x !== undefined) scaled.x = (scaled.x - cropX) * scaleRatio;
      if (scaled.y !== undefined) scaled.y = (scaled.y - cropY) * scaleRatio;
      if (scaled.width !== undefined) scaled.width = scaled.width * scaleRatio;
      if (scaled.height !== undefined) scaled.height = scaled.height * scaleRatio;
      if (scaled.endX !== undefined) scaled.endX = (scaled.endX - cropX) * scaleRatio;
      if (scaled.endY !== undefined) scaled.endY = (scaled.endY - cropY) * scaleRatio;
      if (scaled.points) {
        scaled.points = scaled.points.map((pt) => ({
          x: (pt.x - cropX) * scaleRatio,
          y: (pt.y - cropY) * scaleRatio,
        }));
      }
      return scaled;
    });
    drawAnnotations(ctx, scaledAnnotations);
  }
}
