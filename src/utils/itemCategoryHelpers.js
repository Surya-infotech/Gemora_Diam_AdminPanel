/**
 * Helpers for category-specific product attributes (Rings, Earrings).
 */
export const isRingCategoryName = name => /\brings?\b/i.test(String(name || "").trim());

export const isEarringsCategoryName = name => /\bearr?ings?\b/i.test(String(name || "").trim());

export const CLOSURE_TYPE_OPTIONS = [{
  label: "Select closure type",
  value: ""
}, {
  label: "Screw Back",
  value: "Screw Back"
}, {
  label: "Push Back",
  value: "Push Back"
}];
