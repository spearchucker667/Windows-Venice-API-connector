/** @fileoverview Venice API response type definitions. */

/** Metadata for a single model returned by the Venice API. */
export interface ModelInfo {
  id: string;
  created: number;
  object: string;
  owned_by: string;
}

/** Groups of models by capability category. */
export interface ModelGroups {
  text: ModelInfo[];
  image: ModelInfo[];
  vision: ModelInfo[];
}

/** Single diagnostics entry capturing request metrics and metadata. */
export interface DiagnosticsEntry {
  id: string;
  timestamp: number;
  type: "info" | "warn" | "error" | "success";
  endpoint: string;
  status: number | string;
  latencyMs: number;
  reqSize: number;
  resSize: number;
  error?: string;
  data?: any;
}
