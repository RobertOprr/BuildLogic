import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Cpu, CircuitBoard, MemoryStick, Zap, HardDrive, Monitor, CheckCircle, XCircle, AlertTriangle, Info, Download, RefreshCw, Server, Shield, Activity, Terminal } from "lucide-react";

const C = {
  bg: '#0d1117', bgCard: '#161b22', bgAlt: '#1c2128', bgHover: '#22272e',
  primary: '#ec5b13', success: '#22c55e', successMuted: 'rgba(34,197,94,0.08)',
  warning: '#ffbf00', warningMuted: 'rgba(255,191,0,0.08)',
  error: '#ef4444', errorMuted: 'rgba(239,68,68,0.08)',
  border: '#21262d', text: '#e6edf3', textSub: '#8b949e', textMuted: '#484f58',
  shadowCard: '0 4px 24px rgba(0,0,0,0.5)', shadowPrimary: '0 4px 20px rgba(236,91,19,0.3)',
  shadowSuccess: '0 4px 20px rgba(34,197,94,0.15)', r: 8,
};

const STORAGES = [
  { id: 1, brand: "Samsung", name: "990 PRO 2TB NVMe", price_ron: 850 },
  { id: 2, brand: "Kingston", name: "NV2 1TB PCIe 4.0", price_ron: 320 },
  { id: 3, brand: "WD", name: "Black SN850X 1TB", price_ron: 550 },
];

const priceCache = new Map();
const stablePrice = (id, type) => {
  const k = `${type}-${id}`;
  if (!priceCache.has(k)) {
    const [min, max] = ({ cpu: [800, 2500], mobo: [600, 2000], ram: [200, 800], gpu: [1500, 5000], psu: [300, 800], case_: [400, 1200] })[type] ?? [300, 1000];
    priceCache.set(k, Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return priceCache.get(k);
};

const normalize = d => Array.isArray(d) ? d : d?.results ?? [];
const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

const Bar = ({ value, color = C.primary, h = 6 }) => (
  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', height: h }}>
    <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${color}55` }} />
  </div>
);

const Badge = ({ children, color = C.primary }) => (
  <span style={{ background: `${color}18`, color, border: `1px solid ${color}35`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{children}</span>
);

const BuildLogicLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
    <path d="M50 5 L85 22 L85 55 C85 72 68 88 50 95 C32 88 15 72 15 55 L15 22 Z" fill="#1c2128" stroke="#3d444b" strokeWidth="3" />
    <circle cx="50" cy="50" r="22" fill="none" stroke="#3d444b" strokeWidth="4" />
    <path d="M50 28 L55 33 L62 31 L64 38 L70 42 L67 49 L70 56 L64 60 L62 67 L55 65 L50 70 L45 65 L38 67 L36 60 L30 56 L33 49 L30 42 L36 38 L38 31 L45 33 Z" fill="#2d333b" stroke="#484f58" strokeWidth="2" />
    <polyline points="38,50 46,58 62,42" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="15" y1="45" x2="3" y2="45" stroke="#ec5b13" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="52" x2="3" y2="52" stroke="#ec5b13" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="59" x2="3" y2="59" stroke="#ec5b13" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="3" cy="45" r="3" fill="#ec5b13" />
    <circle cx="3" cy="52" r="3" fill="#ec5b13" />
    <circle cx="3" cy="59" r="3" fill="#ec5b13" />
    <line x1="85" y1="45" x2="97" y2="45" stroke="#ec5b13" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="85" y1="52" x2="97" y2="52" stroke="#ec5b13" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="85" y1="59" x2="97" y2="59" stroke="#ec5b13" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="97" cy="45" r="3" fill="#ec5b13" />
    <circle cx="97" cy="52" r="3" fill="#ec5b13" />
    <circle cx="97" cy="59" r="3" fill="#ec5b13" />
  </svg>
);

const Gauge = ({ score }) => {
  const r = 42, circ = 2 * Math.PI * r;
  const color = score === 100 ? C.success : score >= 70 ? C.warning : C.error;
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>

      <svg width="200" height="200" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1),stroke 0.5s', filter: `drop-shadow(0 0 10px ${color}88)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{score}%</span>
        <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: '0.18em', marginTop: 4, textTransform: 'uppercase' }}>Compatibilitate</span>
        <div style={{ marginTop: 8, padding: '3px 10px', background: `${color}15`, border: `1px solid ${color}35`, borderRadius: 4, fontSize: 9, fontWeight: 700, color, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {score === 100 ? 'STATUS NOMINAL' : score >= 70 ? 'AVERTISMENTE' : 'INCOMPATIBIL'}
        </div>
      </div>
    </div>
  );
};

const RuleCard = ({ title, value, description, status }) => {
  const [hov, setHov] = useState(false);
  const color = status === 'pass' ? C.success : status === 'warn' ? C.warning : C.error;
  const Icon = status === 'pass' ? CheckCircle : status === 'warn' ? AlertTriangle : XCircle;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.bgAlt : C.bgCard, border: `1px solid ${color}${hov ? '55' : '22'}`, borderLeft: `4px solid ${color}`,
        borderRadius: C.r, padding: 20, position: 'relative', overflow: 'hidden',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? `0 8px 28px rgba(0,0,0,0.45),0 2px 8px ${color}22` : C.shadowCard,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)'
      }}>
      <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: `1.5px solid ${color}55`, borderRight: `1.5px solid ${color}55` }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: `1.5px solid ${color}55`, borderLeft: `1.5px solid ${color}55` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{value}</div>
        </div>
        <div style={{ background: `${color}12`, borderRadius: '50%', padding: 7, flexShrink: 0 }}><Icon size={16} color={color} /></div>
      </div>
      <Bar value={status === 'pass' ? 100 : status === 'warn' ? 75 : 30} color={color} h={3} />
      <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, fontStyle: 'italic', lineHeight: 1.6, margin: '10px 0 0' }}>{description}</p>
    </div>
  );
};

const LogLine = ({ type, message }) => {
  const cfg = ({ pass: { color: C.success, label: '[PASS]' }, fail: { color: C.error, label: '[FAIL]' }, warn: { color: C.warning, label: '[WARN]' }, info: { color: '#60a5fa', label: '[INFO]' } })[type] ?? { color: C.textMuted, label: '[LOG]' };
  return (
    <div className="log-line" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: `2px solid ${cfg.color}`, paddingLeft: 12, paddingTop: 6, paddingBottom: 6 }}>
      <span style={{ color: cfg.color, fontWeight: 700, minWidth: 46, fontSize: 11, flexShrink: 0 }}>{cfg.label}</span>
      <span style={{ color: C.textSub, fontSize: 11, fontStyle: 'italic', lineHeight: 1.6 }}>{message}</span>
    </div>
  );
};

export default function App() {
  const [lists, setLists] = useState({ cpus: [], motherboards: [], rams: [], gpus: [], psus: [], cases: [] });
  const [sel, setSel] = useState({ cpu_id: '', mobo_id: '', ram_id: '', ram_quantity: 1, gpu_id: '', psu_id: '', case_id: '', storage_id: '' });
  const [valResult, setVal] = useState(null);
  const [bnResult, setBn] = useState(null);
  const [validated, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState(null);
  const [valErr, setValErr] = useState(null);
  const [res, setRes] = useState('1440p');
  const ref = useRef(null);

  useEffect(() => {
    document.body.style.background = '#0d1117';
    document.body.style.margin = '0';
    document.documentElement.style.background = '#0d1117';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [c, m, g, p, cs] = await Promise.all([api.get('/cpus/'), api.get('/motherboards/'), api.get('/gpus/'), api.get('/psus/'), api.get('/cases/')]);
        let ram = [];
        try { ram = normalize((await api.get('/ram/')).data); } catch { try { ram = normalize((await api.get('/rams/')).data); } catch { } }
        setLists({ cpus: normalize(c.data), motherboards: normalize(m.data), rams: ram, gpus: normalize(g.data), psus: normalize(p.data), cases: normalize(cs.data) });
      } catch { setFetchErr('Nu s-a putut conecta la Django. Verifica serverul pe portul 8000.'); }
    })();
  }, []);

  useEffect(() => { if (validated && sel.cpu_id && sel.gpu_id) fetchBn(sel.cpu_id, sel.gpu_id, res); }, [res]);

  const cpu = useMemo(() => lists.cpus.find(c => String(c.id) === String(sel.cpu_id)) ?? null, [lists.cpus, sel.cpu_id]);
  const mobo = useMemo(() => lists.motherboards.find(m => String(m.id) === String(sel.mobo_id)) ?? null, [lists.motherboards, sel.mobo_id]);
  const ram = useMemo(() => lists.rams.find(r => String(r.id) === String(sel.ram_id)) ?? null, [lists.rams, sel.ram_id]);
  const gpu = useMemo(() => lists.gpus.find(g => String(g.id) === String(sel.gpu_id)) ?? null, [lists.gpus, sel.gpu_id]);
  const psu = useMemo(() => lists.psus.find(p => String(p.id) === String(sel.psu_id)) ?? null, [lists.psus, sel.psu_id]);
  const kase = useMemo(() => lists.cases.find(c => String(c.id) === String(sel.case_id)) ?? null, [lists.cases, sel.case_id]);
  const stor = useMemo(() => STORAGES.find(s => String(s.id) === String(sel.storage_id)) ?? null, [sel.storage_id]);

  const mobos = useMemo(() => cpu ? lists.motherboards.filter(m => String(m.socket) === String(cpu.socket)) : lists.motherboards, [lists.motherboards, cpu]);
  const rams = useMemo(() => mobo ? lists.rams.filter(r => String(r.ram_type) === String(mobo.ram_type)) : lists.rams, [lists.rams, mobo]);
  const cases = useMemo(() => mobo ? lists.cases.filter(c => String(c.supported_form_factor) === String(mobo.form_factor)) : lists.cases, [lists.cases, mobo]);

  const items = useMemo(() => [
    { type: 'cpu', label: 'Procesor (CPU)', Icon: Cpu, obj: cpu, price: cpu ? stablePrice(cpu.id, 'cpu') : 0 },
    { type: 'mobo', label: 'Placa de Baza', Icon: CircuitBoard, obj: mobo, price: mobo ? stablePrice(mobo.id, 'mobo') : 0 },
    { type: 'ram', label: 'Memorie RAM', Icon: MemoryStick, obj: ram, price: ram ? stablePrice(ram.id, 'ram') : 0 },
    { type: 'gpu', label: 'Placa Video', Icon: Monitor, obj: gpu, price: gpu ? stablePrice(gpu.id, 'gpu') : 0 },
    { type: 'psu', label: 'Sursa (PSU)', Icon: Zap, obj: psu, price: psu ? stablePrice(psu.id, 'psu') : 0 },
    { type: 'case_', label: 'Carcasa', Icon: Server, obj: kase, price: kase ? stablePrice(kase.id, 'case_') : 0 },
    { type: 'storage', label: 'Stocare', Icon: HardDrive, obj: stor, price: stor ? stor.price_ron : 0 },
  ], [cpu, mobo, ram, gpu, psu, kase, stor]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);
  const selCount = items.filter(i => i.obj).length;
  const canVal = !!(cpu && mobo && ram && gpu && psu);

  const draw = useMemo(() => {
    if (valResult?.details?.estimated_draw) return valResult.details.estimated_draw;
    return (cpu?.tdp_watts ?? 0) + (gpu?.tdp_watts ?? 0) + (ram?.tdp_watts ?? 5) * (sel.ram_quantity ?? 1) + 80;
  }, [valResult, cpu, gpu, ram, sel.ram_quantity]);

  const fetchBn = async (cId, gId, r) => {
    try { setBn((await api.get('/bottleneck/', { params: { cpu_id: Number(cId), gpu_id: Number(gId), resolution: r } })).data); }
    catch {
      try { setBn((await api.get('/bottleneck/', { params: { cpu_id: Number(cId), gpu_id: Number(gId), resolution: r.replace('p', '') } })).data); }
      catch (e) { setBn({ error: e?.response?.data?.detail ?? e?.response?.data?.error ?? 'Endpoint indisponibil' }); }
    }
  };

  const validate = async () => {
    if (!canVal) return;
    setLoading(true); setValErr(null);
    try {
      const r = await api.post('/validate/', { cpu_id: sel.cpu_id, motherboard_id: sel.mobo_id, ram_id: sel.ram_id, ram_quantity: sel.ram_quantity, gpu_id: sel.gpu_id, psu_id: sel.psu_id, ...(sel.case_id ? { case_id: sel.case_id } : {}) });
      setVal(r.data); setDone(true);
      await fetchBn(sel.cpu_id, sel.gpu_id, res);
    } catch (e) { setValErr(e?.response?.data?.detail ?? e?.response?.data?.error ?? e?.message ?? 'Eroare necunoscuta'); }
    finally { setLoading(false); }
  };

  const reset = () => { setSel({ cpu_id: '', mobo_id: '', ram_id: '', ram_quantity: 1, gpu_id: '', psu_id: '', case_id: '', storage_id: '' }); setVal(null); setBn(null); setDone(false); setValErr(null); };

  const score = useMemo(() => {
    if (!validated || !valResult) return selCount > 0 ? Math.min(90, selCount * 13) : 0;
    return Math.max(0, 100 - (valResult.errors?.length ?? 0) * 25 - (valResult.warnings?.length ?? 0) * 5);
  }, [validated, valResult, selCount]);

  const logs = useMemo(() => {
    if (!validated || !valResult) return [];
    const d = valResult.details ?? {}, errs = valResult.errors ?? [], warns = valResult.warnings ?? [], out = [];
    if (d.socket_match !== undefined) out.push({ type: d.socket_match ? 'pass' : 'fail', message: `Socket_Match_Check -> CPU ${d.cpu_socket ?? ''} ${d.socket_match ? '==' : '!='} MB ${d.mb_socket ?? ''}` });
    if (d.ram_type_match !== undefined) out.push({ type: d.ram_type_match ? 'pass' : 'fail', message: `RAM_Type_Check -> ${d.ram_type_match ? 'compatibil' : 'incompatibil'}` });
    if (d.power_ok !== undefined) out.push({ type: d.power_ok ? 'pass' : 'warn', message: `PSU_Check -> ${draw}W vs ${psu?.wattage ?? '?'}W ${d.power_ok ? '— OK' : '— ATENTIE'}` });
    if (d.gpu_fits !== undefined) out.push({ type: d.gpu_fits ? 'pass' : 'fail', message: `GPU_Clearance -> ${gpu?.length_mm ?? '?'}mm ${d.gpu_fits ? '<' : '>'} ${kase?.max_gpu_length_mm ?? '?'}mm` });
    if (d.form_factor_match !== undefined) out.push({ type: d.form_factor_match ? 'pass' : 'fail', message: `FormFactor_Check -> ${d.form_factor_match ? 'compatibil' : 'incompatibil'}` });
    errs.forEach(e => out.push({ type: 'fail', message: e })); warns.forEach(w => out.push({ type: 'warn', message: w }));
    if (out.length === 0) out.push({ type: 'pass', message: 'Toate regulile de compatibilitate sunt indeplinite.' });
    out.push({ type: 'info', message: `Validare finalizata. ${errs.length} erori, ${warns.length} avertismente.` });
    return out;
  }, [validated, valResult, draw, psu, gpu, kase]);

  const cards = useMemo(() => {
    if (!validated || !valResult) return [];
    const d = valResult.details ?? {}, out = [];
    if (cpu && mobo) out.push({ title: 'Socket Match', value: cpu.socket_name ?? `Socket #${cpu.socket}`, description: d.socket_match !== false ? 'Procesorul si placa de baza utilizeaza acelasi tip de socket fizic.' : 'Sockete incompatibile!', status: d.socket_match !== false ? 'pass' : 'fail' });
    if (psu) {
      const psuW = psu.wattage ?? 0, margin = psuW > 0 ? Math.round(((psuW - draw) / psuW) * 100) : 0;
      const ok = d.power_ok !== undefined ? d.power_ok : (psuW > 0 && draw > 0 && draw <= psuW * 0.8);
      out.push({ title: 'Power Supply Sufficiency', value: `${draw}W / ${psuW}W`, description: ok ? `Sursa este suficienta. Marja: ${margin}% (min 20%).` : `Consumul (${draw}W) depaseste 80% din capacitate.`, status: ok ? (margin >= 20 ? 'pass' : 'warn') : 'fail' });
    }
    if (kase && gpu) out.push({ title: 'Physical Clearance GPU', value: `${gpu.length_mm ?? '?'}mm / ${kase.max_gpu_length_mm ?? '?'}mm`, description: d.gpu_fits !== false ? 'Placa video incape cu spatiu liber suficient.' : 'Placa video depaseste lungimea maxima a carcasei!', status: d.gpu_fits !== false ? 'pass' : 'fail' });
    if (mobo && ram) out.push({ title: 'RAM Compatibility', value: `${ram.ram_type_name ?? ''} ${ram.speed_mhz}MHz`, description: d.ram_type_match !== false ? 'Tipul memoriei RAM este compatibil cu placa de baza.' : 'Tipul de RAM nu este compatibil!', status: d.ram_type_match !== false ? 'pass' : 'fail' });
    return out;
  }, [validated, valResult, cpu, mobo, ram, gpu, psu, kase, draw]);

  const oStatus = !validated ? 'pending' : (valResult?.errors?.length ?? 0) > 0 ? 'invalid' : (valResult?.warnings?.length ?? 0) > 0 ? 'warning' : 'valid';
  const sColor = { pending: C.textMuted, valid: C.success, invalid: C.error, warning: C.warning }[oStatus];
  const sLabel = { pending: 'IN ASTEPTARE', valid: 'COMPATIBIL', invalid: 'INCOMPATIBIL', warning: 'AVERTISMENT' }[oStatus];
  const bnPct = bnResult?.bottleneck_percentage ?? 0;
  const bnColor = bnPct < 10 ? C.success : bnPct < 25 ? C.warning : C.error;

  const forceInlineStyles = (el) => {
    const bg = {
      '#0d1117': ['[data-root]'], '#161b22': [], '#1c2128': [], '#22272e': [], '#010409': []
    };
    const allEls = el.querySelectorAll('*');
    allEls.forEach(node => {
      const computed = window.getComputedStyle(node);
      const bgColor = computed.backgroundColor;
      const color = computed.color;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') node.style.backgroundColor = bgColor;
      if (color) node.style.color = color;
      node.style.borderColor = computed.borderColor;
    });
    el.style.backgroundColor = '#0d1117';
  };

  const exportPDF = async () => {
    try {
      const h = (await import('html2pdf.js')).default;
      const el = ref.current;
      const btns = document.querySelectorAll('.btn-hide');
      btns.forEach(b => { b.dataset.orig = b.style.display; b.style.display = 'none'; });

      // Injectam computed backgrounds ca inline styles inainte de capture
      const allNodes = el.querySelectorAll('*');
      const origBgs = new Map();
      allNodes.forEach(n => {
        const computed = window.getComputedStyle(n).backgroundColor;
        origBgs.set(n, n.style.backgroundColor);
        if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent') {
          n.style.setProperty('background-color', computed, 'important');
        }
      });
      // Fundalul principal
      el.style.setProperty('background-color', '#0d1117', 'important');

      const ow = el.style.width, om = el.style.maxWidth;
      el.style.width = '1400px'; el.style.maxWidth = '1400px';

      await new Promise(r => setTimeout(r, 200));

      await h().set({
        margin: [0.3, 0.3], filename: 'BuildLogic_Raport_PC.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2, useCORS: true,
          windowWidth: 1400,
          backgroundColor: '#0d1117',
          logging: false,
        },
        jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
      }).from(el).save();

      // Restauram totul
      el.style.width = ow; el.style.maxWidth = om;
      allNodes.forEach(n => { n.style.backgroundColor = origBgs.get(n) ?? ''; });
      btns.forEach(b => { b.style.display = b.dataset.orig ?? ''; });

    } catch (e) { console.error(e); alert('Ruleaza: npm install html2pdf.js'); }
  };

  const SR = ({ label, Icon: RI, value, options, onChange, disabled, ph }) => {
    const on = !!value;
    return (
      <div style={{
        position: 'relative', background: on ? `linear-gradient(90deg,${C.success}06 0%,${C.bgCard} 100%)` : C.bgCard,
        border: `1px solid ${on ? C.success + '30' : C.border}`, borderLeft: `4px solid ${on ? C.success : '#30363d'}`,
        borderRadius: C.r, padding: '14px 16px', opacity: disabled ? 0.4 : 1,
        boxShadow: on ? C.shadowSuccess : C.shadowCard, transition: 'all 0.2s ease'
      }}>
        <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: `1.5px solid ${on ? C.success + '55' : '#30363d'}`, borderRight: `1.5px solid ${on ? C.success + '55' : '#30363d'}` }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: `1.5px solid ${on ? C.success + '55' : '#30363d'}`, borderLeft: `1.5px solid ${on ? C.success + '55' : '#30363d'}` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: on ? C.success : C.textMuted, flexShrink: 0 }}>{on ? <CheckCircle size={18} /> : <RI size={18} />}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
            <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: on ? C.text : C.textMuted, fontSize: 13, fontWeight: on ? 600 : 400, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              <option value="" style={{ background: C.bgCard }}>{disabled ? '-- Selectati placa de baza mai intai --' : ph}</option>
              {options.map(o => <option key={o.id} value={o.id} style={{ background: C.bgCard }}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {on && (() => { const f = options.find(o => String(o.id) === String(value)); return f?.specs ? <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textSub, lineHeight: 1.8 }}>{f.specs}</div> : null; })()}
      </div>
    );
  };

  const cpuO = lists.cpus.map(c => ({ id: c.id, label: `${c.brand} ${c.name}`, specs: `${c.socket_name ?? ''} | TDP: ${c.tdp_watts ?? '?'}W | Cores: ${c.cores ?? '?'}` }));
  const moboO = mobos.map(m => ({ id: m.id, label: `${m.brand} ${m.name}`, specs: `${m.socket_name ?? ''} | ${m.ram_type_name ?? ''} | ${m.form_factor_name ?? ''}` }));
  const ramO = rams.map(r => ({ id: r.id, label: `${r.brand} ${r.capacity_gb}GB ${r.ram_type_name ?? ''}-${r.speed_mhz}`, specs: `${r.capacity_gb}GB | ${r.speed_mhz}MHz | TDP: ${r.tdp_watts ?? '?'}W` }));
  const gpuO = lists.gpus.map(g => ({ id: g.id, label: `${g.brand} ${g.name}`, specs: `TDP: ${g.tdp_watts ?? '?'}W | ${g.length_mm ?? '?'}mm` }));
  const psuO = lists.psus.map(p => ({ id: p.id, label: `${p.brand} ${p.name} – ${p.wattage ?? '?'}W`, specs: `${p.wattage ?? '?'}W` }));
  const caseO = cases.map(c => ({ id: c.id, label: `${c.brand} ${c.name} (${c.supported_form_factor_name ?? ''})`, specs: `${c.supported_form_factor_name ?? ''} | Max GPU: ${c.max_gpu_length_mm ?? '?'}mm` }));
  const storO = STORAGES.map(s => ({ id: s.id, label: `${s.brand} ${s.name}`, specs: `${s.price_ron} RON` }));

  const panelStyle = { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.r, boxShadow: C.shadowCard };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter','Public Sans',sans-serif", color: C.text, margin: 0, padding: 0 }}>

      <nav style={{ background: C.bg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BuildLogicLogo />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              <span style={{ color: C.text }}>Build</span><span style={{ color: C.primary }}>Logic</span>
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Validator Compatibilitate PC</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: sColor, boxShadow: oStatus === 'valid' ? `0 0 8px ${C.success}` : 'none', animation: oStatus === 'valid' ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: sColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sLabel}</span>
          </div>
          <button className="btn-hide btn-reset" onClick={reset}
            onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textSub; e.currentTarget.style.borderColor = C.border; }}
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textSub, padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            <RefreshCw size={12} /> Reset
          </button>
        </div>
      </nav>

      {selCount > 0 && (
        <div style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}`, padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
          <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>{selCount}/7</span>
          <div style={{ width: 1, height: 18, background: C.border, flexShrink: 0 }} />
          {items.filter(i => i.obj).map(it => (
            <div key={it.type} className="config-card" style={{ background: '#22272e', border: 'none', borderRadius: 6, padding: '5px 12px', display: 'flex', flexDirection: 'column', flexShrink: 0, minWidth: 100, transition: 'all 0.2s' }}>
              <span style={{ fontSize: 8, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{it.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, color: C.text }}>{it.obj.brand} {it.obj.name ?? `${it.obj.capacity_gb}GB`}</span>
              <span style={{ fontSize: 10, color: C.textSub, marginTop: 1 }}>{it.price} RON</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: C.primary }}>{total.toLocaleString('ro-RO')} RON</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '350px minmax(0,1fr)', gap: 20, alignItems: 'start' }}>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'sticky', top: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6 }}><Cpu size={12} /> Componente</span>
            <Badge color={C.primary}>{selCount}/7</Badge>
          </div>
          {fetchErr && <div style={{ background: C.errorMuted, border: `1px solid ${C.error}30`, borderRadius: C.r, padding: 12, fontSize: 11, color: C.error }}>⚠️ {fetchErr}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: 2 }}>
            <SR label="Procesor (CPU)" Icon={Cpu} value={sel.cpu_id} options={cpuO} ph="-- Selectati Procesor --" onChange={v => setSel(s => ({ ...s, cpu_id: v, mobo_id: '', ram_id: '', case_id: '' }))} />
            <SR label="Placa de Baza" Icon={CircuitBoard} value={sel.mobo_id} options={moboO} ph="-- Selectati Placa de Baza --" disabled={!cpu} onChange={v => setSel(s => ({ ...s, mobo_id: v, ram_id: '', case_id: '' }))} />
            <SR label="Memorie RAM" Icon={MemoryStick} value={sel.ram_id} options={ramO} ph="-- Selectati RAM --" disabled={!mobo} onChange={v => setSel(s => ({ ...s, ram_id: v }))} />
            {ram && (
              <div style={{ ...panelStyle, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>Module RAM</span>
                <select value={sel.ram_quantity} onChange={e => setSel(s => ({ ...s, ram_quantity: Number(e.target.value) }))}
                  style={{ background: C.bgAlt, border: `1px solid ${C.border}`, color: C.text, borderRadius: 4, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit' }}>
                  {[1, 2, 4].map(n => <option key={n} value={n} style={{ background: C.bgCard }}>{n}x modul(e)</option>)}
                </select>
              </div>
            )}
            <SR label="Placa Video (GPU)" Icon={Monitor} value={sel.gpu_id} options={gpuO} ph="-- Selectati GPU --" onChange={v => setSel(s => ({ ...s, gpu_id: v }))} />
            <SR label="Sursa Alimentare" Icon={Zap} value={sel.psu_id} options={psuO} ph="-- Selectati PSU --" onChange={v => setSel(s => ({ ...s, psu_id: v }))} />
            <SR label="Carcasa" Icon={Server} value={sel.case_id} options={caseO} ph="-- Selectati Carcasa --" disabled={!mobo} onChange={v => setSel(s => ({ ...s, case_id: v }))} />
            <SR label="Stocare (SSD/HDD)" Icon={HardDrive} value={sel.storage_id} options={storO} ph="-- Selectati Stocare --" onChange={v => setSel(s => ({ ...s, storage_id: v }))} />
          </div>

          {selCount > 0 && (
            <div style={{ ...panelStyle, padding: 16 }}>
              <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Distributie Buget</div>
              {items.filter(i => i.obj && i.price > 0).map(it => (
                <div key={it.type} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: C.textSub }}>{it.label}</span>
                    <span style={{ color: C.primary, fontWeight: 700 }}>{it.price} RON</span>
                  </div>
                  <Bar value={(it.price / total) * 100} color={C.primary} h={3} />
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Estimativ</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.primary }}>{total.toLocaleString('ro-RO')} RON</span>
              </div>
            </div>
          )}

          <button className="btn-hide" onClick={validate} disabled={!canVal || loading}
            onMouseEnter={e => { if (canVal) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(236,91,19,0.5)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = canVal ? C.shadowPrimary : 'none'; }}
            style={{ background: canVal ? C.primary : C.bgAlt, color: canVal ? 'white' : C.textMuted, border: 'none', borderRadius: C.r, padding: '15px 0', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: canVal ? 'pointer' : 'not-allowed', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: canVal ? C.shadowPrimary : 'none', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
            {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Se valideaza...</> : <><CheckCircle size={14} /> Valideaza Configuratia</>}
          </button>

          {valErr && (
            <div style={{ background: C.errorMuted, border: `1px solid ${C.error}30`, borderRadius: C.r, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}><XCircle size={12} color={C.error} /><span style={{ fontSize: 10, fontWeight: 700, color: C.error, textTransform: 'uppercase' }}>Eroare API</span></div>
              <p style={{ fontSize: 11, color: C.textSub, margin: 0, lineHeight: 1.5 }}>{valErr}</p>
            </div>
          )}

          <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><Info size={12} color={C.primary} /><span style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status Analiza</span></div>
            <p style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>Sistemul analizeaza compatibilitatea fizica, electrica si logica conform bazei de date academice.</p>
          </div>
        </aside>

        <main ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <section className="section-panel" style={{ ...panelStyle, padding: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.025 }}><Shield size={110} /></div>
            <h2 style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, marginTop: 0 }}>
              <span style={{ width: 4, height: 20, background: C.primary, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
              01 / Compatibilitate Hardware
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Gauge score={score} /></div>
            {validated && cards.length > 0
              ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{cards.map((c, i) => <RuleCard key={i} {...c} />)}</div>
              : <div style={{ textAlign: 'center', padding: '16px 0', color: C.textMuted }}><Shield size={28} style={{ opacity: 0.15, margin: '0 auto 8px', display: 'block' }} /><p style={{ fontSize: 12, margin: 0 }}>Selectati componentele si apasati "Valideaza Configuratia"</p></div>
            }
            {validated && (
              <div style={{ marginTop: 14, padding: 14, background: oStatus === 'valid' ? C.successMuted : oStatus === 'warning' ? C.warningMuted : C.errorMuted, border: `1px solid ${sColor}25`, borderRadius: C.r, display: 'flex', alignItems: 'center', gap: 10 }}>
                {oStatus === 'valid' && <CheckCircle color={C.success} size={16} />}
                {oStatus === 'invalid' && <XCircle color={C.error} size={16} />}
                {oStatus === 'warning' && <AlertTriangle color={C.warning} size={16} />}
                <div>
                  <div style={{ fontWeight: 700, color: sColor, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Configuratie {oStatus === 'valid' ? 'Valida' : oStatus === 'warning' ? 'Cu Avertismente' : 'Invalida'}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{oStatus === 'valid' ? 'Toate regulile de compatibilitate sunt indeplinite.' : `${valResult?.errors?.length ?? 0} erori, ${valResult?.warnings?.length ?? 0} avertismente detectate.`}</div>
                </div>
              </div>
            )}
          </section>

          {validated && logs.length > 0 && (
            <section className="section-panel" style={{ ...panelStyle, overflow: 'hidden' }}>
              <div style={{ background: C.bgAlt, padding: '10px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}><Terminal size={12} /> Log Executie Reguli Backend</h3>
                <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>Real-time Engine v1.0</span>
              </div>
              <div style={{ background: '#010409', padding: 14, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {logs.map((e, i) => <LogLine key={i} {...e} />)}
              </div>
            </section>
          )}

          <section className="section-panel" style={{ ...panelStyle, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: validated ? 16 : 0, marginTop: 0 }}>
              <span style={{ width: 4, height: 18, background: C.primary, borderRadius: 2, display: 'inline-block' }} />
              02 / Analiza Sursa de Alimentare
            </h2>
            {validated && valResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: valResult.details?.power_ok !== false ? C.successMuted : C.errorMuted, border: `1px solid ${valResult.details?.power_ok !== false ? C.success : C.error}25`, borderRadius: C.r }}>
                  {valResult.details?.power_ok !== false ? <CheckCircle color={C.success} size={15} /> : <XCircle color={C.error} size={15} />}
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: valResult.details?.power_ok !== false ? C.success : C.error }}>{valResult.details?.power_ok !== false ? 'CONFIGURATIE VALIDA' : 'SURSA INSUFICIENTA'}</span>
                </div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {[{ label: 'Consum Estimat', value: `${draw}W`, color: C.warning }, { label: 'Capacitate PSU', value: `${psu?.wattage ?? '?'}W`, color: C.success }, { label: 'Marja Siguranta', value: psu?.wattage > 0 ? `${Math.round(((psu.wattage - draw) / psu.wattage) * 100)}%` : '?%', color: ((psu?.wattage - draw) / psu?.wattage) >= 0.2 ? C.success : C.warning }].map(s => (
                    <div key={s.label}><div style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 3 }}>{s.label}</div><div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div></div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>{valResult.details?.power_ok !== false ? 'Sursa este suficienta. Marja de siguranta de 20% este respectata.' : 'Consumul depaseste 80% din capacitatea PSU. Se recomanda o sursa mai puternica.'}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: C.textMuted }}><Zap size={28} style={{ opacity: 0.15, margin: '0 auto 7px', display: 'block' }} /><p style={{ fontSize: 12, margin: 0 }}>Detaliile despre consum vor aparea dupa validare</p></div>
            )}
          </section>

          <section className="section-panel" style={{ ...panelStyle, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                <span style={{ width: 4, height: 18, background: C.primary, borderRadius: 2, display: 'inline-block' }} />
                03 / Bottleneck Report
              </h2>
              <div className="btn-hide" style={{ display: 'flex', gap: 5 }}>
                {['1080p', '1440p', '4K'].map(r => (
                  <button key={r} onClick={() => setRes(r)} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: res === r ? C.primary : C.bgAlt, color: res === r ? 'white' : C.textMuted, border: `1px solid ${res === r ? C.primary : C.border}`, cursor: 'pointer', boxShadow: res === r ? C.shadowPrimary : 'none', transition: 'all 0.2s' }}>{r}</button>
                ))}
              </div>
            </div>
            {validated && bnResult ? (
              bnResult.error ? (
                <div style={{ background: C.errorMuted, border: `1px solid ${C.error}25`, borderRadius: C.r, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}><XCircle size={14} color={C.error} /><span style={{ fontSize: 12, fontWeight: 700, color: C.error, textTransform: 'uppercase' }}>Eroare Bottleneck API</span></div>
                  <p style={{ fontSize: 11, color: C.textMuted, margin: '0 0 6px', fontFamily: 'monospace' }}>{bnResult.error}</p>
                  <p style={{ fontSize: 10, color: C.textMuted, margin: 0 }}>Verifica <code style={{ color: C.primary }}>/api/bottleneck/</code> in Django.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 20, boxShadow: C.shadowCard }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{bnResult.bottleneck_component ?? ''} Bottleneck</span>
                      <span style={{ fontSize: 36, fontWeight: 900, color: bnColor, lineHeight: 1 }}>{bnPct}%</span>
                      <Badge color={bnColor}>{bnPct < 10 ? 'SCENARIU IDEAL' : bnPct < 25 ? 'ACCEPTABIL' : 'DEZECHILIBRU'}</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>{bnResult.interpretation ?? bnResult.message ?? 'Analiza bottleneck completata.'}</p>
                  </div>
                  {[{ label: 'CPU — Oferta', value: bnResult.cpu_score ?? 0, color: C.success }, { label: 'GPU — Scor', value: bnResult.gpu_score ?? 0, color: C.warning }].map(b => (
                    <div key={b.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}><span style={{ color: C.textMuted }}>{b.label}</span><span style={{ fontWeight: 700 }}>{b.value}</span></div>
                      <Bar value={b.value} color={b.color} />
                    </div>
                  ))}
                  {(bnResult.message || bnResult.interpretation) && (
                    <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 12, fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>{bnResult.message ?? bnResult.interpretation}</div>
                  )}
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: C.textMuted }}><Activity size={28} style={{ opacity: 0.15, margin: '0 auto 7px', display: 'block' }} /><p style={{ fontSize: 12, margin: 0 }}>Selectati CPU si GPU, apoi apasati "Valideaza"</p></div>
            )}
          </section>

          {validated && (
            <div style={{ background: C.bgAlt, borderLeft: `4px solid ${C.primary}`, borderRadius: C.r, padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', boxShadow: C.shadowCard }}>
              <div><h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 5px' }}>Finalizare Raport Licenta</h3><p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>Exportati raportul PDF pentru documentatie academica.</p></div>
              <button className="btn-pdf btn-hide"
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(236,91,19,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = C.shadowPrimary; }}
                onClick={exportPDF}
                style={{ background: C.primary, color: 'white', border: 'none', padding: '13px 26px', borderRadius: C.r, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: C.shadowPrimary, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
                <Download size={15} /> Export PDF
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        html,body,#root { background:#0d1117 !important; margin:0; padding:0; min-height:100vh }
        * { box-sizing:border-box }
        select option { background:#161b22 !important; color:#e6edf3 !important }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0d1117}
        ::-webkit-scrollbar-thumb{background:#30363d;border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:#484f58}
        .section-panel  { animation:fadeIn 0.35s ease both }
        .log-line       { animation:slideIn 0.25s ease both }
        .config-card:hover { background:#2d333b !important; transform:translateY(-1px) }
        button:active   { transform:translateY(1px) !important }
      `}</style>
    </div>
  );
}