import { useTranslations } from "next-intl";

import { Link } from "~/src/i18n/routing";

export default function HomePage() {
  const t = useTranslations();
  return (
    <div>
      <Link href="/game?worldId=World Test">Go to prototype game page</Link>
    </div>
  );
}
