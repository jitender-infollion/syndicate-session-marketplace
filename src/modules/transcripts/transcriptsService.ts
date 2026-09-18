import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { RequestServer } from "../../utils/services";
import type {
  FilterOptions,
  PriceFilterValue,
  PriceRange,
  SidebarFilterPayload,
  Transcript,
  TranscriptsApiResponse,
  TranscriptsFilterPayload,
} from "./types";

// Backend shape, kept separate from the frontend's `Transcript` type - mapTranscript() converts.
export type RawExpert = {
  id: number;
  name: string | null;
  designation: string | null;
  yearsOfExperience: number | null;
  aboutExpert: string | null;
};

export type RawTranscript = {
  id: string | number;
  topic: string | null;
  domains: string[];
  geographies: string[];
  preview: string | null;
  keyInsights: string[];
  publishedAt: string | null;
  price: number;
  expert: RawExpert | null;
};

type RawPage<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export const mapTranscript = (raw: RawTranscript): Transcript => ({
  id: String(raw.id),
  title: raw.topic ?? "Untitled",
  domains: raw.domains,
  preview: raw.preview ?? "",
  price: raw.price,
  readMinutes: 5,
  date: raw.publishedAt ?? "",
  geography: raw.geographies.join(", "),
  keyInsights: raw.keyInsights,
  expert: {
    name: raw.expert?.name ?? "Unknown",
    designation: raw.expert?.designation ?? "",
    company: "",
    yearsOfExperience: raw.expert?.yearsOfExperience ?? 0,
    aboutExpert: raw.expert?.aboutExpert ?? "",
    email: "",
    linkedinUrl: "",
  },
});

export const fetchFilterOptions = async (): Promise<FilterOptions> =>
  RequestServer<FilterOptions>(API_ENDPOINTS.filterOptions, "GET");

// One range per selected bucket, OR'd server-side - not unioned into a single min-to-max span.
const selectedPriceRanges = (
  selected: PriceFilterValue[],
  options: FilterOptions | null,
): PriceRange[] =>
  selected
    .map((value) => options?.priceOptions.find((option) => option.value === value))
    .filter((option) => option !== undefined)
    .map((option) => ({
      minPrice: option.minPrice ?? undefined,
      maxPrice: option.maxPrice ?? undefined,
    }));

// Builds the body for POST /api/transcripts/filter, omitting default filters.
export const buildTranscriptsFilterPayload = (
  search: string,
  filters: SidebarFilterPayload,
  page: number,
  pageSize: number,
  options: FilterOptions | null,
): TranscriptsFilterPayload => {
  const payload: TranscriptsFilterPayload = { page, pageSize };
  if (search) payload.search = search;
  if (filters.domains.length) payload.domains = filters.domains;
  if (filters.price.length) {
    payload.priceRanges = selectedPriceRanges(filters.price, options);
  }
  if (filters.publishedDate.length && options) {
    // Buckets are nested (last-week ⊂ last-year), so the earliest cutoff covers the union.
    const cutoffs = filters.publishedDate
      .map((value) => options.publishedDateOptions.find((option) => option.value === value))
      .filter((option) => option !== undefined)
      .map((option) => new Date(option.after).getTime());
    if (cutoffs.length) {
      payload.publishedAfter = new Date(Math.min(...cutoffs)).toISOString();
    }
  }
  return payload;
};

export const fetchTranscripts = async (
  payload: TranscriptsFilterPayload,
): Promise<TranscriptsApiResponse> => {
  const raw = await RequestServer<RawPage<RawTranscript>>(
    API_ENDPOINTS.transcriptsFilter,
    "POST",
    {
      page: payload.page,
      limit: payload.pageSize,
      domains: payload.domains,
      search: payload.search,
      priceRanges: payload.priceRanges,
      publishedAfter: payload.publishedAfter,
    },
  );
  return {
    items: raw.items.map(mapTranscript),
    total: raw.meta.total,
    page: raw.meta.page,
    pageSize: raw.meta.limit,
  };
};

export const fetchTranscriptById = async (id: string): Promise<Transcript> => {
  const raw = await RequestServer<RawTranscript>(
    API_ENDPOINTS.transcriptDetail.replace(":id", id),
    "GET",
  );
  return mapTranscript(raw);
};

// Backend ranks by domain overlap then relevance; no client-side filtering needed.
export const fetchSimilarTranscripts = async (
  id: string,
  limit: number,
): Promise<Transcript[]> => {
  const raw = await RequestServer<RawTranscript[]>(
    `${API_ENDPOINTS.transcriptSimilar.replace(":id", id)}?limit=${limit}`,
    "GET",
  );
  return raw.map(mapTranscript);
};

// Entitlement-backed (includes admin-granted access); loops to completion so a
// truncated page can't miss an owned item.
const fetchAllPurchasedPages = async <T>(
  mapItem: (raw: RawTranscript) => T,
): Promise<T[]> => {
  const limit = 20;
  let page = 1;
  const items: T[] = [];

  while (true) {
    const raw = await RequestServer<RawPage<RawTranscript>>(
      `${API_ENDPOINTS.myPurchased}?page=${page}&limit=${limit}`,
      "GET",
    );
    items.push(...raw.items.map(mapItem));
    if (items.length >= raw.meta.total || raw.items.length === 0) break;
    page += 1;
  }

  return items;
};

export const fetchPurchasedTranscriptIds = (): Promise<string[]> =>
  fetchAllPurchasedPages((item) => String(item.id));

// Same source as fetchPurchasedTranscriptIds but keeps full details, for order/invoice rows.
export const fetchAllPurchasedTranscripts = (): Promise<Transcript[]> =>
  fetchAllPurchasedPages(mapTranscript);

// Backs the "Purchased only" toggle with a real server page, not a client-side filter.
export const fetchPurchasedTranscriptsPage = async (
  page: number,
  pageSize: number,
): Promise<TranscriptsApiResponse> => {
  const raw = await RequestServer<RawPage<RawTranscript>>(
    `${API_ENDPOINTS.myPurchased}?page=${page}&limit=${pageSize}`,
    "GET",
  );
  return {
    items: raw.items.map(mapTranscript),
    total: raw.meta.total,
    page: raw.meta.page,
    pageSize: raw.meta.limit,
  };
};
