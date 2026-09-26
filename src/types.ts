export type Language = 'en' | 'ar';

export interface Property {
  id: string;
  title: string;
  titleAr: string;
  location: string;
  locationAr: string;
  district: string;
  districtAr: string;
  neighborhood: string;
  neighborhoodAr: string;
  zone?: string;
  zoneAr?: string;
  price: number;
  currency?: string;
  isRental?: boolean; // Strictly Sale (false) or Rental (true)
  type: string; // Apartment, Commercial, Shop, Warehouse, Office, Villa, Land, House, Chalet
  typeAr: string;
  category?: 'residential' | 'commercial';
  commercialSubtype?: 'shop' | 'warehouse' | 'office';
  beds?: number; // Highlighted 3-bedroom, 4-bedroom
  baths?: number;
  areaSqm: number;
  buildingAge: 'under_construction' | '0_2' | '3_5' | '6_10' | '10_20' | '20_plus';
  buildingAgeLabel: string;
  buildingAgeLabelAr: string;
  imageUrl: string;
  isFeatured?: boolean;
  isPlatinum?: boolean;
  isArchived?: boolean; // Admin Archive feature
  archivedAt?: string;
  referenceNo: string;
  yearBuilt?: number;
  floor?: string;
  furnished?: 'unfurnished' | 'fully_furnished' | 'appliances_only';
  condition?: 'under_construction' | 'ready';
  paymentType?: 'lease_to_own' | 'installments' | 'cash' | 'cheque';
  amenities?: string[];
  description?: string;
  descriptionAr?: string;
  createdAt?: string;
}

export interface RegionHierarchy {
  id: string;
  nameEn: string;
  nameAr: string;
  count?: number;
  neighborhoods: {
    id: string;
    nameEn: string;
    nameAr: string;
    count?: number;
    subAreas?: {
      id: string;
      nameEn: string;
      nameAr: string;
      count?: number;
    }[];
  }[];
}

export interface SearchFilterState {
  location: string;
  subLocation?: string;
  propertyType: string;
  saleOrRental: string; // '' | 'sale' | 'rental'
  buildingAge: string;  // '' | 'under_construction' | '0_2' | '3_5' | '6_10' | '10_20' | '20_plus'
  areaRange: string;    // '' | '0-100' | '100-180' | '180-280' | '280-450' | '450+'
  bedrooms?: string;    // '' | '1' | '2' | '3' | '4' | '5+'
}
