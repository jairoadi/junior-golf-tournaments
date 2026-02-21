import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { mockTournaments } from '@/lib/mockData';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Open: 'success',
  Upcoming: 'warning',
  Closed: 'error',
  Completed: 'default',
};

export function generateStaticParams() {
  return mockTournaments.map((t) => ({ id: t.id }));
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = mockTournaments.find((t) => t.id === id);

  if (!tournament) notFound();

  const startDate = new Date(tournament.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const endDate = tournament.endDate
    ? new Date(tournament.endDate).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;
  const deadline = new Date(tournament.registrationDeadline).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Button
        component={Link}
        href="/search"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
        color="primary"
      >
        Back to Search
      </Button>

      <Paper elevation={0} variant="outlined" sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {tournament.name}
          </Typography>
          <Chip
            label={tournament.status}
            color={statusColor[tournament.status]}
            size="medium"
          />
        </Box>

        {tournament.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {tournament.description}
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Details grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOnIcon color="primary" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Location
                  </Typography>
                  <Typography variant="body1">{tournament.location}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <GolfCourseIcon color="primary" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Course
                  </Typography>
                  <Typography variant="body1">{tournament.courseName}</Typography>
                </Box>
              </Box>

              {tournament.entryFee != null && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <AttachMoneyIcon color="primary" sx={{ mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Entry Fee
                    </Typography>
                    <Typography variant="body1">${tournament.entryFee}</Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CalendarTodayIcon color="primary" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {endDate ? 'Dates' : 'Date'}
                  </Typography>
                  <Typography variant="body1">{startDate}</Typography>
                  {endDate && (
                    <Typography variant="body1">– {endDate}</Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CalendarTodayIcon color="error" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Registration Deadline
                  </Typography>
                  <Typography variant="body1">{deadline}</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Categories */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
            Categories
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={tournament.gender} variant="outlined" />
            {tournament.ageGroups.map((ag) => (
              <Chip key={ag} label={ag} variant="outlined" color="primary" />
            ))}
          </Stack>
        </Box>

        {tournament.status === 'Open' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Button variant="contained" color="primary" size="large" fullWidth>
              Register Now
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}
