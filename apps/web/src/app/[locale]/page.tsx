import { useTranslations } from "next-intl";

import { Link } from "~/src/i18n/routing";

export default function HomePage() {
  const t = useTranslations();
  return (
    <div>
      <h1>{t("helloWorld")}</h1>
      <Link href="/about">{t("helloWorld")}</Link>
    </div>
  );
}
