import { useEffect, useState } from "react";
import DialogModal from "../../../../components/dialog/DialogModal";
import Chip from "../../../../components/chip/Chip";
import { formatDate } from "../../../../utils/dateUtils";
import { fetchTopicRequestDetail } from "./myRequestsService";
import type { TopicRequestDetail, TopicRequestItem } from "./myRequestsService";
import { REMARK_PREVIEW_LENGTH } from "../../constants";

type TopicRequestDetailsDialogProps = {
  item: TopicRequestItem | null;
  handleClose: () => void;
};

export default function TopicRequestDetailsDialog({
  item,
  handleClose,
}: TopicRequestDetailsDialogProps) {
  // The list item already has enough to render the dialog immediately
  // (topic/status/domains/requested-on) - remark and the suggested-expert
  // fields aren't in the list response, so they're fetched separately here
  // and fill in once loaded rather than delaying the dialog opening.
  const [detail, setDetail] = useState<TopicRequestDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isRemarkExpanded, setIsRemarkExpanded] = useState(false);

  useEffect(() => {
    setIsRemarkExpanded(false);
    if (!item) {
      setDetail(null);
      setIsDetailLoading(false);
      return;
    }
    let isActive = true;
    setIsDetailLoading(true);
    fetchTopicRequestDetail(item.id)
      .then((result) => {
        if (isActive) setDetail(result);
      })
      .catch(() => {
        // Remark/expert fields just stay hidden if this fails - the rest of
        // the dialog (from `item`) still renders fine.
      })
      .finally(() => {
        if (isActive) setIsDetailLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [item]);

  if (!item) return null;

  // Backend stores one name/linkedin pair per request, so multiple suggested
  // experts arrive as two "; "-joined strings (see form.tsx) - zip them back
  // into pairs so each expert's name and link show together.
  const expertNames = detail?.suggestedExpertName
    ? detail.suggestedExpertName.split("; ")
    : [];
  const expertLinkedins = detail?.suggestedExpertLinkedin
    ? detail.suggestedExpertLinkedin.split("; ")
    : [];
  const suggestedExperts = Array.from(
    { length: Math.max(expertNames.length, expertLinkedins.length) },
    (_, i) => ({
      name: expertNames[i] ?? "",
      linkedin: expertLinkedins[i] ?? "",
    }),
  );

  return (
    <DialogModal
      isOpen={!!item}
      handleClose={handleClose}
      title="Request details"
      dialogSx={{
        "& .MuiDialog-paper": {
          maxWidth: "600px",
          width: "100%",
          borderRadius: "16px",
        },
      }}
      contentSx={{ padding: "1.25rem 1.5rem" }}
    >
      <div className="mt-6 grid grid-cols-[max-content_1fr] items-center gap-x-6 gap-y-3">

        <p className="text-sm text-text-secondary">Topic:</p>
        <p className="min-w-0 break-words text-sm text-text-primary">
          {item.topic}
        </p>

        {item.domains.length > 0 && (
          <>
            <p className="text-sm text-text-secondary">Domains:</p>
            <div className="flex flex-wrap gap-1.5">
              {item.domains.map((domain) => (
                <Chip key={domain} label={domain} variant="outlined" size="small" />
              ))}
            </div>
          </>
        )}

        <p className="text-sm text-text-secondary">Requested on:</p>
        <p className="text-sm text-text-primary">{formatDate(item.createdAt)}</p>

        {isDetailLoading && (
          <div className="col-span-2 flex flex-col gap-2 pt-1">
            <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3.5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        )}

        {detail?.remark && (
          <>
            <p className="text-sm text-text-secondary">Remark:</p>
            <p className="min-w-0 break-words text-sm text-text-primary">
              {isRemarkExpanded || detail.remark.length <= REMARK_PREVIEW_LENGTH
                ? detail.remark
                : `${detail.remark.slice(0, REMARK_PREVIEW_LENGTH)}...`}
              {detail.remark.length > REMARK_PREVIEW_LENGTH && (
                <button
                  type="button"
                  onClick={() => setIsRemarkExpanded((prev) => !prev)}
                  className="ml-1 cursor-pointer font-medium text-accent-2 hover:underline"
                >
                  {isRemarkExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </p>
          </>
        )}

        {suggestedExperts.length > 0 && (
          <>
            <p className="text-sm text-text-secondary">
              {suggestedExperts.length > 1
                ? "Suggested experts:"
                : "Suggested expert:"}
            </p>
            <div className="flex flex-col gap-1">
              {suggestedExperts.map((expert, index) => (
                <p
                  key={index}
                  className="min-w-0 break-words text-sm text-text-primary"
                >
                  {expert.name && (
                    <span className="font-medium">{expert.name}</span>
                  )}
                  {expert.name && expert.linkedin && ":  "}
                  {expert.linkedin && (
                    <a
                      href={expert.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-accent-2 hover:underline"
                    >
                      {expert.linkedin}
                    </a>
                  )}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </DialogModal>
  );
}
