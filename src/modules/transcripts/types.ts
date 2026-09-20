// Shape returned by GET /transcripts/domains (proxied from the Infollion domains API).
export type DomainOption = {
  id: number;
  name: string;
  parent_id: number | null;
  level: string;
  created_at: string | null;
  updated_at: string | null;
};

export type Expert = {
  name: string;
  designation: string;
  company: string;
  yearsOfExperience: number;
  aboutExpert: string;
  email: string;
  linkedinUrl: string;
};

export type Transcript = {
  id: string;
  title: string;
  domains: string[];
  preview: string;
  price: number;
  readMinutes: number;
  date: string;
  geography: string;
  keyInsights: string[];
  expert: Expert;
};

export type PriceFilterValue =
  "free" | "under-100" | "100-250" | "over-250";

export type PublishedDateFilterValue =
  "last-week" | "last-month" | "last-3-months" | "last-year";

export type SidebarFilterPayload = {
  domains: string[];
  price: PriceFilterValue[];
  publishedDate: PublishedDateFilterValue[];
};

export type PriceRange = {
  minPrice?: number;
  maxPrice?: number;
};

// Body payload for POST /api/transcripts/filter.
export type TranscriptsFilterPayload = {
  page: number;
  pageSize: number;
  domains?: string[];
  // General text search (topic, preview, domain, geography).
  search?: string;
  // One entry per selected price bucket, OR'd together server-side - not one
  // min-to-max span, which would wrongly include whatever sits between two
  // non-adjacent selected buckets (e.g. "Free" + "$170-$340").
  priceRanges?: PriceRange[];
  publishedAfter?: string;
};

export type TranscriptsApiResponse = {
  items: Transcript[];
  total: number;
  page: number;
  pageSize: number;
};

// GET /api/transcripts/filter-options - server-computed price filter buckets.
export type PriceFilterOption = {
  value: PriceFilterValue;
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
};

export type PublishedDateFilterOption = {
  value: PublishedDateFilterValue;
  label: string;
  // ISO cutoff from the server's clock, sent back as-is in publishedAfter.
  after: string;
};

export type FilterOptions = {
  priceOptions: PriceFilterOption[];
  publishedDateOptions: PublishedDateFilterOption[];
};
