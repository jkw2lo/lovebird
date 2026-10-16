import { House, ListChecks, Handshake, Wallet, Users, LayoutGrid, Bookmark, Clock, Settings as Gear, Bird } from 'lucide-react';
import { useAppState } from './lib/store.js';
import { useRoute, Toaster } from './components/ui.jsx';
import { allTasks, taskStatus, coupleName, daysToGo } from './lib/derive.js';
import { fmtDate } from './lib/util.js';
import Assistant from './components/Assistant.jsx';
import Onboarding from './views/Onboarding.jsx';
import Home from './views/Home.jsx';
import Plan from './views/Plan.jsx';
import Vendors from './views/Vendors.jsx';
import VendorCategory from './views/VendorCategory.jsx';
import VendorDetail from './views/VendorDetail.jsx';
import Budget from './views/Budget.jsx';
import Guests from './views/Guests.jsx';
import Seating from './views/Seating.jsx';
import Saves from './views/Saves.jsx';
import DayOf from './views/DayOf.jsx';
import Settings from './views/Settings.jsx';

const NAV = [
  { path: '', label: 'Today', short: 'Today', icon: House },
  { path: 'plan', label: 'Plan', short: 'Plan', icon: ListChecks },
  { path: 'vendors', label: 'Vendors', short: 'Vendors', icon: Handshake },
  { path: 'budget', label: 'Budget', short: 'Budget', icon: Wallet },
  { path: 'guests', label: 'Guests', short: 'Guests', icon: Users },
  { path: 'seating', label: 'Seating', short: 'Seating', icon: LayoutGrid },
  { path: 'saves', label: 'Saves', short: 'Saves', icon: Bookmark },
  { path: 'dayof', label: 'Day-of timeline', short: 'Day-of', icon: Clock },
];

function routeView(parts) {
  const [a, b] = parts;
  switch (a) {
    case undefined: case '': return <Home />;
    case 'plan': return <Plan focus={b} />;
    case 'vendors': return b ? <VendorCategory category={b} /> : <Vendors />;
    case 'vendor': return <VendorDetail id={b} />;
    case 'budget': return <Budget />;
    case 'guests': return <Guests />;
    case 'seating': return <Seating />;
    case 'saves': return <Saves board={b} />;
    case 'dayof': return <DayOf />;
    case 'settings': return <Settings />;
    default: return <Home />;
  }
}

export default function App() {
  const state = useAppState();
  const { parts } = useRoute();

  if (!state.onboarded) return <><Onboarding /><Toaster /></>;

  const section = parts[0] === 'vendor' ? 'vendors' : parts[0] || '';
  const overdue = allTasks(state).filter((t) => { const s = taskStatus(state, t); return !s.done && !s.skipped && s.daysLeft !== null && s.daysLeft < 0; }).length;
  const dtg = daysToGo(state);

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#/">
          <span className="brand-mark"><Bird size={17} /></span>
          <span className="brand-name">Lovebird</span>
        </a>
        <a className="couple-card" href="#/settings">
          <div className="names">{coupleName(state)}</div>
          <div className="count">
            {state.wedding.date ? <>{fmtDate(state.wedding.date)} · {dtg > 0 ? `${dtg} days to go` : dtg === 0 ? 'Today!' : 'Married!'}</> : 'Date not set yet'}
          </div>
        </a>
        <nav className="nav">
          {NAV.map((item) => (
            <a key={item.path} href={`#/${item.path}`} className={section === item.path ? 'active' : ''}>
              <item.icon size={17} /> {item.label}
              {item.path === 'plan' && overdue > 0 && <span className="badge" title={`${overdue} to catch up on`}>{overdue}</span>}
            </a>
          ))}
          <div className="nav-sep" />
          <a href="#/settings" className={section === 'settings' ? 'active' : ''}><Gear size={17} /> Settings</a>
        </nav>
        <div className="sidebar-foot tiny muted" style={{ padding: '0 10px' }}>Everything is saved in this browser. Back it up from Settings.</div>
      </aside>

      <main className="main">
        <header className="mobile-top">
          <a className="brand" href="#/"><span className="brand-mark"><Bird size={15} /></span><span className="brand-name">Lovebird</span></a>
          <span className="grow" />
          <a href="#/dayof" className="btn ghost icon" aria-label="Day-of timeline"><Clock size={19} /></a>
          <a href="#/settings" className="btn ghost icon" aria-label="Settings"><Gear size={19} /></a>
        </header>
        {routeView(parts)}
      </main>

      <nav className="mobile-nav">
        {NAV.slice(0, 7).map((item) => (
          <a key={item.path} href={`#/${item.path}`} className={section === item.path ? 'active' : ''}>
            <item.icon size={19} /> {item.short}
          </a>
        ))}
      </nav>

      <Assistant />
      <Toaster />
    </div>
  );
}
