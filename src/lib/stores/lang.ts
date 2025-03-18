import { writable } from "svelte/store";
import { fetchFromAPI } from "$lib/utils/api";
import type { LangData } from "$lib/types/lang";

export const lang = writable<LangData | null>(null);

export async function loadLang(language: string = "fr"): Promise<void> {
  try {
    const data = await fetchFromAPI<LangData>(`/langs/${language}`);
    lang.set(data);
  } catch (error) {
    console.error("Impossible de charger la langue :", error);
    lang.set(null);
  }
}
