import { permanentRedirect } from "next/navigation";

/** The old term list moved to Netfener Sözlük. */
export default function DictionaryRedirect() {
  permanentRedirect("/sozluk");
}
