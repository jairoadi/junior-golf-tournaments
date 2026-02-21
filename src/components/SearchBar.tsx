'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  initialQuery?: string;
  size?: 'small' | 'medium';
}

export default function SearchBar({ initialQuery = '', size = 'medium' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <TextField
        fullWidth
        size={size}
        variant="outlined"
        placeholder="Search tournaments by name, location, or course…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ backgroundColor: 'white', borderRadius: 1 }}
      />
      <Button
        variant="contained"
        color="primary"
        size={size}
        startIcon={<SearchIcon />}
        onClick={handleSearch}
        sx={{ whiteSpace: 'nowrap', px: 3 }}
      >
        Search
      </Button>
    </Box>
  );
}
