'use client';

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import { Tournament } from '@/types/tournament';
import type { BookmarkEntry } from '@/lib/useBookmarks';

const statusColor: Record<Tournament['status'], 'success' | 'warning' | 'error' | 'default'> = {
  Open: 'success',
  Upcoming: 'warning',
  Closed: 'error',
  Completed: 'default',
};

interface TournamentCardProps {
  tournament: Tournament;
  bookmarkEntry?: BookmarkEntry | null;
  onBookmark?: (patch: Partial<BookmarkEntry>) => void;
}

// Parse ISO date strings as local time (not UTC) to avoid off-by-one day errors
function parseLocalDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`);
}

export default function TournamentCard({ tournament, bookmarkEntry, onBookmark }: TournamentCardProps) {
  const startDate = parseLocalDate(tournament.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const deadline = parseLocalDate(tournament.registrationDeadline).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const isSaved = bookmarkEntry?.saved ?? false;
  const isEnrolled = bookmarkEntry?.enrolled ?? false;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.({ saved: !isSaved });
  };

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.({ enrolled: !isEnrolled });
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} href={`/tournaments/${tournament.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {tournament.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, ml: 1 }}>
              <Chip
                label={tournament.status}
                color={statusColor[tournament.status]}
                size="small"
              />
              {onBookmark && (
                <>
                  <Tooltip title={isSaved ? 'Remove bookmark' : 'Save for later'}>
                    <IconButton size="small" onClick={handleSave} color={isSaved ? 'primary' : 'default'}>
                      {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isEnrolled ? 'Remove enrolled' : "Mark as enrolled"}>
                    <IconButton size="small" onClick={handleEnroll} color={isEnrolled ? 'success' : 'default'}>
                      {isEnrolled ? <CheckCircleIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
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
                  ` – ${parseLocalDate(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
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
