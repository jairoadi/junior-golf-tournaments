'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SearchBar from '@/components/SearchBar';
import SearchFilters from '@/components/SearchFilters';
import TournamentCard from '@/components/TournamentCard';
import { SearchFilters as SearchFiltersType, Tournament } from '@/types/tournament';

const defaultFilters: SearchFiltersType = {
  query: '',
  state: '',
  ageGroup: '',
  gender: '',
  status: '',
};

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const [filters, setFilters] = useState<SearchFiltersType>({
    ...defaultFilters,
    query: initialQuery,
  });

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((data) => {
        setTournaments(data.tournaments ?? []);
        setUsingMock(data.usingMock ?? false);
      })
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    return tournaments.filter((t) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matches =
          t.name.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.courseName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.state && t.state !== filters.state) return false;
      if (filters.ageGroup && !t.ageGroups.includes(filters.ageGroup)) return false;
      if (filters.gender && t.gender !== filters.gender) return false;
      if (filters.status && t.status !== filters.status) return false;
      return true;
    });
  }, [filters, tournaments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {usingMock && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing sample data. Run <strong>npm run scrape:usga</strong> to load live tournaments.
        </Alert>
      )}
      <Box sx={{ mb: 3 }}>
        <SearchBar initialQuery={initialQuery} size="small" />
      </Box>

      <Grid container spacing={3}>
        {/* Filters sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({ ...defaultFilters, query: filters.query })}
          />
        </Grid>

        {/* Results */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>
              Tournaments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No tournaments found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or clearing filters
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {results.map((tournament) => (
                <Grid key={tournament.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <TournamentCard tournament={tournament} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
