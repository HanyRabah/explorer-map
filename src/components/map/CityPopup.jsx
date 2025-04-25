
// CityPopup.jsx
import { Box, Typography } from '@mui/material';
import React from 'react';

const CityPopup = ({ city }) => {
  console.log("🚀 ~ CityPopup ~ city:", city)
  if (!city) return null;
  
  return (
    <Box 
      sx={{ 
        padding: 2, 
        maxWidth: 200, 
        backgroundColor: 'white', 
        borderRadius: 1,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {city.name}
      </Typography>
      {city.nameArabic && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {city.nameArabic}
        </Typography>
      )}
      {city.notes && city.notes.length > 0 && (
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          Click for more details
        </Typography>
      )}
    </Box>
  );
};

export default CityPopup;