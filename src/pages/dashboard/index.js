import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Map as MapIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
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
  Toolbar,
  Typography
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // For note dialog
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '' });
  const [isEditingNote, setIsEditingNote] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data);
      
      // Select the first city by default
      if (data.length > 0 && !selectedCityId) {
        setSelectedCityId(data[0].id);
        fetchNotes(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (cityId) => {
    if (!cityId) return;
    
    setLoadingNotes(true);
    try {
      const response = await fetch(`/api/cities/${cityId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleCitySelect = (cityId) => {
    setSelectedCityId(cityId);
    fetchNotes(cityId);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const navigateToMap = () => {
    router.push('/');
  };

  // Note CRUD operations
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
    if (!selectedCityId) {
      alert('Please select a city first');
      return;
    }
    
    if (!currentNote.title || !currentNote.content) {
      alert('Title and content are required');
      return;
    }
    
    try {
      const url = isEditingNote 
        ? `/api/cities/${selectedCityId}/notes/${currentNote.id}` 
        : `/api/cities/${selectedCityId}/notes`;
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
      const response = await fetch(`/api/cities/${selectedCityId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (city.nameArabic && city.nameArabic.includes(searchQuery))
  );

  // Find the selected city object
  const selectedCity = cities.find(city => city.id === selectedCityId);

  return (
    <>
      <Head>
        <title>Admin Dashboard - Egypt Map Explorer</title>
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            <Button 
              color="inherit" 
              startIcon={<MapIcon />}
              onClick={navigateToMap}
            >
              View Map
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1">
              City Notes Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Add and manage notes for Egypts cities
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Left Panel - City List */}
            <Paper sx={{ width: 300, flexShrink: 0 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Cities</Typography>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2, mb: 2 }}
                />
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                  <Table size="small">
                    <TableBody>
                      {filteredCities.map((city) => (
                        <TableRow 
                          key={city.id}
                          hover
                          selected={city.id === selectedCityId}
                          onClick={() => handleCitySelect(city.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={city.id === selectedCityId ? 'bold' : 'normal'}>
                              {city.name}
                            </Typography>
                            {city.nameArabic && (
                              <Typography variant="caption" color="text.secondary">
                                {city.nameArabic}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="text.secondary">
                              {city.notes} notes
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredCities.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No cities found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>

            {/* Right Panel - City Details & Notes */}
            <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedCity ? (
                <>
                  <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h5">{selectedCity.name}</Typography>
                    {selectedCity.nameArabic && (
                      <Typography variant="subtitle1" color="text.secondary">
                        {selectedCity.nameArabic}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Notes:</strong> {selectedCity.notes || 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Notes" />
                      </Tabs>
                    </Box>
                    
                    {tabValue === 0 && (
                      <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">City Notes</Typography>
                          <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => openNoteDialog()}
                          >
                            Add Note
                          </Button>
                        </Box>
                        
                        {loadingNotes ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : notes.length > 0 ? (
                          <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 450px)', overflow: 'auto' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Title</TableCell>
                                  <TableCell>Created</TableCell>
                                  <TableCell>Updated</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {notes.map((note) => (
                                  <TableRow key={note.id}>
                                    <TableCell>
                                      <Typography variant="body2">{note.title}</Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {note.content.substring(0, 60)}
                                        {note.content.length > 60 ? '...' : ''}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {new Date(note.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(note.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                      <IconButton 
                                        color="primary"
                                        onClick={() => openNoteDialog(note)}
                                        size="small"
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton 
                                        color="error"
                                        onClick={() => deleteNote(note.id)}
                                        size="small"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexGrow: 1,
                            py: 8
                          }}>
                            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                              No Notes Yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Add your first note for {selectedCity.name}
                            </Typography>
                            <Button 
                              variant="contained" 
                              startIcon={<AddIcon />}
                              onClick={() => openNoteDialog()}
                            >
                              Add Note
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 8
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Select a city to view and manage notes
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Container>
      </Box>
      
      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={closeNoteDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {isEditingNote 
              ? `Editing note for ${selectedCity?.name}`
              : `Adding new note for ${selectedCity?.name}`
            }
          </DialogContentText>
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
            rows={8}
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
    </>
  );
}