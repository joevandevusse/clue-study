export interface ClueDto {
  question: string;
  answer: string;
  clueValue: string;
  round: string;
  gameDate: string;
  canonicalTopic: string;
}

export interface SeasonOption {
  label: string;
  fromDate: string | null; // null = no filter (all seasons)
}

export const SEASON_OPTIONS: SeasonOption[] = [
  { label: 'All Seasons',      fromDate: null         },
  { label: 'Season 30+ (2013)', fromDate: '2013-09-09' },
  { label: 'Season 35+ (2018)', fromDate: '2018-09-24' },
  { label: 'Season 38+ (2021)', fromDate: '2021-09-13' },
  { label: 'Season 40+ (2023)', fromDate: '2023-09-11' },
];

export const DEFAULT_SEASON = SEASON_OPTIONS[1]; // Season 30+ by default

export const ALL_TOPICS = '__all__'; // sentinel meaning "no topic filter"

export interface StudyConfig {
  topic: string;        // a canonical topic name, or ALL_TOPICS
  fromDate: string | null;
}
