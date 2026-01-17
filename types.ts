
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  id: string;
  timestamp: Date;
  imageUrl?: string;
  isImage?: boolean;
  groundingLinks?: GroundingLink[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}
