import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const CityForm = ({ cityId }) => {
  const router = useRouter();
  const isEditing = Boolean(cityId);
  
  const [formData, setFormData] = useState({
    name: '',
    nameArabic: '',
    population: '',
    area: '',
    description: '',
    geometry: null // This would come from a map editor in a real app
  });
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // For note dialog
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '' });
  const [isEditingNote, setIsEditingNote] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchCityData();
    }
  }, [cityId]);

  const fetchCityData = async () => {
    try {
      setLoading(true);
      // Fetch city details
      const cityResponse = await fetch(`/api/cities/${cityId}`);
      if (!cityResponse.ok) throw new Error('Failed to fetch city data');
      const cityData = await cityResponse.json();
      
      // Prepare form data
      setFormData({
        name: cityData.name || '',
        nameArabic: cityData.nameArabic || '',
        population: cityData.population || '',
        area: cityData.area || '',
        description: cityData.description || '',
        geometry: cityData.geometry
      });
      
      // Fetch city notes
      const notesResponse = await fetch(`/api/cities/${cityId}/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData);
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
      setError('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Convert numeric fields
      const dataToSubmit = {
        ...formData,
        population: formData.population ? parseInt(formData.population, 10) : null,
        area: formData.area ? parseFloat(formData.area) : null,
      };
      
      // In a real app, you would validate geometry here
      if (!dataToSubmit.geometry && !isEditing) {
        // For demo purposes, use a simple polygon for Cairo if no geometry
        dataToSubmit.geometry = {
          type: 'Polygon',
          coordinates: [
            [
              [31.2357, 30.0444],
              [31.3357, 30.0444],
              [31.3357, 30.1444],
              [31.2357, 30.1444],
              [31.2357, 30.0444]
            ]
          ]
        };
      }
      
      const url = isEditing ? `/api/cities/${cityId}` : '/api/cities';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save city');
      }
      
      const savedCity = await response.json();
      
      setSuccess(isEditing ? 'City updated successfully' : 'City created successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        if (!isEditing) {
          router.push(`/dashboard/cities/${savedCity.id}`);
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error saving city:', error);
      setError(error.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Note management functions
  const openNoteDialog = (note = null) => {
    if (note) {
      setCurrentNote({ ...note });
      setIsEditingNote(true);
    } else {
      setCurrentNote({ id: null, title: '', content: '' });
      setIsEditingNote(false);
    }
    setNoteDialogOpen(true);
  };

  const closeNoteDialog = () => {
    setNoteDialogOpen(false);
  };

  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNote(prev => ({ ...prev, [name]: value }));
  };

  const saveNote = async () => {
    if (!currentNote.title || !currentNote.content) {
      alert('Title and content are required');
      return;
    }
    
    try {
      const url = isEditingNote 
        ? `/api/cities/${cityId}/notes/${currentNote.id}` 
        : `/api/cities/${cityId}/notes`;
      const method = isEditingNote ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentNote),
      });
      
      if (!response.ok) throw new Error('Failed to save note');
      
      const savedNote = await response.json();
      
      if (isEditingNote) {
        setNotes(notes.map(note => note.id === savedNote.id ? savedNote : note));
      } else {
        setNotes([...notes, savedNote]);
      }
      
      closeNoteDialog();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/api/cities/${cityId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/dashboard')}
        >
          Back to List
        </Button>
        <Typography variant="h5" component="h1">
          {isEditing ? 'Edit City' : 'Add New City'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Basic Information" />
          {isEditing && <Tab label="Notes" />}
        </Tabs>
        
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="City Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Arabic Name"
                name="nameArabic"
                value={formData.nameArabic}
                onChange={handleInputChange}
                variant="outlined"
                dir="rtl"
              />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Population"
                name="population"
                value={formData.population}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area (km²)"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
                inputProps={{ step: 0.01 }}
              />
            </Grid> */}
            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid> */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Geometry: {formData.geometry ? 'Loaded' : 'Not set'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                In a complete app, this would include a map editor to define the city boundaries.
                For this demo, we're using placeholder geometry.
              </Typography>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 1 && isEditing && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">City Notes</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => openNoteDialog()}
              >
                Add Note
              </Button>
            </Box>
            
            {notes.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>{note.title}</TableCell>
                        <TableCell>{new Date(note.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="primary"
                            onClick={() => openNoteDialog(note)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error"
                            onClick={() => deleteNote(note.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No notes added yet. Click 'Add Note' to create one.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={saving}
          sx={{ minWidth: 150 }}
        >
          {saving ? <CircularProgress size={24} /> : 'Save City'}
        </Button>
      </Box>
      
      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={closeNoteDialog}>
        <DialogTitle>{isEditingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            variant="outlined"
            value={currentNote.title}
            onChange={handleNoteInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentNote.content}
            onChange={handleNoteInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNoteDialog}>Cancel</Button>
          <Button onClick={saveNote} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CityForm;