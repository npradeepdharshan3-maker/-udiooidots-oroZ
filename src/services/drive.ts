import { getAccessToken } from './auth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
}

/**
 * Lists images or files created/accessible with drive.file scope
 */
export async function listDriveFiles(token?: string): Promise<DriveFileItem[]> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) throw new Error('User is not authenticated with Google');

  const query = encodeURIComponent("trashed = false and (mimeType contains 'image/' or mimeType = 'application/octet-stream')");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime)&pageSize=20`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list Google Drive files: ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Downloads a file's binary content from Google Drive as a Blob
 */
export async function downloadDriveFileBlob(fileId: string, token?: string): Promise<Blob> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) throw new Error('User is not authenticated with Google');

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to download file from Google Drive: ${errText}`);
  }

  return response.blob();
}

/**
 * Uploads an image Blob or data to Google Drive
 */
export async function uploadImageToDrive(
  blob: Blob,
  filename: string,
  token?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) throw new Error('User is not authenticated with Google');

  const metadata = {
    name: filename,
    mimeType: blob.type || 'image/png',
    description: 'Edited with Lumen Edit Studio',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to save to Google Drive: ${errText}`);
  }

  return response.json();
}
