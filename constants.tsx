
import React from 'react';
import { StorageLocation, FoodItem } from './types';

export const COLORS = {
  primary: '#2ECC71', // Fresh Green
  secondary: '#F39C12', // Warning Orange
  accent: '#2980B9', // Deep Blue
  background: '#F8F9FA',
  text: '#2C3E50',
};

export const MOCK_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: 'Fresh Milk',
    category: 'Dairy',
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    storage: StorageLocation.FRIDGE,
    quantity: 1,
    unit: 'Liter',
    addedAt: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1550583726-2248277c63b2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '2',
    name: 'Organic Eggs',
    category: 'Dairy',
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    storage: StorageLocation.FRIDGE,
    quantity: 12,
    unit: 'pieces',
    addedAt: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    expiryDate: new Date(Date.now()).toISOString(),
    storage: StorageLocation.PANTRY,
    quantity: 1,
    unit: 'Loaf',
    addedAt: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '4',
    name: 'Fresh Spinach',
    category: 'Vegetables',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    storage: StorageLocation.FRIDGE,
    quantity: 200,
    unit: 'g',
    addedAt: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1523456762287-1422b761074c?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '5',
    name: 'Greek Yogurt',
    category: 'Dairy',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    storage: StorageLocation.FRIDGE,
    quantity: 500,
    unit: 'g',
    addedAt: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const CATEGORIES = ['Dairy', 'Vegetables', 'Fruits', 'Meat', 'Bakery', 'Pantry Essentials', 'Snacks'];
