import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useTranscripts } from "../hooks/useTranscripts";
import { useFilterOptions } from "../hooks/useFilterOptions";
import { usePurchasedTranscriptIds } from "../../orders/hooks/usePurchasedTranscriptIds";
import { buildTranscriptsFilterPayload } from "../transcriptsService";
import TranscriptCard from "../components/cards/TranscriptCard";
import TranscriptCardSkeleton from "../components/cards/TranscriptCardSkeleton";
import FilterSidebar from "../components/filter-sidebar/FilterSidebar";
import Button from "../../../components/button/Button";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import PaginationComponent from "../../../components/pagination/Pagination";
import RequestTopicDialog from "../components/request-topic-dialog";
import WarningDialog from "../../../components/form-close-warning/WarningDialog";
import DialogModal from "../../../components/dialog/DialogModal";
import FilterAltIcon from "../../../icons/FilterAlt/FilterAlt";
import { useFormCloseWarning } from "../../../utils/hooks/useFormCloseWarning";
import { useBoolean } from "../../../utils/hooks/useBoolean";
import { DEFAULT_SIDEBAR_FILTERS } from "../components/filter-sidebar/constants";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../constants";
import type {
  PriceFilterValue,
  PublishedDateFilterValue,
  SidebarFilterPayload,
} from "../types";

export default function TranscriptsList() {
  const { transcripts, total, isLoading, error, loadTranscripts, loadPurchasedTranscripts } =
    useTranscripts();
  const { purchasedIds } = usePurchasedTranscriptIds();
  const filterOptions = useFilterOptions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilterPayload>(
    () => ({
      domains:
        searchParams.get("domains")?.split(",").filter(Boolean) ??
        DEFAULT_SIDEBAR_FILTERS.domains,
      price:
        (searchParams
          .get("price")
          ?.split(",")
          .filter(Boolean) as PriceFilterValue[] | undefined) ??
        DEFAULT_SIDEBAR_FILTERS.price,
      publishedDate:
        (searchParams
          .get("publishedDate")
          ?.split(",")
          .filter(Boolean) as PublishedDateFilterValue[] | undefined) ??
        DEFAULT_SIDEBAR_FILTERS.publishedDate,
    }),
  );
  const [purchasedOnly, setPurchasedOnly] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const requestTopicDialog = useFormCloseWarning();
  const mobileFilters = useBoolean();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSidebarFilters(DEFAULT_SIDEBAR_FILTERS);
    setPage(1);
  };

  // Debounced so typing doesn't fire a network request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (sidebarFilters.domains.length) {
      params.domains = sidebarFilters.domains.join(",");
    }
    if (sidebarFilters.price.length) {
      params.price = sidebarFilters.price.join(",");
    }
    if (sidebarFilters.publishedDate.length) {
      params.publishedDate = sidebarFilters.publishedDate.join(",");
    }
    if (page !== 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [search, sidebarFilters, page, setSearchParams]);

  // Only depend on filterOptions when a price/date bucket is selected, to avoid
  // re-triggering an identical request once it loads.
  const payloadRelevantOptions =
    sidebarFilters.price.length || sidebarFilters.publishedDate.length
      ? filterOptions
      : null;

  useEffect(() => {
    if (purchasedOnly) {
      loadPurchasedTranscripts(page, PAGE_SIZE);
    } else {
      loadTranscripts(
        buildTranscriptsFilterPayload(
          debouncedSearch,
          sidebarFilters,
          page,
          PAGE_SIZE,
          payloadRelevantOptions,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasedOnly, debouncedSearch, sidebarFilters, page, payloadRelevantOptions]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        isSearch
        searchPlaceholder="Search transcripts..."
        searchValue={search}
        onSearch={handleSearchChange}
        isExtraComponent
        component={
          <Button
            variant="outlined"
            label="Can't find it? Request A Topic"
            onClick={requestTopicDialog.open}
            styles={{
              fontWeight: 500,
              fontSize: "13px",
              height: "36px",
              borderRadius: "9999px",
              whiteSpace: "nowrap",
            }}
          />
        }
      />

      <main className="flex-1 flex flex-col pt-[var(--header-height)]">
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-12 lg:px-20 py-8 flex-1 min-h-[calc(100vh-var(--header-height))]">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="hidden lg:block">
              <FilterSidebar
                filters={sidebarFilters}
                setFilters={(filters) => {
                  setSidebarFilters(filters);
                  setPage(1);
                }}
                purchasedOnly={purchasedOnly}
                setPurchasedOnly={(value) => {
                  setPurchasedOnly(value);
                  setPage(1);
                }}
                options={filterOptions}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-text-primary">
                  All transcripts
                </h1>
                <button
                  type="button"
                  aria-label="Open filters"
                  onClick={mobileFilters.setTrue}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-text-primary lg:hidden"
                >
                  <FilterAltIcon fontSize="small" />
                  Filters
                </button>
              </div>

              {isLoading || error ? (
                <div className="mt-4 flex flex-col gap-3 pr-2">
                  <TranscriptCardSkeleton />
                  <TranscriptCardSkeleton />
                  <TranscriptCardSkeleton />
                </div>
              ) : transcripts.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-semibold text-text-primary">
                    {purchasedOnly
                      ? "No purchased transcripts "
                      : "No results found."}
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex max-h-[960px] flex-col gap-3 overflow-y-scroll pr-2">
                  {transcripts.map((transcript) => (
                    <TranscriptCard
                      key={transcript.id}
                      transcript={transcript}
                      isPurchased={purchasedOnly || purchasedIds.includes(transcript.id)}
                    />
                  ))}
                </div>
              )}

              {total > 0 && (
                <div className="mt-8">
                  <PaginationComponent
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogModal
            isOpen={mobileFilters.value}
            handleClose={mobileFilters.setFalse}
            title="Filters"
            isFullScreen
            // MUI zeroes padding-top on content that directly follows a DialogTitle
            contentSx={{ paddingTop: "16px !important" }}
          >
            <FilterSidebar
              filters={sidebarFilters}
              setFilters={(filters) => {
                setSidebarFilters(filters);
                setPage(1);
              }}
              purchasedOnly={purchasedOnly}
              setPurchasedOnly={(value) => {
                setPurchasedOnly(value);
                setPage(1);
              }}
              options={filterOptions}
            />
            <Button
              variant="contained"
              label={`Show ${total} result${total === 1 ? "" : "s"}`}
              onClick={mobileFilters.setFalse}
              // MUI's own margin reset beats Tailwind's layered mt-* utilities
              styles={{ marginTop: "24px" }}
              className="w-full"
            />
          </DialogModal>

          <RequestTopicDialog
            isOpen={requestTopicDialog.isOpen}
            handleClose={requestTopicDialog.requestClose}
            onDirtyChange={requestTopicDialog.setDirty}
            handleSubmitClose={requestTopicDialog.notifySubmitted}
          />
          <WarningDialog
            open={requestTopicDialog.isWarningOpen}
            handleClose={requestTopicDialog.closeWarning}
            handleYesClick={requestTopicDialog.confirmDiscard}
          />
        </div>
        <Footer />
      </main>
    </div>
  );
}
