'use server';

import { readAndParseCSV, downsampleArray } from '@/utils/csv-parser';

export async function getCoolantPressureChartData() {
  try {
    const rawData = await readAndParseCSV('src/data/csv/data cm.csv');
    
    if (!rawData || rawData.length === 0) {
      return [];
    }

    // Downsample to max ~150 points for optimal rendering performance
    const sampledData = downsampleArray(rawData, 150);

    return sampledData.map((row: any) => {
      // Map CSV to expected chart format. 
      // Using 'Fuel Rate' for "Fuel Consumption" chart
      const fuelRate = parseFloat(row['Fuel Rate']) || 0;
      
      // We parse out the date and time from "5/5/2025 8:40"
      const dateParts = row['timestamp']?.split(' ') || ['', ''];
      const formattedDate = `${dateParts[0] || ''}\n${dateParts[1] || ''}`;

      return {
        date: formattedDate,
        fuelConsRate: fuelRate,
        upperLimit: 60, // Reference limits for Fuel Rate
        lowerLimit: 0,
      };
    });
  } catch (error) {
    console.error('Failed to get chart data:', error);
    return [];
  }
}
