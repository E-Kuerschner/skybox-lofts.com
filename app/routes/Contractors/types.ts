/**
 * Shapes shared by the contractors loader and the components that render it.
 *
 * Kept out of `contractors.server.ts` so client components can import them
 * without reaching into a server-only module.
 */
export type ContractorService = {
  id: number;
  name: string;
  slug: string;
};

export type ContractorPhoto = {
  id: number;
  contentType: string | null;
};

export type ContractorListing = {
  id: number;
  businessName: string;
  contactName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  services: ContractorService[];
  photos: ContractorPhoto[];
};
