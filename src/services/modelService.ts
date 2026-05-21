import { veniceFetch } from "./veniceClient";
import { flattenModels } from "../state/appReducer";

export async function refreshModels(dispatch: any): Promise<void> {
  try {
    const { data } = await veniceFetch("/models?type=all", {
      method: "GET",
      dispatch,
      retry: true,
    });
    const grouped = flattenModels(data);
    dispatch({ type: "SET_MODELS", models: grouped, fallback: false });
  } catch (err: any) {
    dispatch({
      type: "SET_MODELS",
      models: undefined,
      fallback: true,
      error:
        err.message ||
        "Model discovery failed; using non-exhaustive static fallbacks.",
    });
  }
}
