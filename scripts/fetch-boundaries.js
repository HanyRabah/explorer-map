// scripts/extract-boundaries.js
// This script extracts Egypt's administrative boundary data from the GADM dataset
// and prepares it for database seeding

import fs from 'fs';
import path from 'path';
// Function to extract boundaries from GADM dataset
async function extractBoundaries() {
  try {
    // Path to the GADM GeoJSON file
    const gadmFilePath = path.join(process.cwd(), 'public', 'data', 'gadm41_EGY_1.json');
    
    // Create directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read the GADM file
    console.log('Reading GADM boundary data...');
    const fileContent = fs.readFileSync(gadmFilePath, 'utf8');
    const gadmData = JSON.parse(fileContent);
    
    // Transform the features to our required format
    console.log('Processing boundary data...');
    const features = gadmData.features.map(feature => {
      // Extract English and Arabic names
      const name = feature.properties.NAME_1;
      // Use the Arabic name if available, otherwise use the NL_NAME_1 field
      const nameAr = feature.properties.NL_NAME_1 !== "NA" ? 
                    feature.properties.NL_NAME_1 : 
                    "";
      
      // Create a new feature with our simplified format
      return {
        id: feature.properties.GID_1.replace('EGY.', '').replace('_1', ''),
        properties: {
          name: name,
          name_ar: nameAr
        },
        geometry: feature.geometry
      };
    });
    
    // Create our boundaries data
    const boundariesData = {
      type: 'FeatureCollection',
      features
    };
    
    // Save to file
    const outputPath = path.join(dataDir, 'egypt-boundaries.json');
    fs.writeFileSync(outputPath, JSON.stringify(boundariesData, null, 2));
    
    console.log(`Saved ${features.length} boundaries to ${outputPath}`);
  } catch (error) {
    console.error('Error extracting boundaries:', error);
    process.exit(1);
  }
}

// Run the extraction
extractBoundaries();