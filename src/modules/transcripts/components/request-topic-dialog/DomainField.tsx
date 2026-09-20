import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Checkbox from "../../../../components/checkbox/Checkbox";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { RequestServer } from "../../../../utils/services";
import { commonInputStyles } from "../../../../common/input-styles";
import { filterByPrefixThenSubstring } from "../../../../utils/autocompleteFilters";
import type { RequestTopicFormValues } from "./types";
import type { DomainOption } from "../../types";
import { MIN_DOMAINS, MAX_DOMAINS } from "../../constants";
import { domainCheckboxSx } from "../filter-sidebar/filter-sidebar.styles";

type DomainFieldProps = {
  control: Control<RequestTopicFormValues>;
};

export default function DomainField({ control }: DomainFieldProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    RequestServer<DomainOption[]>(API_ENDPOINTS.domains, "GET")
      .then((domains) => setOptions(domains.map((domain) => domain.name)))
      .catch(() => {});
  }, []);

  return (
    <Controller
      name="domains"
      control={control}
      rules={{
        validate: (value) => {
          if (value.length < MIN_DOMAINS) {
            return `Please add at least ${MIN_DOMAINS} domains`;
          }
          if (value.length > MAX_DOMAINS) {
            return `You can add at most ${MAX_DOMAINS} domains`;
          }
          return true;
        },
      }}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <Autocomplete
          multiple
          disableCloseOnSelect
          size="small"
          options={options}
          value={value}
          getOptionLabel={(option) => option}
          filterOptions={(opts, { inputValue }) =>
            filterByPrefixThenSubstring(opts, inputValue)
          }
          onChange={(_event, newValue) => onChange(newValue.slice(0, MAX_DOMAINS))}
          renderOption={(props, option, { selected }) => (
            <li {...props} key={option}>
              <Checkbox checked={selected} sx={domainCheckboxSx} />
              <span className="flex-1">{option}</span>
            </li>
          )}
          renderTags={(tagValue, getTagProps) => {
            const visibleCount = showAllTags
              ? tagValue.length
              : Math.min(tagValue.length, 2);
            const hiddenCount = tagValue.length - visibleCount;
            return (
              <>
                {tagValue.slice(0, visibleCount).map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip key={key} label={option} size="small" {...tagProps} />
                  );
                })}
                {hiddenCount > 0 && (
                  <span
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowAllTags(true);
                    }}
                    className="cursor-pointer hover:underline"
                  >
                    +{hiddenCount} more
                  </span>
                )}
                {showAllTags && tagValue.length > 2 && (
                  <span
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowAllTags(false);
                    }}
                    className="cursor-pointer hover:underline"
                  >
                    Show less
                  </span>
                )}
              </>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              {...commonInputStyles}
              inputRef={ref}
              label="Domain"
              placeholder={value.length ? undefined : "Search domains"}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      )}
    />
  );
}
