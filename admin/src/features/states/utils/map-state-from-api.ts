import type { State } from "@/features/states/types/states.types";
import { mapTranslatableFromApi } from "@/shared/lib/api";

export function mapStateFromApi(state: State): State {
  return {
    ...mapTranslatableFromApi(state),
    country: state.country ? mapTranslatableFromApi(state.country) : state.country,
  };
}
