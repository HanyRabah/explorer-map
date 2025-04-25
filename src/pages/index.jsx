import {
  Search as SearchIcon
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CityMap from '../components/map/CityMap';

const DRAWER_WIDTH = 350;

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCity, setExpandedCity] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAllCities();
  }, []);

  const fetchAllCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setAllCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSidebarOpen(true);
    // Expand this city in the list
    setExpandedCity(city.id);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCityClick = (cityId) => {
    setExpandedCity(expandedCity === cityId ? null : cityId);
    
    // If city is clicked in the list, also select it on the map
    if (expandedCity !== cityId) {
      const city = allCities.find(c => c.id === cityId);
      if (city) {
        setSelectedCity(city);
        setSidebarOpen(true);
      }
    }
  };

  const filteredCities = allCities.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (city.nameArabic && city.nameArabic.includes(searchQuery))
  );

  return (
    <>
      <Head>
        <title>Egypt City Explorer</title>
        <meta name="description" content="Explore cities in Egypt with interactive map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="absolute" color="default" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Egypt City Explorer
            </Typography>
            {/* <Button 
              color="primary" 
              variant="contained" 
              startIcon={<DashboardIcon />} 
              onClick={navigateToDashboard}
            >
              Admin Dashboard
            </Button> */}
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flexGrow: 1, mt: 8 }}>
          {/* Main Map Content */}
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <CityMap onCitySelect={handleCitySelect} />
            <Sidebar
              open={sidebarOpen}
              city={selectedCity}
              onClose={handleCloseSidebar}
            />
          </Box>

          {/* Permanent Cities Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': { 
                width: DRAWER_WIDTH, 
                boxSizing: 'border-box',
                mt: '64px', // Height of the AppBar
                height: 'calc(100% - 64px)' 
              },
            }}
            anchor="right"
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                Egypt Cities
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List disablePadding>
                  {filteredCities.map((city) => (
                    <Box key={city.id}>
                      <ListItem 
                        button
                        onClick={() => handleCityClick(city.id)}
                        sx={{ 
                          bgcolor: selectedCity?.id === city.id ? 'action.selected' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemText 
                          primary={city.name} 
                          secondary={city.nameArabic}
                        />
                      </ListItem>
                      
                      <Divider />
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          </Drawer>
        </Box>
      </Box>
    </>
  );
}