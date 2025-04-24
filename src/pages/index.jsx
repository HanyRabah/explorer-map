import { useState } from 'react';
import Head from 'next/head';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import CityMap from '../components/map/CityMap';
import Sidebar from '../components/layout/Sidebar';
import { useRouter } from 'next/router';
import { DashboardOutlined as DashboardIcon } from '@mui/icons-material';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>Egypt City Explorer</title>
        <meta name="description" content="Explore cities in Egypt with interactive map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="absolute" color="default" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Egypt City Explorer
            </Typography>
            <Button 
              color="primary" 
              variant="contained" 
              startIcon={<DashboardIcon />} 
              onClick={navigateToDashboard}
            >
              Dashboard
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, position: 'relative', mt: 8 }}>
          <CityMap onCitySelect={handleCitySelect} />
          <Sidebar
            open={sidebarOpen}
            city={selectedCity}
            onClose={handleCloseSidebar}
          />
        </Box>
      </Box>
    </>
  );
}