import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #2e7d32 0%, #005005 60%, #1b5e20 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <GolfCourseIcon sx={{ fontSize: 72, color: '#f9a825', mb: 2 }} />
          <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
            Junior Golf Finder
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
            Discover junior golf tournaments across the country
          </Typography>
          <SearchBar />
        </Box>
      </Container>
    </Box>
  );
}
