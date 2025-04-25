// mapbox-config.js
// This file contains configuration for Mapbox

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

// Egypt bounds (for map constraints)
export const EGYPT_BOUNDS = [
  [24.0, 22.0], // Southwest coordinates [lng, lat]
  [37.0, 32.0]  // Northeast coordinates [lng, lat]
];

// Default center of Egypt
export const EGYPT_CENTER = {
  longitude: 30.8025,
  latitude: 26.8206,
  zoom: 5.5
};

// For the real application, you might want to use Mapbox Boundaries
// These would be populated from the Mapbox Boundaries API
export const MAPBOX_BOUNDARY_TILESET = 'mapbox.boundaries-adm1-v3';

// Layer styles
export const CITY_LAYER_STYLE = {
  id: 'egypt-cities',
  type: 'fill',
  paint: {
    'fill-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#4285F4',
      '#3388ff'
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.7,
      0.5
    ],
    'fill-outline-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#0066cc',
      '#3388ff'
    ]
  }
};

export const CITY_OUTLINE_LAYER_STYLE = {
  id: 'egypt-cities-outline',
  type: 'line',
  paint: {
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#0066cc',
      '#3388ff'
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      2,
      1
    ]
  }
};

// In a real application, you would use a proper source-layer from Mapbox Boundaries
export const BOUNDARY_SOURCE_LAYER = 'admin';

// Function to convert Mapbox feature to our app's city format
export const mapboxFeatureToCity = (feature) => {
  const { id, properties } = feature;
  
  return {
    id: id.toString(),
    name: properties.name_en || properties.name,
    nameArabic: properties.name_ar,
    mapboxId: id.toString(),
    adminLevel: properties.admin_level || 1,
    population: properties.population,
    area: properties.area
  };
};