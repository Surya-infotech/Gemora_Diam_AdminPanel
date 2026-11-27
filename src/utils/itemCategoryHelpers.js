/**
 * Helpers for category-specific product attributes (Rings, Earrings).
 */
export const isRingCategoryName = name => /\brings?\b/i.test(String(name || "").trim());

export const isEarringsCategoryName = name => /\bearr?ings?\b/i.test(String(name || "").trim());

export const CLOSURE_TYPE_OPTIONS = [{
  label: "Screw Back",
  value: "Screw Back"
}, {
  label: "Push Back",
  value: "Push Back"
}];

export const normalizeClosureTypes = raw => {
  if (!raw) return [];
  let list = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      list = Array.isArray(parsed) ? parsed : [trimmed];
    } catch {
      list = [trimmed];
    }
  }
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    const text = typeof item === "string" ? item.trim() : String(item?.label || item?.closuretype || item?.value || "").trim();
    return text ? {
      label: text,
      value: text
    } : null;
  }).filter(Boolean);
};
