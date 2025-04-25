import { Badge, Box, CircularProgress, Typography } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Layer, Popup, Source } from 'react-map-gl';
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
  const [hoveredCityId, setHoveredCityId] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          features: data.map(city => ({
            type: 'Feature',
            id: city.id,
            properties: {
              id: city.id,
              name: city.name,
              nameArabic: city.nameArabic,
              notes: city.notes || 0
            },
            // Use the geometry directly from the database
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

  // Handle mouse enter on a feature
  const onMouseEnter = useCallback((event) => {
    if (event.features && event.features.length > 0) {
      const map = mapRef.current.getMap();
      
      // Remove hover state from previous feature
      if (hoveredIdRef.current) {
        map.setFeatureState(
          { source: 'egypt-cities-source', id: hoveredIdRef.current },
          { hover: false }
        );
      }
      
      // Set hover state on current feature
      const hoveredId = event.features[0].id;
      map.setFeatureState(
        { source: 'egypt-cities-source', id: hoveredId },
        { hover: true }
      );
      
      hoveredIdRef.current = hoveredId;
      setHoveredCityId(hoveredId);
      
      // Find the city data for the popup
      const city = cities.find(c => c.id === hoveredId);
      if (city) {
        // Calculate better position for popup using centroid
        const centroid = calculateCentroid(city.geometry);
        
        setPopupInfo({
          ...centroid, // Use centroid for better positioning
          city
        });
      }
    }
  }, [cities, calculateCentroid]);

  // Handle mouse leave from a feature
  const onMouseLeave = useCallback(() => {
    if (hoveredIdRef.current) {
      const map = mapRef.current.getMap();
      map.setFeatureState(
        { source: 'egypt-cities-source', id: hoveredIdRef.current },
        { hover: false }
      );
      hoveredIdRef.current = null;
      setHoveredCityId(null);
      setPopupInfo(null);
    }
  }, []);

  // Handle click on a feature
  const onClick = useCallback((event) => {
    if (event.features && event.features.length > 0) {
      const clickedId = event.features[0].id;
      const city = cities.find(c => c.id === clickedId);
      if (city && onCitySelect) {
        onCitySelect(city);
      }
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
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        interactiveLayerIds={['egypt-cities']}
        onMouseMove={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {geoJsonData && (
          <Source id="egypt-cities-source" type="geojson" data={geoJsonData}>
            <Layer {...layerStyle} />
            <Layer {...outlineLayerStyle} />
          </Source>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Click for more details
                </Typography>
                <Badge 
                  badgeContent={popupInfo.city.notes} 
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  <Typography variant="caption">Notes</Typography>
                </Badge>
              </Box>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
};

export default CityMap;