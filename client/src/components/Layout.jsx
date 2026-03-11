import { Outlet } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Header from "./Header";

export default function Layout() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <Header t={t} lang={lang} setLang={setLang} />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
