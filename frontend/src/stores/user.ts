import { writable } from 'svelte/store';

export interface User {
  email: string;
  type: string;
}

export const user = writable<User | null>(null);