export interface PendingSurvey {
  id: number;
  title: string;
  description?: string;
  status: string;
  anonymous: boolean;
  deadline?: string;
  createdAt: string;
  questionCount: number;
  targetRoles: string[];
  totalResponses: number;
  // enriquecido en frontend
  eventId?: number;
  eventTitle?: string;
}

export interface SurveyDetail {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  anonymous: boolean;
  deadline?: string;
  targetRoles: string[];
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: number;
  questionText: string;
  questionType: 'OPEN_TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RATING';
  required: boolean;
  displayOrder: number;
  options: SurveyOption[];
}

export interface SurveyOption {
  id: number;
  optionText: string;
  displayOrder: number;
}