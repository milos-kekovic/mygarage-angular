export interface Car {
  id: string;
  garage_id: string;
  user_id: string | null;
  brand: string;
  model: string;
  year: number;
  image_url: string | null;
  registration_number: string | null;
  registration_expiry_date: string | null;
  registration_certificate: string | null;
  vignette_expiry_date: string | null;
  current_mileage: number | null;
  created_at: string | null;
  updated_at: string | null;
  brand_logo_url: string | null;
  parking_slot: string | null;
  traffic_permit: string | null;
}