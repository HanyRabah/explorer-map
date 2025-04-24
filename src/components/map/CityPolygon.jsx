import React, { useState } from 'react';
import { Polygon } from '@react-google-maps/api';

const CityPolygon = ({ city, onClick, onMouseOver, onMouseOut }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Convert GeoJSON coordinates to Google Maps LatLng format
  const getPolygonPaths = () => {
    // Ensure we're handling a polygon
    if (city.geometry.type !== 'Polygon' && city.geometry.type !== 'MultiPolygon') {
      console.error('Invalid geometry type for city:', city.name);
      return [];
    }

    // Handle different geometry types
    if (city.geometry.type === 'Polygon') {
      return city.geometry.coordinates.map(ring =>
        ring.map(coord => ({ lat: coord[1], lng: coord[0] }))
      );
    } else if (city.geometry.type === 'MultiPolygon') {
      return city.geometry.coordinates.map(polygon =>
        polygon.map(ring =>
          ring.map(coord => ({ lat: coord[1], lng: coord[0] }))
        )
      ).flat();
    }
    
    return [];
  };

  const polygonOptions = {
    fillColor: isHovered ? '#4285F4' : '#3388ff',
    fillOpacity: isHovered ? 0.7 : 0.5,
    strokeColor: isHovered ? '#0066cc' : '#3388ff',
    strokeOpacity: 1,
    strokeWeight: isHovered ? 2 : 1,
  };

  const handleMouseOver = () => {
    setIsHovered(true);
    if (onMouseOver) {
      onMouseOver();
    }
  };

  const handleMouseOut = () => {
    setIsHovered(false);
    if (onMouseOut) {
      onMouseOut();
    }
  };

  return (
    <>
      {getPolygonPaths().map((path, index) => (
        <Polygon
          key={`${city.id}-${index}`}
          paths={path}
          options={polygonOptions}
          onClick={onClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        />
      ))}
    </>
  );
};

export default CityPolygon;