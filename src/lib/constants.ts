export const SEARCH_KEYWORDS = [
  "SEO product manager",
  "growth product manager",
  "growth lead",
  "head of growth",
] as const;

export const SEARCH_LOCATIONS = [
  {
    label: "Remote",
    value: "remote" as const,
    serpApiParam: "United States",
    serpApiExtra: { ltype: "1" },
  },
  {
    label: "New York",
    value: "new_york" as const,
    serpApiParam: "New York, New York, United States",
  },
  {
    label: "Colorado",
    value: "colorado" as const,
    serpApiParam: "Colorado, United States",
  },
] as const;

export const ITEMS_PER_PAGE = 20;

export const WORK_TYPE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "In Office", value: "in_office" },
] as const;

export const JOB_TYPE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Product", value: "product" },
  { label: "Growth", value: "growth" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Entry Level", value: "entry" },
  { label: "Mid Level", value: "mid" },
  { label: "Senior", value: "senior" },
] as const;

export const LOCATION_FILTER_OPTIONS = [
  { label: "All Locations", value: "" },
  { label: "Remote", value: "remote" },
  { label: "New York", value: "new_york" },
  { label: "Colorado", value: "colorado" },
] as const;
