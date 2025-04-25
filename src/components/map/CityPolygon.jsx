// CityPolygon.jsx
import { Polygon } from '@react-google-maps/api';
import React, { useCallback, useState } from 'react';

const CityPolygon = ({ city, onSelect, onHover, onMouseLeave }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Convert GeoJSON coordinates to Google Maps LatLng format
  const getPolygonPaths = useCallback(() => {
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
  }, [city.geometry]);

  const polygonOptions = {
    fillColor: isHovered ? '#4285F4' : '#3388ff',
    fillOpacity: isHovered ? 0.7 : 0.5,
    strokeColor: isHovered ? '#0066cc' : '#3388ff',
    strokeOpacity: 1,
    strokeWeight: isHovered ? 2 : 1,
    clickable: true, // Ensure the polygon is clickable
  };

  const handleMouseOver = useCallback(() => {
    setIsHovered(true);
    if (onHover) {
      onHover(city);
    }
  }, [city, onHover]);

  const handleMouseOut = useCallback(() => {
    setIsHovered(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  }, [onMouseLeave]);

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(city);
    }
  }, [city, onSelect]);

  const paths = getPolygonPaths();

  return (
    <>
      {paths.map((path, index) => (
        <Polygon
          key={`${city.id}-${index}`}
          paths={path}
          options={polygonOptions}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        />
      ))}
    </>
  );
};

export default CityPolygon;


// // CityDetailsSidebar.jsx
// import React, { useState } from 'react';
// import { 
//   Box, 
//   Typography, 
//   Drawer, 
//   IconButton, 
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   TextField,
//   Button
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import AddIcon from '@mui/icons-material/Add';

// const CityDetailsSidebar = ({ city, open, onClose, onAddNote }) => {
//   const [newNote, setNewNote] = useState('');
//   const [showAddNote, setShowAddNote] = useState(false);

//   const handleAddNote = () => {
//     if (newNote.trim()) {
//       onAddNote && onAddNote(city.id, newNote);
//       setNewNote('');
//       setShowAddNote(false);
//     }
//   };

//   if (!city) return null;

//   return (
//     <Drawer
//       anchor="right"
//       open={open}
//       onClose={onClose}
//       sx={{
//         '& .MuiDrawer-paper': {
//           width: { xs: '100%', sm: 400 },
//           boxSizing: 'border-box',
//           padding: 2
//         },
//       }}
//     >
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography variant="h5">{city.name}</Typography>
//         <IconButton onClick={onClose} edge="end">
//           <CloseIcon />
//         </IconButton>
//       </Box>
      
//       {city.nameArabic && (
//         <Typography variant="subtitle1" sx={{ mb: 2 }}>
//           {city.nameArabic}
//         </Typography>
//       )}
      
//       <Divider