import { SearchForm } from "@/app/search/search-form";
import { getLocale } from "@/lib/locale-server";

// The form itself is a client component (useActionState), so the locale is
// resolved here and the dictionary looked up on the client side.
export default async function SearchPage() {
  return <SearchForm locale={await getLocale()} />;
}
