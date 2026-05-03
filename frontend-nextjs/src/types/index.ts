export interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  city: string;
  country: string;
  region?: string;
  main_image: string;
  price_per_person: number;
  discount_price: number;
  duration: number;
  duration_days?: number;
  difficulty: string;
  max_people: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  category?: Category;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
}

export interface Category {
  id: number;
  name: string;
}