import {
    Add as AddIcon,
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
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this city?')) {
      try {
        const response = await fetch(`/api/cities/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setCities(cities.filter(city => city.id !== id));
        } else {
          alert('Failed to delete city');
        }
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Failed to delete city');
      }
    }
  };

  const navigateToMap = () => {
    router.push('/');
  };

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (city.nameArabic && city.nameArabic.includes(searchQuery))
  );

  return (
    <>
      <Head>
        <title>Admin Dashboard - Egypt City Explorer</title>
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Cities Management
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              component={Link}
              href="/dashboard/cities/new"
            >
              Add New City
            </Button>
          </Box>

          <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Arabic Name</TableCell>
                      <TableCell>Population</TableCell>
                      <TableCell>Area (km²)</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <TableRow key={city.id}>
                          <TableCell>{city.name}</TableCell>
                          <TableCell>{city.nameArabic || '-'}</TableCell>
                          <TableCell>{city.population?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{city.area?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{city.notes?.length || 0}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              component={Link}
                              href={`/dashboard/cities/${city.id}`}
                              color="primary"
                              aria-label="edit"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error"
                              aria-label="delete"
                              onClick={() => handleDelete(city.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {searchQuery ? 'No cities match your search' : 'No cities found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
}