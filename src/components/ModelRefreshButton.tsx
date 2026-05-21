import React, { useState } from "react";
import { refreshModels } from "../services/modelService";
import { Chip } from "./Chip";

interface ModelRefreshButtonProps {
  state: any;
  dispatch: any;
}

export function ModelRefreshButton({ state, dispatch }: ModelRefreshButtonProps) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshModels(dispatch);
    } finally {
      setRefreshing(false);
    }
  }

  const totalModels = Object.values(state.models as Record<string, any[]>).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const isLive = !state.usingFallbackModels;

  return (
    <div className="chip-row" style={{ alignItems: "center", flexWrap: "wrap" }}>
      <button
        className="btn sm"
        onClick={handleRefresh}
        disabled={refreshing}
        title="Fetch all available models from the Venice API"
      >
        {refreshing ? "Fetching…" : "Fetch models"}
      </button>
      <Chip tone={isLive ? "ok" : "warn"}>
        {isLive ? `live · ${totalModels} models` : `fallback · ${totalModels} models`}
      </Chip>
    </div>
  );
}
