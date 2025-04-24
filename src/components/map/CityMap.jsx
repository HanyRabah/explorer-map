import { Box, CircularProgress } from '@mui/material';
import { GoogleMap, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import CityPolygon from './CityPolygon';
import CityPopup from './CityPopup';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

// Center on Egypt
const center = {
  lat: 26.8206,
  lng: 30.8025,
};

const CityMap = ({ onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // Fetch city data from the API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching city data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleMapLoad = (map) => {
    setMapInstance(map);
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  const handleCityHover = (city) => {
    setHoveredCity(city);
  };

  const handleCityHoverExit = () => {
    setHoveredCity(null);
  };

  if (!isLoaded) {
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
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={6}
        onLoad={handleMapLoad}
      >
        {cities.map((city) => (
          <CityPolygon
            key={city.id}
            city={city}
            onClick={() => handleCityClick(city)}
            onMouseOver={() => handleCityHover(city)}
            onMouseOut={handleCityHoverExit}
          />
        ))}
        
        {hoveredCity && (
          <InfoWindow
            position={{
              lat: hoveredCity.geometry.coordinates[0][0][1],
              lng: hoveredCity.geometry.coordinates[0][0][0],
            }}
            onCloseClick={() => setHoveredCity(null)}
          >
            <CityPopup city={hoveredCity} />
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
};

export default CityMap;