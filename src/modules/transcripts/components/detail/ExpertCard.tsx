import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { Expert } from "../../types";

type ExpertCardProps = {
  expert: Expert;
};

export default function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-main-background p-6">
      <p className="text-sm font-semibold text-text-primary">
        About the Expert
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
          <PersonOutlineIcon fontSize="medium" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">{expert.designation}</p>
          {expert.yearsOfExperience > 0 && (
            <p className="text-sm text-text-secondary">
              {expert.yearsOfExperience} yrs exp
            </p>
          )}
        </div>
      </div>

      {expert.aboutExpert && (
        <p className="mt-3 text-sm text-text-secondary">{expert.aboutExpert}</p>
      )}
    </div>
  );
}
