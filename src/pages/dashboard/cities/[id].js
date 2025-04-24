import { Map as MapIcon } from '@mui/icons-material';
import { AppBar, Box, Button, CircularProgress, Container, Toolbar, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CityForm from '../../../components/dashboard/CityForm';

export default function EditCity() {
  const router = useRouter();
  const { id } = router.query;
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchCity();
    }
  }, [id]);

  const fetchCity = async () => {
    try {
      const response = await fetch(`/api/cities/${id}`);
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
      setCity(data);
    } catch (error) {
      console.error('Error fetching city:', error);
      setError('Failed to load city');
    } finally {
      setLoading(false);
    }
  };

  const navigateToMap = () => {
    router.push('/');
  };

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{loading ? 'Loading...' : `Edit ${city?.name}`} - Egypt City Explorer</title>
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <CityForm cityId={id} />
          )}
        </Container>
      </Box>
    </>
  );
}