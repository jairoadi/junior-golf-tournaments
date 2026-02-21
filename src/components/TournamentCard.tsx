import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import Link from 'next/link';
import { Tournament } from '@/types/tournament';

const statusColor: Record<Tournament['status'], 'success' | 'warning' | 'error' | 'default'> = {
  Open: 'success',
  Upcoming: 'warning',
  Closed: 'error',
  Completed: 'default',
};

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const deadline = new Date(tournament.registrationDeadline).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} href={`/tournaments/${tournament.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {tournament.name}
          </Typography>
          <Chip
            label={tournament.status}
            color={statusColor[tournament.status]}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {tournament.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <GolfCourseIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {tournament.courseName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {startDate}
              {tournament.endDate &&
                ` – ${new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip label={tournament.gender} size="small" variant="outlined" />
          {tournament.ageGroups.map((ag) => (
            <Chip key={ag} label={ag} size="small" variant="outlined" color="primary" />
          ))}
        </Stack>

        {tournament.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {tournament.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            Registration deadline: <strong>{deadline}</strong>
          </Typography>
          {tournament.entryFee != null && (
            <Typography variant="body2" fontWeight={600} color="primary.main">
              ${tournament.entryFee}
            </Typography>
          )}
        </Box>
      </CardContent>
      </CardActionArea>
    </Card>
  );
}
