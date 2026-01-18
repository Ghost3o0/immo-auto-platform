import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec support Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un prix en euros
 */
export function formatPrice(price: number, isRent = false): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);

  return isRent ? `${formatted}/mois` : formatted;
}

/**
 * Formate une date
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formate un kilométrage
 */
export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
}

/**
 * Formate une surface
 */
export function formatSurface(surface: number): string {
  return `${surface} m²`;
}

/**
 * Tronque un texte
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
