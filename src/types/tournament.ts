export type AgeGroup = 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'Open';
export type Gender = 'Boys' | 'Girls' | 'Mixed';
export type TournamentStatus = 'Open' | 'Closed' | 'Upcoming' | 'Completed';

export interface Tournament {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  location: string;
  state: string;
  courseName: string;
  ageGroups: AgeGroup[];
  gender: Gender;
  registrationDeadline: string;
  status: TournamentStatus;
  entryFee?: number;
  description?: string;
}

export interface SearchFilters {
  query: string;
  state: string;
  ageGroup: AgeGroup | '';
  gender: Gender | '';
  status: TournamentStatus | '';
}
