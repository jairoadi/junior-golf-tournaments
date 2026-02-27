'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TournamentCard from '@/components/TournamentCard';
import { useBookmarks } from '@/lib/useBookmarks';
import type { Tournament } from '@/types/tournament';

function EmptySection({ message }: { message: string }) {
  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </Box>
  );
}

export default function MyTournamentsContent() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { bookmarks, update } = useBookmarks();

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((data) => setTournaments(data.tournaments ?? []))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const enrolled = tournaments.filter((t) => bookmarks[t.id]?.enrolled);
  const saved = tournaments.filter((t) => bookmarks[t.id]?.saved);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        My Tournaments
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Track tournaments you're enrolled in or saving for later.
      </Typography>

      {/* Enrolled section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <CheckCircleIcon color="success" />
        <Typography variant="h6" fontWeight={600}>
          Enrolled
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          ({enrolled.length})
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {enrolled.length === 0 ? (
        <EmptySection message="No enrolled tournaments yet. Use the check icon on any tournament card to mark enrollment." />
      ) : (
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {enrolled.map((t) => (
            <Grid key={t.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <TournamentCard
                tournament={t}
                bookmarkEntry={bookmarks[t.id]}
                onBookmark={(patch) => update(t.id, patch)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Saved section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: enrolled.length > 0 ? 2 : 0 }}>
        <BookmarkIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Saved
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          ({saved.length})
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {saved.length === 0 ? (
        <EmptySection message="No saved tournaments yet. Use the bookmark icon on any tournament card to save one." />
      ) : (
        <Grid container spacing={2}>
          {saved.map((t) => (
            <Grid key={t.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <TournamentCard
                tournament={t}
                bookmarkEntry={bookmarks[t.id]}
                onBookmark={(patch) => update(t.id, patch)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
