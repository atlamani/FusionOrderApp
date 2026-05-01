import { Href, router } from "expo-router";

export function goBackOrReplace(fallback: Href) {
  router.replace(fallback);
}
