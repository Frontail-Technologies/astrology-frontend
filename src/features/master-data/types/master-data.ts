export type MasterDataStatus = "active" | "inactive";

export const masterDataTypes = ["languages", "countries", "states", "cities", "expertise", "specialties", "tags", "consultation-modes", "pooja-categories"] as const;
export type MasterDataType = (typeof masterDataTypes)[number];

export type MasterDataBase = {
  id: string;
  name: string;
  status: MasterDataStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type LanguageRecord = MasterDataBase & { nativeName: string; code: string; direction: "ltr" | "rtl"; isDefault: boolean };
export type CountryRecord = MasterDataBase & { isoCode: string; phoneCode?: string };
export type StateRecord = MasterDataBase & { code: string; countryId: string };
export type CityRecord = MasterDataBase & { stateId: string };
export type TaxonomyRecord = MasterDataBase & { slug: string; description?: string; imageSrc?: string; technicalKey?: string };

export type MasterDataStore = {
  languages: LanguageRecord[];
  countries: CountryRecord[];
  states: StateRecord[];
  cities: CityRecord[];
  expertise: TaxonomyRecord[];
  specialties: TaxonomyRecord[];
  tags: TaxonomyRecord[];
  "consultation-modes": TaxonomyRecord[];
  "pooja-categories": TaxonomyRecord[];
};

export type MasterDataRecord = MasterDataStore[MasterDataType][number];
