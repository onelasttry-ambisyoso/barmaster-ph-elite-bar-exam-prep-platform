export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type Subject = 
  | 'Political Law'
  | 'Labor Law'
  | 'Civil Law'
  | 'Taxation Law'
  | 'Mercantile Law'
  | 'Criminal Law'
  | 'Remedial Law'
  | 'Legal Ethics';
export interface CodalProvision {
  id: string;
  subject: Subject;
  title: string; // e.g., "Article 1"
  content: string; // The full text to type
  reference: string; // e.g., "Civil Code of the Philippines"
}
export interface SRSParams {
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: number; // timestamp
}
export interface StudyProgress {
  id: string; // userId:codalId
  userId: string;
  codalId: string;
  srs: SRSParams;
  lastGraded: number;
  history: { date: number; grade: number }[];
}
export interface User {
  id: string;
  name: string;
  joinedAt: number;
}
export interface DashboardStats {
  dueCount: number;
  streak: number;
  totalMastered: number;
  nextExamDays: number;
}