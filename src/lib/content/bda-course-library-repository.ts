import "server-only";
import rawLibrary from "@/data/generated/bda-course-library.json";
import {
  bdaCourseLibrarySchema,
  type BdaCourseLibraryItem,
} from "@/lib/domain/bda-course-library";

const library = bdaCourseLibrarySchema.parse(rawLibrary);

export function getBdaCourseLibrary() {
  return library;
}

export function getBdaCourseLibraryItems() {
  return library.items;
}

export function getBdaCourseLibraryItem(itemId: string) {
  return library.items.find((item) => item.id === itemId);
}

export function getBdaCourseLibraryDomainItems(
  domain: BdaCourseLibraryItem["domain"],
) {
  return library.items.filter((item) => item.domain === domain);
}
