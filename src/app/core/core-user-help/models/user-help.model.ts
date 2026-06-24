export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface HelpSearchResult {
  title: string;
  description: string;
  category?: string;
  slug?: string;
}

export interface HelpArticleSection {
  title: string;
  description: string;
  steps?: string[];
}

export interface HelpFrequentlyAskedQuestion {
  question: string;
  answer: string;
}

export interface HelpCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export interface HelpCategoryDetail extends HelpCategory {
  content?: string;
  articles?: HelpSearchResult[];
  sections?: HelpArticleSection[];
  faqs?: HelpFrequentlyAskedQuestion[];
}

export interface HelpChatConfig {
  title: string;
  status: string;
  welcomeMessage: string;
  quickActions: string[];
  inputPlaceholder: string;
}

export interface HelpHomeResponse {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  categories: HelpCategory[];
  chat: HelpChatConfig;
}

export interface HelpSearchResponse {
  results: HelpSearchResult[];
  suggestions?: string[];
}

export interface HelpManualSection {
  id: string;
  title: string;
  content: string;
  order?: number;
}

export interface HelpManualResponse {
  title: string;
  sections: HelpManualSection[];
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  suggestions: string[];
  redirectToSupport: boolean;
}

export type SupportTicketType = 'TECHNICAL' | 'ACCOUNT' | 'EVENT' | 'PLAN' | 'OTHER';
export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CreateSupportTicketRequest {
  type: SupportTicketType;
  description: string;
  priority: SupportTicketPriority;
}

export interface SupportResponse {
  message: string;
  respondedAt: string;
  respondedBy: string;
}

export interface SupportTicketResponse {
  id: string;
  userId?: string;
  userEmail?: string;
  type: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  adminResponse?: string;
}
