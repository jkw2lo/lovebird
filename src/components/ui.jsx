import { useEffect, useState, useSyncExternalStore, useRef, useId, Fragment, Children, isValidElement, cloneElement } from 'react';
import { X, Star } from 'lucide-react';
import { useImage } from '../lib/store.js';

// ---------- routing (hash based: #/vendors/photography)

function subscribeHash(fn) {
  window.addEventListener('hashchange', fn);
  return () => window.removeEventListener('hashchange', fn);
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash);
  const path = hash.replace(/^#\/?/, '');
  const [pathname, query = ''] = path.split('?');
  return { parts: pathname.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(query) };
}

export function go(path) {
  window.location.hash = '#/' + path.replace(/^\/?/, '');
}

// ---------- toast

let toastState = null;
const toastListeners = new Set();
let toastTimer = null;
export function toast(message, action) {
  toastState = { message, action, id: Date.now() };
  toastListeners.forEach((fn) => fn());
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastState = null; toastListeners.forEach((fn) => fn()); }, action ? 6000 : 3200);
}
export function Toaster() {
  const t = useSyncExternalStore((fn) => { toastListeners.add(fn); return () => toastListeners.delete(fn); }, () => toastState);
  if (!t) return null;
  return (
    <div className="toast" role="status">
      {t.message}
      {t.action && <button onClick={() => { t.action.run(); toastState = null; toastListeners.forEach((fn) => fn()); }}>{t.action.label}</button>}
    </div>
  );
}

// ---------- overlays

export function Modal({ title, subtitle, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="muted small" style={{ marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button className="btn ghost icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ onClose, children, label }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <>
      <div className="drawer-wrap" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={label}>{children}</aside>
    </>
  );
}

// ---------- form bits

export function Field({ label, hint, children, style }) {
  const id = useId();
  // Point the label at the first control so clicking it focuses the input.
  let linked = false;
  const kids = Children.map(children, (child) => {
    const isControl = isValidElement(child) && (typeof child.type === 'string' ? ['input', 'select', 'textarea'].includes(child.type) : child.type === Text || child.type === MoneyInput);
    if (!linked && isControl) {
      linked = true;
      return cloneElement(child, { id: child.props.id || id });
    }
    return child;
  });
  return (
    <div className="field" style={style}>
      {label && <label htmlFor={linked ? id : undefined}>{label}</label>}
      {kids}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

// Text input that only commits on blur/enter, so typing doesn't re-render the whole app on each key.
export function Text({ value, onChange, className = 'input', multiline, ...rest }) {
  const [draft, setDraft] = useState(value ?? '');
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setDraft(value ?? ''); }, [value]);
  const commit = () => { if ((value ?? '') !== draft) onChange(draft); };
  const props = {
    ...rest,
    className: multiline ? className.replace('input', 'textarea') : className,
    value: draft,
    onChange: (e) => setDraft(e.target.value),
    onFocus: () => { focused.current = true; },
    onBlur: () => { focused.current = false; commit(); },
    onKeyDown: (e) => { if (!multiline && e.key === 'Enter') e.currentTarget.blur(); if (rest.onKeyDown) rest.onKeyDown(e); },
  };
  return multiline ? <textarea {...props} /> : <input {...props} />;
}

export function MoneyInput({ value, onChange, placeholder = '0', className = 'input', ...rest }) {
  const shown = value === null || value === undefined || value === '' ? '' : Number(value).toLocaleString('en-US');
  return (
    <div className="money-input">
      <Text {...rest} className={className} inputMode="decimal" value={shown} placeholder={placeholder}
        onChange={(v) => { const n = Number(String(v).replace(/[^0-9.]/g, '')); onChange(v.trim() === '' ? null : Number.isFinite(n) ? n : null); }} />
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stars({ value = 0, onChange, size = 15 }) {
  return (
    <span className={`stars ${onChange ? '' : 'readonly'}`} aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={n <= value ? 'on' : ''} disabled={!onChange} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange && onChange(n === value ? 0 : n); }} aria-label={`${n} star`}>
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </span>
  );
}

export function Empty({ emoji, title, children, action }) {
  return (
    <div className="empty">
      {emoji && <div className="em">{emoji}</div>}
      {title && <h3>{title}</h3>}
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Photo({ imageId, url, alt = '', fallback = '🖼️' }) {
  const src = useImage(imageId, url);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if (!src || broken) return <span aria-hidden>{fallback}</span>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} referrerPolicy="no-referrer" />;
}

export function PageHead({ eyebrow, title, lede, children }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {children && <div className="row wrap">{children}</div>}
    </header>
  );
}

export function Bar({ committed = 0, paid = 0, total = 0 }) {
  const pc = total > 0 ? Math.min(100, (committed / total) * 100) : committed > 0 ? 100 : 0;
  const pp = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  return (
    <div className={`bar ${committed > total && total >= 0 ? 'over' : ''}`}>
      <span className="committed" style={{ width: `${pc}%` }} />
      <span className="paid" style={{ width: `${pp}%` }} />
    </div>
  );
}

// ---------- tiny markdown (bold, bullets, paragraphs) for chat replies

function inline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>));
}

export function Markdown({ text }) {
  const blocks = [];
  let list = null;
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
    if (m) {
      if (!list) { list = []; blocks.push({ list }); }
      list.push(m[1]);
    } else if (line.trim()) {
      list = null;
      blocks.push({ p: line.replace(/^#+\s*/, '') });
    } else list = null;
  }
  return blocks.map((b, i) => (b.list ? <ul key={i}>{b.list.map((li, j) => <li key={j}>{inline(li)}</li>)}</ul> : <p key={i}>{inline(b.p)}</p>));
}
