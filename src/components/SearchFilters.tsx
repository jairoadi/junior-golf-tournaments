'use client';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { SearchFilters as SearchFiltersType, AgeGroup, Gender, TournamentStatus } from '@/types/tournament';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const AGE_GROUPS: AgeGroup[] = ['U10', 'U12', 'U14', 'U16', 'U18', 'Open'];
const GENDERS: Gender[] = ['Boys', 'Girls', 'Mixed'];
const STATUSES: TournamentStatus[] = ['Open', 'Upcoming', 'Closed', 'Completed'];

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  onClear: () => void;
}

export default function SearchFilters({ filters, onChange, onClear }: SearchFiltersProps) {
  const set = <K extends keyof SearchFiltersType>(key: K, value: SearchFiltersType[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography fontWeight={600}>Filters</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              label="State"
              value={filters.state}
              onChange={(e) => set('state', e.target.value)}
            >
              <MenuItem value="">All States</MenuItem>
              {US_STATES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Age Group</InputLabel>
            <Select
              label="Age Group"
              value={filters.ageGroup}
              onChange={(e) => set('ageGroup', e.target.value as AgeGroup | '')}
            >
              <MenuItem value="">All Ages</MenuItem>
              {AGE_GROUPS.map((ag) => (
                <MenuItem key={ag} value={ag}>{ag}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              label="Gender"
              value={filters.gender}
              onChange={(e) => set('gender', e.target.value as Gender | '')}
            >
              <MenuItem value="">All</MenuItem>
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => set('status', e.target.value as TournamentStatus | '')}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" color="secondary" size="small" onClick={onClear}>
            Clear Filters
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
