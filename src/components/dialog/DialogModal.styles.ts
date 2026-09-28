import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

export const dialogPaperSx: SystemStyleObject<Theme> = {
  "& .MuiDialog-paper": {
    borderRadius: "10px",
    backgroundColor: "var(--color-layout-background)",
  },
};

export const dialogTitleSx: SystemStyleObject<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  borderBottom: "2px solid rgba(112, 112, 112, 0.2)",
  backgroundColor: "var(--color-main-background)",
  paddingLeft: "16px !important",
  paddingRight: "16px",
  paddingTop: "10px",
  paddingBottom: "9px",
  "@media print": {
    display: "none",
  },
};

export const dialogTitleHeadSx: SystemStyleObject<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minWidth: 0,
  fontSize: "16px",
  fontWeight: 500,
  paddingTop: "5px",
};

export const dialogCloseGridSx: SystemStyleObject<Theme> = {
  flexShrink: 0,
  pl: 1,
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: "5px",
};

export const dialogContentSx: SystemStyleObject<Theme> = {
  backgroundColor: "var(--color-main-background)",
  padding: "0.75rem 1rem",
};
