import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  LocationCity as LocationIcon,
  NoteAdd as NoteAddIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

const Sidebar = ({ open, city, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);
  
  // For adding notes
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // For deleting notes
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
  // Reset internal state when city changes
  useEffect(() => {
    if (city) {
      setNotes([]);
      setExpandedNote(null);
    }
  }, [city]);
  
  // Fetch notes when city or open state changes
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
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching city notes:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load notes. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNoteClick = (noteId) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
  };

  const openAddNoteDialog = () => {
    setNewNote({ title: '', content: '' });
    setNoteDialogOpen(true);
  };

  const closeNoteDialog = () => {
    setNoteDialogOpen(false);
  };

  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote(prev => ({ ...prev, [name]: value }));
  };

  const saveNote = async () => {
    if (!newNote.title || !newNote.content) {
      setSnackbar({
        open: true,
        message: 'Title and content are required',
        severity: 'error'
      });
      return;
    }
    
    setSaveLoading(true);
    try {
      const response = await fetch(`/api/cities/${city.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save note: ${response.status}`);
      }
      
      const savedNote = await response.json();
      setNotes(prevNotes => [...prevNotes, savedNote]);
      closeNoteDialog();
      setSnackbar({
        open: true,
        message: 'Note saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving note:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save note. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteConfirm = (note, event) => {
    // Stop the click event from propagating to the parent ListItem
    event.stopPropagation();
    setNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setNoteToDelete(null);
  };

  // Delete the note
  const deleteNote = async () => {
    if (!noteToDelete) return;
    
    setDeleteLoading(true);
    setDeletingNoteId(noteToDelete.id);
    
    try {
      const response = await fetch(`/api/cities/${city.id}/notes/${noteToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }
      
      // Remove the note from state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
      
      // If the deleted note was expanded, collapse it
      if (expandedNote === noteToDelete.id) {
        setExpandedNote(null);
      }
      
      setSnackbar({
        open: true,
        message: 'Note deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete note. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeletingNoteId(null);
      closeDeleteConfirm();
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Render nothing if no city is selected
  if (!city) return null;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 0 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5">{city.name}</Typography>
              {city.nameArabic && (
                <Typography variant="body2" color="text.secondary">
                  {city.nameArabic}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notes</Typography>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<AddIcon />}
            onClick={openAddNoteDialog}
          >
            Add Note
          </Button>
        </Box>
        
        <Box sx={{ px: 2, pb: 2, flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
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
                    disabled={deletingNoteId === note.id}
                  >
                    <ListItemText 
                      primary={note.title} 
                      secondary={new Date(note.createdAt).toLocaleDateString()}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Delete note">
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={(e) => openDeleteConfirm(note, e)}
                          disabled={deletingNoteId === note.id}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          {deletingNoteId === note.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon fontSize="small" color="error" />
                          )}
                        </IconButton>
                      </Tooltip>
                      {expandedNote === note.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Collapse in={expandedNote === note.id} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </Typography>
                    </Box>
                  </Collapse>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 6
            }}>
              <NoteAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                No notes available for this city.
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={openAddNoteDialog}
                sx={{ mt: 2 }}
              >
                Add First Note
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
      
      {/* Add Note Dialog */}
      <Dialog 
        open={noteDialogOpen} 
        onClose={!saveLoading ? closeNoteDialog : undefined} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{`Add Note for ${city.name}`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            variant="outlined"
            value={newNote.title}
            onChange={handleNoteInputChange}
            sx={{ mb: 2 }}
            required
            disabled={saveLoading}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={newNote.content}
            onChange={handleNoteInputChange}
            required
            disabled={saveLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNoteDialog} disabled={saveLoading}>Cancel</Button>
          <Button 
            onClick={saveNote} 
            variant="contained" 
            disabled={saveLoading || !newNote.title || !newNote.content}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={!deleteLoading ? closeDeleteConfirm : undefined}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the note "{noteToDelete?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={deleteNote} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar;