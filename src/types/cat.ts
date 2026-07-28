export type CatAnalysis = {
  color: string;
  breed: string;
  coat: string;
  description: string;
};

export type Cat = {
  id: string;
  number: number;
  name: string;
  photoUri: string;
  latitude: number;
  longitude: number;
  discoveredAt: string;
  views: number;
  notes?: string;
  analysis: CatAnalysis;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  provider: 'apple' | 'google' | 'email';
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};
