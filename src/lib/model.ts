/**
 * Model for every Claude route. `CAPY_MODEL` overrides; the default matches
 * `/api/start/*`. The legacy routes used a hardcoded Sonnet 4 ID that the API
 * has since retired (404 not_found_error), which surfaced as
 * "Failed to evaluate task" on /evaluate.
 */
export const CAPY_MODEL = process.env.CAPY_MODEL || 'claude-opus-5';

/**
 * Current models think adaptively by default and the thinking shares
 * `max_tokens` with the answer, so the old 1000–1500 caps could cut the JSON
 * off. Low effort keeps these short structured replies fast.
 */
export const LEGACY_MODEL_OPTIONS = { max_tokens: 8000, output_config: { effort: 'low' as const } };
