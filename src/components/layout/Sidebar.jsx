import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationCity as LocationIcon
} from '@mui/icons-material';

const Sidebar = ({ open, city, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    if (city && open) {
      fetchCityNotes();
    }
  }, [city, open]);

  const fetchCityNotes = async () => {
    if (!city) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/cities/${city.id}/notes`);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching city notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteClick = (noteId) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
  };

  if (!city) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5">{city.name}</Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      {city.nameArabic && (
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          {city.nameArabic}
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          {city.population && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Population:</Typography>
              <Typography variant="body1" fontWeight="bold">
                {city.population.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {city.area && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">Area:</Typography>
              <Typography variant="body1" fontWeight="bold">
                {city.area.toLocaleString()} km²
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {city.description && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>About</Typography>
          <Typography variant="body1">{city.description}</Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" sx={{ mb: 2 }}>Notes</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notes.length > 0 ? (
        <List disablePadding>
          {notes.map((note) => (
            <Paper key={note.id} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
              <ListItem 
                button 
                onClick={() => handleNoteClick(note.id)}
                sx={{ px: 2, py: 1 }}
              >
                <ListItemText 
                  primary={note.title} 
                  secondary={new Date(note.createdAt).toLocaleDateString()}
                />
                {expandedNote === note.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={expandedNote === note.id} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Typography variant="body1">{note.content}</Typography>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
          No notes available for this city.
        </Typography>
      )}
    </Drawer>
  );
};

export default Sidebar;