export interface User {
  username: string;
  password: string;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';
export type SortLabel =
  | 'Name (A to Z)'
  | 'Name (Z to A)'
  | 'Price (low to high)'
  | 'Price (high to low)';

export const SortOptions: Record<SortOption, SortLabel> = {
  az: 'Name (A to Z)',
  za: 'Name (Z to A)',
  lohi: 'Price (low to high)',
  hilo: 'Price (high to low)',
};

export type UserType = 'standard' | 'locked' | 'problem' | 'performance';
