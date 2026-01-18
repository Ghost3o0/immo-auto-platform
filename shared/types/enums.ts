/**
 * Enums partagés entre frontend et backend
 */

/** Rôle utilisateur */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/** Type de listing (vente ou location) */
export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT',
}

/** Type de propriété immobilière */
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  STUDIO = 'STUDIO',
  LOFT = 'LOFT',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OFFICE = 'OFFICE',
}

/** Type de véhicule */
export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  SUV = 'SUV',
  SCOOTER = 'SCOOTER',
}

/** Type de carburant */
export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  LPG = 'LPG',
}

/** Type de transmission */
export enum Transmission {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
}

/** Statut d'une annonce */
export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  INACTIVE = 'INACTIVE',
}
