import Chip from "../../../../components/chip/Chip";
import { formatDate } from "../../../../utils/dateUtils";
import type { TopicRequestItem } from "./myRequestsService";

type TopicRequestCardProps = {
  item: TopicRequestItem;
  onClick: () => void;
};

export default function TopicRequestCard({ item, onClick }: TopicRequestCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-section-background p-4 transition-colors hover:border-gray-300 dark:hover:border-gray-700"
    >
      <div className="flex items-start justify-between gap-3">
        <h4
          className="line-clamp-2 min-w-0 break-words font-semibold text-text-primary"
          title={item.topic}
        >
          {item.topic}
        </h4>
      </div>

      {item.domains.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-text-secondary">Domains</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.domains.map((domain) => (
              <Chip key={domain} label={domain} variant="outlined" size="small" />
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-text-secondary">
        Requested on {formatDate(item.createdAt)}
      </p>
    </div>
  );
}
