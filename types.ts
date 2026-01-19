
export interface KnowledgeEntry {
  id: string;
  category: 'Admissions' | 'Fee Structure' | 'Academic Programs' | 'Academic Calendar' | 'Convocation' | 'General';
  content: string;
  sourceDocument: string;
  pageNumber: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  sources?: string[];
}

export interface LogEntry {
  timestamp: string;
  query: string;
  categoriesMatched: string[];
  confidenceScore: number;
}
