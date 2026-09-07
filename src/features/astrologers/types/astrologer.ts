export type AstrologerAvailability = "bookable" | "soon";

export type AstrologerListItem = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  avatarSrc: string;
  primaryExpertise: string;
  expertiseKey: string;
  specialties: string[];
  languages: string[];
  availability: AstrologerAvailability;
};

export type FilterOption = {
  value: string;
  label: string;
};
