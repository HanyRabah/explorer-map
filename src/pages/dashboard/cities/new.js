import { Map as MapIcon } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CityForm from '../../../components/dashboard/CityForm';

export default function NewCity() {
  const router = useRouter();

  const navigateToMap = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Add New City - Egypt Map Explorer</title>
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
          <CityForm />
        </Container>
      </Box>
    </>
  );
}