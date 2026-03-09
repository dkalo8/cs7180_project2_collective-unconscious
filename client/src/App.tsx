import { useState } from 'react';
import Header from './components/Header';
import FeedPage from './pages/FeedPage';
import LogPage from './pages/LogPage';
import CreatePage from './pages/CreatePage';
import AccessPage from './pages/AccessPage';
import AboutPage from './pages/AboutPage';

import { T } from './utils/i18n';
import { LOGS } from './utils/mockData';
import { S } from './utils/styles';

export default function App() {
  const [lang, setLang] = useState("zh");
  const [page, setPage] = useState("feed");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const t = T[lang];
  const currentLog = LOGS.find((l: any) => l.id === selectedLog);

  return (
    <div style={S.page}>
      <Header t={t} lang={lang} setLang={setLang} onNav={(p: any) => { setPage(p); setSelectedLog(null); }} />
      {page === "feed" && <FeedPage t={t} logs={LOGS} lang={lang} onOpen={(id: any) => { setSelectedLog(id); setPage("log"); }} />}
      {page === "log" && currentLog && <LogPage t={t} log={currentLog} lang={lang} />}
      {page === "create" && <CreatePage t={t} lang={lang} onCreated={() => setPage("feed")} />}
      {page === "access" && <AccessPage t={t} logTitle="私密 Log" onEnter={() => setPage("feed")} />}
      {page === "about" && <AboutPage t={t} />}
    </div>
  );
}
