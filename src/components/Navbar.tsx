'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function Navbar() {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <GolfCourseIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
        >
          Junior Golf Finder
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/search">
            Search
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
