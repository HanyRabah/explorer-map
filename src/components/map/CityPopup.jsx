import { Box, Typography } from '@mui/material';
import React from 'react';

const CityPopup = ({ city }) => {
  return (
    <Box sx={{ padding: 1, maxWidth: 200 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {city.name}
      </Typography>
      {city.nameArabic && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {city.nameArabic}
        </Typography>
      )}
      {city.population && (
        <Typography variant="body2">
          Population: {city.population.toLocaleString()}
        </Typography>
      )}
      {city.area && (
        <Typography variant="body2">
          Area: {city.area.toLocaleString()} km²
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