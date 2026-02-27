'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useBookmarks } from '@/lib/useBookmarks';
import type { Tournament } from '@/types/tournament';

// FullCalendar's end date is exclusive — add 1 day to the last day of the tournament
function exclusiveEndDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const COLOR_ENROLLED = '#2e7d32'; // golf green (theme primary)
const COLOR_SAVED    = '#1976d2'; // standard blue

export default function CalendarContent() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { bookmarks } = useBookmarks();

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

  const bookmarkedTournaments = tournaments.filter((t) => bookmarks[t.id]);

  const events = bookmarkedTournaments.map((t) => {
    const entry = bookmarks[t.id];
    const lastDay = t.endDate ?? t.date;
    return {
      id: t.id,
      title: t.name,
      start: t.date,
      end: exclusiveEndDate(lastDay),
      color: entry.enrolled ? COLOR_ENROLLED : COLOR_SAVED,
      extendedProps: { tournamentId: t.id },
    };
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        My Calendar
      </Typography>

      {/* Legend */}
      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <CheckCircleIcon sx={{ color: COLOR_ENROLLED, fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">Enrolled</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <BookmarkIcon sx={{ color: COLOR_SAVED, fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">Saved</Typography>
        </Stack>
      </Stack>

      {bookmarkedTournaments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">No tournaments on your calendar yet.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Save or enroll in tournaments from the Search page to see them here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          '& .fc-event': { cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem' },
          '& .fc-day-today': { backgroundColor: 'rgba(46, 125, 50, 0.06) !important' },
          '& .fc-toolbar-title': { fontSize: '1.25rem', fontWeight: 700 },
        }}>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            eventClick={(info) => {
              router.push(`/tournaments/${info.event.extendedProps.tournamentId}`);
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            eventDisplay="block"
            dayMaxEvents={3}
          />
        </Box>
      )}
    </Container>
  );
}
