
export enum StorageLocation {
  FRIDGE = 'Fridge',
  PANTRY = 'Pantry',
  FREEZER = 'Freezer'
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  expiryDate: string; // ISO string
  storage: StorageLocation;
  quantity: number;
  unit: string;
  addedAt: string;
  image?: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  image: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
