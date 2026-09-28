export interface ExifMetadata {
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: string;
  focalLengthIn35mm?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  exposureProgram?: string;
  exposureCompensation?: string;
  meteringMode?: string;
  flash?: string;
  whiteBalance?: string;
  dateTimeOriginal?: string;
  dimensions?: { width: number; height: number };
  colorSpace?: string;
  fileSizeBytes?: number;
  fileName?: string;
  fileType?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    locationName?: string;
  };
}

/**
 * Known metadata catalogue for curated sample images
 */
export const SAMPLE_EXIF_MAP: Record<string, ExifMetadata> = {
  'nordic-mountains': {
    cameraMake: 'Sony',
    cameraModel: 'ILCE-7RM3 (Alpha 7R III)',
    lensModel: 'FE 16-35mm F2.8 GM',
    focalLength: '24 mm',
    focalLengthIn35mm: '24 mm',
    aperture: 'ƒ/8.0',
    shutterSpeed: '1/320s',
    iso: 100,
    exposureProgram: 'Aperture Priority',
    exposureCompensation: '0.0 EV',
    meteringMode: 'Multi-segment',
    flash: 'Off, did not fire',
    whiteBalance: 'Daylight (5500K)',
    dateTimeOriginal: '2024-08-14 06:42:18',
    dimensions: { width: 1600, height: 1067 },
    colorSpace: 'sRGB',
    fileSizeBytes: 2420000,
    fileName: 'alpine-vista-dolomites.jpg',
    fileType: 'image/jpeg',
    gps: {
      latitude: 46.5405,
      longitude: 11.8742,
      altitude: 2240,
      locationName: 'Dolomites, South Tyrol, Italy',
    },
  },
  'studio-portrait': {
    cameraMake: 'Canon',
    cameraModel: 'Canon EOS R5',
    lensModel: 'RF 85mm F1.2 L USM',
    focalLength: '85 mm',
    focalLengthIn35mm: '85 mm',
    aperture: 'ƒ/2.0',
    shutterSpeed: '1/200s',
    iso: 160,
    exposureProgram: 'Manual',
    exposureCompensation: '-0.3 EV',
    meteringMode: 'Spot',
    flash: 'Studio Strobe Fired',
    whiteBalance: 'Custom (5600K)',
    dateTimeOriginal: '2025-02-18 14:15:02',
    dimensions: { width: 1600, height: 2400 },
    colorSpace: 'Display P3',
    fileSizeBytes: 3180000,
    fileName: 'high-fashion-studio.jpg',
    fileType: 'image/jpeg',
    gps: {
      locationName: 'SoHo Creative Loft, New York',
    },
  },
  'tokyo-neon': {
    cameraMake: 'Fujifilm',
    cameraModel: 'X-T4',
    lensModel: 'XF 35mm F1.4 R',
    focalLength: '35 mm',
    focalLengthIn35mm: '53 mm',
    aperture: 'ƒ/1.4',
    shutterSpeed: '1/60s',
    iso: 1600,
    exposureProgram: 'Aperture Priority',
    exposureCompensation: '-0.7 EV',
    meteringMode: 'Center-weighted average',
    flash: 'Off, did not fire',
    whiteBalance: 'Incandescent (3200K)',
    dateTimeOriginal: '2024-11-23 21:55:40',
    dimensions: { width: 1600, height: 1067 },
    colorSpace: 'sRGB',
    fileSizeBytes: 2890000,
    fileName: 'shinjuku-neon-rain.jpg',
    fileType: 'image/jpeg',
    gps: {
      latitude: 35.6938,
      longitude: 139.7034,
      locationName: 'Kabukicho, Shinjuku, Tokyo',
    },
  },
  'minimalist-arch': {
    cameraMake: 'Leica',
    cameraModel: 'Leica Q2',
    lensModel: 'Summilux 28mm f/1.7 ASPH.',
    focalLength: '28 mm',
    focalLengthIn35mm: '28 mm',
    aperture: 'ƒ/5.6',
    shutterSpeed: '1/500s',
    iso: 50,
    exposureProgram: 'Aperture Priority',
    exposureCompensation: '+0.3 EV',
    meteringMode: 'Multi-segment',
    flash: 'Off, did not fire',
    whiteBalance: 'Auto',
    dateTimeOriginal: '2024-05-10 11:20:19',
    dimensions: { width: 1600, height: 1200 },
    colorSpace: 'Adobe RGB',
    fileSizeBytes: 2150000,
    fileName: 'brutalist-facade-berlin.jpg',
    fileType: 'image/jpeg',
    gps: {
      latitude: 52.52,
      longitude: 13.405,
      locationName: 'Mitte, Berlin, Germany',
    },
  },
  'golden-hour-coast': {
    cameraMake: 'Nikon',
    cameraModel: 'Nikon Z8',
    lensModel: 'NIKKOR Z 24-70mm f/2.8 S',
    focalLength: '38 mm',
    focalLengthIn35mm: '38 mm',
    aperture: 'ƒ/11.0',
    shutterSpeed: '1/80s',
    iso: 64,
    exposureProgram: 'Manual',
    exposureCompensation: '0.0 EV',
    meteringMode: 'Highlight-weighted',
    flash: 'Off, did not fire',
    whiteBalance: 'Shade (7000K)',
    dateTimeOriginal: '2025-06-03 19:48:32',
    dimensions: { width: 1600, height: 1067 },
    colorSpace: 'sRGB',
    fileSizeBytes: 2950000,
    fileName: 'big-sur-sunset.jpg',
    fileType: 'image/jpeg',
    gps: {
      latitude: 36.2704,
      longitude: -121.8081,
      altitude: 120,
      locationName: 'Pacific Coast, Big Sur, CA',
    },
  },
  'botanical-macro': {
    cameraMake: 'Canon',
    cameraModel: 'Canon EOS R6 Mark II',
    lensModel: 'RF 100mm F2.8 L Macro IS USM',
    focalLength: '100 mm',
    focalLengthIn35mm: '100 mm',
    aperture: 'ƒ/3.5',
    shutterSpeed: '1/125s',
    iso: 400,
    exposureProgram: 'Aperture Priority',
    exposureCompensation: '-0.3 EV',
    meteringMode: 'Spot',
    flash: 'Off, did not fire',
    whiteBalance: 'Daylight',
    dateTimeOriginal: '2025-04-12 10:05:44',
    dimensions: { width: 1600, height: 1067 },
    colorSpace: 'sRGB',
    fileSizeBytes: 2600000,
    fileName: 'monstera-leaf-dew.jpg',
    fileType: 'image/jpeg',
  },
};

/**
 * Pure client-side binary parser for standard JPEG APP1 Exif segments
 */
export async function parseExifFromFile(file: File): Promise<Partial<ExifMetadata>> {
  try {
    const buffer = await file.slice(0, 131072).arrayBuffer(); // read first 128KB
    const view = new DataView(buffer);

    // Verify JPEG SOI marker (0xFFD8)
    if (view.getUint16(0) !== 0xffd8) {
      return {
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: file.type || 'image/unknown',
        dateTimeOriginal: file.lastModified
          ? new Date(file.lastModified).toISOString().replace('T', ' ').slice(0, 19)
          : undefined,
      };
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 4) {
      const marker = view.getUint16(offset);
      offset += 2;

      // APP1 Marker for Exif (0xFFE1)
      if (marker === 0xffe1) {
        const app1Length = view.getUint16(offset);
        offset += 2;

        // Check for 'Exif\0\0' (0x457869660000)
        const exifHeader = view.getUint32(offset);
        if (exifHeader === 0x45786966 && view.getUint16(offset + 4) === 0x0000) {
          const tiffStart = offset + 6;
          const parsed = parseTiffHeader(view, tiffStart);
          return {
            ...parsed,
            fileName: file.name,
            fileSizeBytes: file.size,
            fileType: file.type || 'image/jpeg',
            dateTimeOriginal:
              parsed.dateTimeOriginal ||
              (file.lastModified
                ? new Date(file.lastModified).toISOString().replace('T', ' ').slice(0, 19)
                : undefined),
          };
        }
        offset += app1Length - 2;
      } else if ((marker & 0xff00) === 0xff00) {
        // Skip other markers
        const sectionLength = view.getUint16(offset);
        offset += sectionLength;
      } else {
        break;
      }
    }

    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type,
      dateTimeOriginal: file.lastModified
        ? new Date(file.lastModified).toISOString().replace('T', ' ').slice(0, 19)
        : undefined,
    };
  } catch (err) {
    console.warn('Exif parsing failed:', err);
    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type,
    };
  }
}

function parseTiffHeader(view: DataView, tiffStart: number): Partial<ExifMetadata> {
  const result: Partial<ExifMetadata> = {};
  if (tiffStart + 8 > view.byteLength) return result;

  const byteOrderMarker = view.getUint16(tiffStart);
  const littleEndian = byteOrderMarker === 0x4949; // 'II'

  // Verify TIFF 42 marker
  if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) return result;

  const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
  if (firstIfdOffset < 8) return result;

  readIfd(view, tiffStart, tiffStart + firstIfdOffset, littleEndian, result);
  return result;
}

function readIfd(
  view: DataView,
  tiffStart: number,
  ifdStart: number,
  littleEndian: boolean,
  result: Partial<ExifMetadata>
) {
  if (ifdStart + 2 > view.byteLength) return;
  const numEntries = view.getUint16(ifdStart, littleEndian);
  let offset = ifdStart + 2;

  let exifIfdPointer = 0;

  for (let i = 0; i < numEntries; i++) {
    if (offset + 12 > view.byteLength) break;
    const tag = view.getUint16(offset, littleEndian);
    const type = view.getUint16(offset + 2, littleEndian);
    const count = view.getUint32(offset + 4, littleEndian);
    const valueOffset = offset + 8;

    switch (tag) {
      case 0x010f: // Make
        result.cameraMake = readString(view, tiffStart, valueOffset, count, littleEndian);
        break;
      case 0x0110: // Model
        result.cameraModel = readString(view, tiffStart, valueOffset, count, littleEndian);
        break;
      case 0x8769: // Exif IFD Pointer
        exifIfdPointer = view.getUint32(valueOffset, littleEndian);
        break;
      case 0x0132: // Date/Time
        result.dateTimeOriginal = readString(view, tiffStart, valueOffset, count, littleEndian);
        break;
    }

    offset += 12;
  }

  // Parse SubIFD / Exif specific tags
  if (exifIfdPointer > 0 && tiffStart + exifIfdPointer + 2 <= view.byteLength) {
    const subIfdStart = tiffStart + exifIfdPointer;
    const subEntries = view.getUint16(subIfdStart, littleEndian);
    let subOffset = subIfdStart + 2;

    for (let j = 0; j < subEntries; j++) {
      if (subOffset + 12 > view.byteLength) break;
      const tag = view.getUint16(subOffset, littleEndian);
      const count = view.getUint32(subOffset + 4, littleEndian);
      const valOffset = subOffset + 8;

      switch (tag) {
        case 0x829a: { // Exposure Time
          const rational = readRational(view, tiffStart, valOffset, littleEndian);
          if (rational) {
            result.shutterSpeed =
              rational.denom > 1
                ? `1/${Math.round(rational.denom / rational.num)}s`
                : `${(rational.num / rational.denom).toFixed(1)}s`;
          }
          break;
        }
        case 0x829d: { // FNumber
          const rational = readRational(view, tiffStart, valOffset, littleEndian);
          if (rational && rational.denom > 0) {
            result.aperture = `ƒ/${(rational.num / rational.denom).toFixed(1)}`;
          }
          break;
        }
        case 0x8827: // ISO
          result.iso = view.getUint16(valOffset, littleEndian);
          break;
        case 0x9003: // DateTimeOriginal
          result.dateTimeOriginal = readString(view, tiffStart, valOffset, count, littleEndian);
          break;
        case 0x920a: { // Focal Length
          const rational = readRational(view, tiffStart, valOffset, littleEndian);
          if (rational && rational.denom > 0) {
            result.focalLength = `${Math.round(rational.num / rational.denom)} mm`;
          }
          break;
        }
        case 0xa434: // LensModel
          result.lensModel = readString(view, tiffStart, valOffset, count, littleEndian);
          break;
        case 0xa001: // ColorSpace
          const cs = view.getUint16(valOffset, littleEndian);
          result.colorSpace = cs === 1 ? 'sRGB' : cs === 65535 ? 'Uncalibrated' : 'Adobe RGB';
          break;
      }

      subOffset += 12;
    }
  }
}

function readString(
  view: DataView,
  tiffStart: number,
  offset: number,
  count: number,
  littleEndian: boolean
): string {
  if (count <= 4) {
    let str = '';
    for (let i = 0; i < count; i++) {
      const code = view.getUint8(offset + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str.trim();
  }

  const strOffset = tiffStart + view.getUint32(offset, littleEndian);
  if (strOffset + count > view.byteLength) return '';

  let str = '';
  for (let i = 0; i < count; i++) {
    const code = view.getUint8(strOffset + i);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str.trim();
}

function readRational(
  view: DataView,
  tiffStart: number,
  offset: number,
  littleEndian: boolean
): { num: number; denom: number } | null {
  const pointer = tiffStart + view.getUint32(offset, littleEndian);
  if (pointer + 8 > view.byteLength) return null;
  const num = view.getUint32(pointer, littleEndian);
  const denom = view.getUint32(pointer + 4, littleEndian);
  return { num, denom };
}
