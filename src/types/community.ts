export interface Challenge {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  participants: string[];
  submissions: number;
  prize: string;
  createdAt: Date;
}

export interface SkillCommunity {
  id: string;
  name: string;
  description: string;
  members: string[];
  topics: string[];
  icon: string;
  createdAt: Date;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
} 