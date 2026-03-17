import fs from 'fs/promises';
import path from 'path';

/**
 * Reusable utility to read and parse CSV files from the filesystem.
 * This should only be called from Server Components or Server Actions.
 */
export async function readAndParseCSV(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return parseCSV(fileContent);
  } catch (error) {
    console.error("Error reading CSV:", error);
    return [];
  }
}

export function parseCSV(csvText: string) {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simplistic split for standard CSV without quoted commas
    const values = line.split(',');
    const entry: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      entry[header] = values[index]?.trim() || '';
    });
    
    data.push(entry);
  }
  
  return data;
}

/**
 * Utility to downsample large datasets so they don't crash the browser when rendered in charts.
 */
export function downsampleArray<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  const result = [];
  for (let i = 0; i < data.length; i += step) {
    result.push(data[i]);
  }
  return result;
}
