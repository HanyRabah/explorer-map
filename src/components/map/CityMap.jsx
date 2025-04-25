import { Box, CircularProgress, Typography } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css'; // Make sure this is imported
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, { FullscreenControl, Layer, NavigationControl, Popup, Source } from 'react-map-gl';
import { MAPBOX_STYLE } from '../../utils/mapbox-config';

// Layer styles for different states
const layerStyle = {
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

const outlineLayerStyle = {
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

const CityMap = ({ onCitySelect }) => {
  const [viewState, setViewState] = useState({
    longitude: 30.8025,
    latitude: 26.8206,
    zoom: 5
  });
  
  const [cities, setCities] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Keep track of hover state for feature states
  const hoveredIdRef = useRef(null);
  const mapRef = useRef(null);

  // Calculate centroid of polygon for better popup positioning
  const calculateCentroid = useCallback((geometry) => {
    try {
      if (geometry.type === 'Polygon') {
        // Use first ring of coordinates (outer ring)
        const coordinates = geometry.coordinates[0];
        let sumLng = 0;
        let sumLat = 0;
        for (const coord of coordinates) {
          sumLng += coord[0];
          sumLat += coord[1];
        }
        return {
          longitude: sumLng / coordinates.length,
          latitude: sumLat / coordinates.length
        };
      } else if (geometry.type === 'MultiPolygon') {
        // Use the first polygon's first ring for simplicity
        const coordinates = geometry.coordinates[0][0];
        let sumLng = 0;
        let sumLat = 0;
        for (const coord of coordinates) {
          sumLng += coord[0];
          sumLat += coord[1];
        }
        return {
          longitude: sumLng / coordinates.length,
          latitude: sumLat / coordinates.length
        };
      }
    } catch (error) {
      console.error('Error calculating centroid:', error);
    }
    
    // Return default if calculation fails
    return { longitude: 30.8025, latitude: 26.8206 };
  }, []);

  // Fetch city data and convert to GeoJSON
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        setCities(data);
        
        // Convert to GeoJSON format
        const geojson = {
          type: 'FeatureCollection',
          features: data.map((city, index) => ({
            type: 'Feature',
            id: index + 1, // Use sequential numbers starting from 1
            properties: {
              originalId: city.id, // Store original ID here
              id: index + 1, // Store numeric ID here too
              name: city.name,
              nameArabic: city.nameArabic,
              notesCount: city.notes || 0
            },
            geometry: city.geometry
          }))
        };
        
        setGeoJsonData(geojson);
      } catch (error) {
        console.error('Error fetching city data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Handle map load event
  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // Handle mouse enter on a feature
  const onMouseEnter = useCallback(event => {
  if (!event.features || event.features.length === 0 || !mapLoaded) return;
  
  const map = mapRef.current?.getMap();
  if (!map) return;
  
  map.getCanvas().style.cursor = 'pointer';
  
  // Get the feature ID safely
  const feature = event.features[0];

  // Use numeric ID for feature state
  const hoveredId = feature.id || feature.properties.id;
  
  // Skip if no valid ID found
  if (hoveredId === undefined || hoveredId === null || isNaN(hoveredId)) {
    console.warn('No valid feature ID found for hover state');
    return;
  }
  
  // Find the city data for the popup
  const cityId = feature.properties.originalId;
  const city = cities.find(c => c.id === cityId);
  
  if (!city) {
    console.warn('City not found for ID:', cityId);
    return;
  }
  
  // Always update hover state and popup, even when hovering over a different feature
  // Remove hover state from previous feature
  if (hoveredIdRef.current !== null && hoveredIdRef.current !== hoveredId) {
    try {
      map.setFeatureState(
        { source: 'egypt-cities-source', id: hoveredIdRef.current },
        { hover: false }
      );
    } catch (err) {
      console.warn('Error clearing previous hover state:', err);
    }
  }
  
  // Set hover state on current feature
  try {
    map.setFeatureState(
      { source: 'egypt-cities-source', id: hoveredId },
      { hover: true }
    );
    
    hoveredIdRef.current = hoveredId;
    
    // Always update popup info with the current hovered city
    // Calculate better position for popup using centroid
    const centroid = calculateCentroid(city.geometry);
    
    setPopupInfo({
      longitude: event.lngLat.lng, // Use cursor position for smoother following
      latitude: event.lngLat.lat,
      city
    });
    
  } catch (err) {
    console.error('Error setting hover state:', err);
  }
}, [cities, calculateCentroid, mapLoaded]);

  // Handle mouse leave from a feature
  const onMouseLeave = useCallback(() => {
    if (!mapLoaded) return;
    
    const map = mapRef.current?.getMap();
    if (!map) return;
    
    map.getCanvas().style.cursor = '';
    
    if (hoveredIdRef.current !== null) {
      try {
        map.setFeatureState(
          { source: 'egypt-cities-source', id: hoveredIdRef.current },
          { hover: false }
        );
      } catch (err) {
        console.warn('Error clearing hover state on leave:', err);
      }
      hoveredIdRef.current = null;
      setPopupInfo(null);
    }
  }, [mapLoaded]);

  const onMouseMove = useCallback(event => {
  // Only handle if we already have a hovered feature
  if (!hoveredIdRef.current || !mapLoaded) return;
  
  // Update popup position to follow cursor if desired
  if (popupInfo) {
    setPopupInfo(prev => ({
      ...prev,
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    }));
  }
}, [mapLoaded, popupInfo]);
  // Handle click on a feature
  const onClick = useCallback(event => {
    if (!event.features || event.features.length === 0) return;
    
    const feature = event.features[0];
    const clickedId = feature.properties.originalId;
    
    // Skip if no valid ID found
    if (clickedId === undefined || clickedId === null) {
      console.warn('No valid feature ID found for click action');
      return;
    }
    
    const city = cities.find(c => c.id === clickedId);
    
    if (city && onCitySelect) {
      // Close popup when clicking to prevent UI clutter
      setPopupInfo(null);
      onCitySelect(city);
    }
  }, [cities, onCitySelect]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Map
        ref={mapRef}
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_STYLE}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_AT}
        interactiveLayerIds={['egypt-cities']}
        onMouseMove={onMouseEnter}
        // onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onLoad={onMapLoad}
      >
        <NavigationControl position="bottom-left" showCompass={false} />
        <FullscreenControl position="bottom-left" />
        
        {geoJsonData && (
          <Source 
            id="egypt-cities-source" 
            type="geojson" 
            data={geoJsonData}
            generateId={false} // We're providing explicit IDs
          >
            <Layer {...layerStyle} />
            <Layer {...outlineLayerStyle} />
          </Source>
        )}
        {mapLoaded && (
          <Layer
            id="city-labels"
            type="symbol"
            source="egypt-cities-source"
            layout={{
              'text-field': ['get', 'name'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
              'text-size': 12,
              'text-anchor': 'center',
              'text-offset': [0, 0.6]
            }}
          />
        )}
        {popupInfo && (
          <Popup
              longitude={popupInfo.longitude}
              latitude={popupInfo.latitude}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
              closeButton={false}
              closeOnClick={false}
              className="city-popup"
              style={{ zIndex: 10 }}
          >
            <Box sx={{ p: 1, maxWidth: 200 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {popupInfo.city.name}
              </Typography>
              {popupInfo.city.nameArabic && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {popupInfo.city.nameArabic}
                </Typography>
              )}
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                number of notes: {popupInfo.city.notes || 0}
              </Typography>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
};

export default CityMap;