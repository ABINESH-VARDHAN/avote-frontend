import { useState } from "react";

/* ── Fonts & global styles ─────────────────────────────────────────────── */
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap";
document.head.appendChild(_fl);

const _st = document.createElement("style");
_st.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #f7f3eb; font-family: 'Lora', serif; }
  ::selection { background: #f5c842; color: #1a1a1a; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes wobble   { 0%,100%{transform:rotate(-1deg)} 50%{transform:rotate(1deg)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes scribble { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes popIn    { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }

  .card-lift { transition: transform .22s ease, box-shadow .22s ease; cursor: pointer; }
  .card-lift:hover { transform: translateY(-5px) rotate(.6deg); box-shadow: 4px 10px 32px rgba(0,0,0,.13) !important; }
  .ink-btn { transition: background .18s, transform .12s; }
  .ink-btn:hover { filter: brightness(.93); }
  .ink-btn:active { transform: scale(.96); }
  input:focus, textarea:focus { outline: none; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #d9c89a; border-radius: 99px; }
`;
document.head.appendChild(_st);

/* ── Helpers ───────────────────────────────────────────────────────────── */
const renderMd = (t = "") =>
  t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
   .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
   .replace(/\*(.+?)\*/g,"<em>$1</em>")
   .replace(/`(.+?)`/g,"<code style='background:#fef3c7;padding:1px 5px;border-radius:3px;font-family:monospace'>$1</code>")
   .replace(/^#{3}\s(.+)/gm,"<h3 style='font-size:1em;margin:.4em 0;font-family:Caveat,cursive'>$1</h3>")
   .replace(/^#{2}\s(.+)/gm,"<h2 style='font-size:1.2em;margin:.4em 0;font-family:Caveat,cursive'>$1</h2>")
   .replace(/^#{1}\s(.+)/gm,"<h1 style='font-size:1.4em;margin:.4em 0;font-family:Caveat,cursive'>$1</h1>")
   .replace(/\n/g,"<br/>");

const NOTE_TINTS = ["#fffbe6","#e8f5e9","#e3f2fd","#fce4ec","#fff3e0","#f3e5f5","#e0f7fa","#fff9c4"];
const tint = id => NOTE_TINTS[parseInt(id.slice(-2),16) % NOTE_TINTS.length];

const nid = () => Date.now().toString(16) + Math.random().toString(16).slice(2,6);
const gU  = () => JSON.parse(localStorage.getItem("av_users")||"{}");
const sU  = u  => localStorage.setItem("av_users", JSON.stringify(u));
const gN  = e  => JSON.parse(localStorage.getItem(`av_notes_${e}`)||"[]");
const sN  = (e,n) => localStorage.setItem(`av_notes_${e}`, JSON.stringify(n));
const fmt = () => new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

/* ── SVG Doodles ───────────────────────────────────────────────────────── */
const D = {strokeLinecap:"round", strokeLinejoin:"round", fill:"none", stroke:"#2d2d2d"};

const Pencil = ({style={}}) => (
  <svg viewBox="0 0 60 160" {...D} strokeWidth="1.8" style={{opacity:.18,...style}}>
    <rect x="12" y="10" width="36" height="110" rx="4"/>
    <line x1="12" y1="30" x2="48" y2="30"/>
    <polygon points="12,120 48,120 30,150"/>
    <line x1="22" y1="135" x2="38" y2="135" strokeWidth="1"/>
    <rect x="12" y="10" width="36" height="14" rx="4"/>
    <line x1="20" y1="50" x2="40" y2="50" strokeWidth="1" strokeDasharray="3 3"/>
    <line x1="20" y1="62" x2="40" y2="62" strokeWidth="1" strokeDasharray="3 3"/>
    <line x1="20" y1="74" x2="40" y2="74" strokeWidth="1" strokeDasharray="3 3"/>
  </svg>
);

const Ruler = ({style={}}) => (
  <svg viewBox="0 0 200 52" {...D} strokeWidth="1.6" style={{opacity:.15,...style}}>
    <rect x="4" y="8" width="192" height="36" rx="4"/>
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>(
      <line key={i} x1={16+i*14} y1="8" x2={16+i*14} y2={i%4===0?30:20}/>
    ))}
    {[0,3,6,9,12].map((i,idx)=>(
      <text key={i} x={14+i*14} y="42" fontSize="8" fill="#2d2d2d" fontFamily="Caveat,cursive" style={{opacity:.6}}>{idx*3}</text>
    ))}
  </svg>
);

const OpenBook = ({style={}}) => (
  <svg viewBox="0 0 140 100" {...D} strokeWidth="1.8" style={{opacity:.16,...style}}>
    <path d="M70 15 C50 10 20 12 8 18 L8 85 C20 79 50 77 70 82"/>
    <path d="M70 15 C90 10 120 12 132 18 L132 85 C120 79 90 77 70 82"/>
    <line x1="70" y1="15" x2="70" y2="82"/>
    {[28,38,48,58].map(y=><line key={y} x1="22" y1={y} x2="58" y2={y-2} strokeWidth="1" strokeDasharray="2 2"/>)}
    {[28,38,48,58].map(y=><line key={y+"r"} x1="82" y1={y} x2="118" y2={y-2} strokeWidth="1" strokeDasharray="2 2"/>)}
  </svg>
);

const Backpack = ({style={}}) => (
  <svg viewBox="0 0 100 120" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <path d="M25 30 Q25 10 50 10 Q75 10 75 30"/>
    <rect x="15" y="30" width="70" height="75" rx="12"/>
    <path d="M35 10 Q35 5 50 5 Q65 5 65 10"/>
    <rect x="30" y="55" width="40" height="28" rx="6"/>
    <line x1="50" y1="55" x2="50" y2="83"/>
    <line x1="30" y1="69" x2="70" y2="69"/>
    <path d="M15 45 Q8 45 8 55 Q8 65 15 65"/>
    <path d="M85 45 Q92 45 92 55 Q92 65 85 65"/>
  </svg>
);

const PaperClip = ({style={}}) => (
  <svg viewBox="0 0 40 100" {...D} strokeWidth="2" style={{opacity:.2,...style}}>
    <path d="M28 38 L28 72 Q28 88 20 88 Q12 88 12 72 L12 28 Q12 8 24 8 Q36 8 36 24 L36 72 Q36 92 20 92 Q4 92 4 72 L4 38"/>
  </svg>
);

const StarDoodle = ({style={}}) => (
  <svg viewBox="0 0 50 50" {...D} strokeWidth="1.5" style={{opacity:.14,...style}}>
    <path d="M25 5 L29 19 L44 19 L32 28 L36 42 L25 33 L14 42 L18 28 L6 19 L21 19 Z"/>
  </svg>
);

const Eraser = ({style={}}) => (
  <svg viewBox="0 0 100 50" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <rect x="5" y="10" width="90" height="30" rx="5"/>
    <line x1="42" y1="10" x2="42" y2="40"/>
    <line x1="5" y1="25" x2="95" y2="25" strokeDasharray="3 3" strokeWidth="1"/>
  </svg>
);

const Glasses = ({style={}}) => (
  <svg viewBox="0 0 120 50" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <circle cx="32" cy="25" r="18"/>
    <circle cx="88" cy="25" r="18"/>
    <line x1="50" y1="25" x2="70" y2="25"/>
    <line x1="2" y1="18" x2="14" y2="22"/>
    <line x1="118" y1="18" x2="106" y2="22"/>
  </svg>
);

const NoteScroll = ({style={}}) => (
  <svg viewBox="0 0 80 100" {...D} strokeWidth="1.6" style={{opacity:.14,...style}}>
    <path d="M15 15 Q10 15 10 25 L10 85 Q10 92 18 92 L65 92 Q72 92 72 85 L72 15 Q72 8 65 8 L22 8 Q15 8 15 15 Z"/>
    <path d="M15 8 Q8 8 8 15 Q8 22 15 22"/>
    <line x1="24" y1="32" x2="60" y2="32" strokeDasharray="2 2"/>
    <line x1="24" y1="44" x2="60" y2="44" strokeDasharray="2 2"/>
    <line x1="24" y1="56" x2="60" y2="56" strokeDasharray="2 2"/>
    <line x1="24" y1="68" x2="48" y2="68" strokeDasharray="2 2"/>
    <path d="M28 20 L52 20" strokeWidth="2.5"/>
  </svg>
);

/* ── NEW DOODLES ── */

const CoffeeCup = ({style={}}) => (
  <svg viewBox="0 0 90 100" {...D} strokeWidth="1.8" style={{opacity:.16,...style}}>
    <path d="M15 35 L20 85 Q20 92 30 92 L60 92 Q70 92 70 85 L75 35 Z"/>
    <path d="M75 45 Q90 45 90 58 Q90 70 75 70"/>
    <ellipse cx="45" cy="35" rx="30" ry="6"/>
    {/* steam */}
    <path d="M30 25 Q33 18 30 11" strokeDasharray="2 2"/>
    <path d="M45 22 Q48 14 45 6" strokeDasharray="2 2"/>
    <path d="M60 25 Q63 18 60 11" strokeDasharray="2 2"/>
  </svg>
);

const Lightbulb = ({style={}}) => (
  <svg viewBox="0 0 80 110" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <path d="M40 10 C20 10 10 25 10 40 C10 55 20 65 28 72 L28 85 L52 85 L52 72 C60 65 70 55 70 40 C70 25 60 10 40 10 Z"/>
    <line x1="30" y1="85" x2="50" y2="85"/>
    <line x1="32" y1="92" x2="48" y2="92"/>
    <line x1="36" y1="99" x2="44" y2="99"/>
    {/* filament */}
    <path d="M34 50 Q37 42 40 50 Q43 58 46 50" strokeWidth="1.2"/>
    {/* sparkles */}
    <line x1="12" y1="28" x2="6" y2="22" strokeWidth="1"/>
    <line x1="68" y1="28" x2="74" y2="22" strokeWidth="1"/>
    <line x1="8" y1="44" x2="2" y2="44" strokeWidth="1"/>
    <line x1="72" y1="44" x2="78" y2="44" strokeWidth="1"/>
  </svg>
);

const GradCap = ({style={}}) => (
  <svg viewBox="0 0 120 90" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <polygon points="60,10 110,35 60,55 10,35"/>
    <path d="M85 45 L85 72 Q85 82 60 82 Q35 82 35 72 L35 45"/>
    <line x1="110" y1="35" x2="110" y2="60"/>
    <path d="M110 60 Q114 65 110 70 Q106 65 110 60"/>
    {/* tassel */}
    <line x1="107" y1="70" x2="107" y2="80"/>
    <line x1="110" y1="70" x2="110" y2="82"/>
    <line x1="113" y1="70" x2="113" y2="80"/>
  </svg>
);

const Compass = ({style={}}) => (
  <svg viewBox="0 0 80 100" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <circle cx="40" cy="38" r="6"/>
    <line x1="37" y1="42" x2="15" y2="88"/>
    <line x1="43" y1="42" x2="65" y2="88"/>
    <line x1="40" y1="32" x2="40" y2="10"/>
    <line x1="15" y1="88" x2="65" y2="88" strokeWidth="1"/>
    <circle cx="40" cy="10" r="4"/>
    <path d="M20 88 L15 95 M60 88 L65 95" strokeWidth="1.2"/>
  </svg>
);

const Calculator = ({style={}}) => (
  <svg viewBox="0 0 80 110" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <rect x="10" y="8" width="60" height="95" rx="8"/>
    <rect x="18" y="18" width="44" height="22" rx="4"/>
    {/* buttons */}
    {[0,1,2,3].map(col=>[0,1,2,3].map(row=>(
      <rect key={`${col}-${row}`} x={18+col*12} y={50+row*13} width="9" height="9" rx="2" strokeWidth="1"/>
    )))}
    {/* display text */}
    <line x1="24" y1="30" x2="56" y2="30" strokeDasharray="2 2" strokeWidth="1"/>
  </svg>
);

const Headphones = ({style={}}) => (
  <svg viewBox="0 0 100 90" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <path d="M15 55 C15 25 85 25 85 55"/>
    <rect x="6" y="52" width="18" height="28" rx="8"/>
    <rect x="76" y="52" width="18" height="28" rx="8"/>
  </svg>
);

const Clock = ({style={}}) => (
  <svg viewBox="0 0 90 90" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <circle cx="45" cy="45" r="36"/>
    <circle cx="45" cy="45" r="3" fill="#2d2d2d"/>
    <line x1="45" y1="45" x2="45" y2="18" strokeWidth="2.2"/>
    <line x1="45" y1="45" x2="62" y2="52" strokeWidth="1.8"/>
    {/* tick marks */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i)=>{
      const r=i%3===0?28:31, R=35;
      const rad=deg*Math.PI/180;
      return <line key={deg} x1={45+r*Math.sin(rad)} y1={45-r*Math.cos(rad)} x2={45+R*Math.sin(rad)} y2={45-R*Math.cos(rad)} strokeWidth={i%3===0?1.5:1}/>;
    })}
  </svg>
);

const Plant = ({style={}}) => (
  <svg viewBox="0 0 80 110" {...D} strokeWidth="1.8" style={{opacity:.15,...style}}>
    <path d="M40 80 L40 40"/>
    {/* left leaf */}
    <path d="M40 65 C30 55 15 55 18 42 C25 45 38 55 40 65"/>
    {/* right leaf */}
    <path d="M40 55 C50 45 65 45 62 32 C55 35 42 45 40 55"/>
    {/* top leaf */}
    <path d="M40 40 C38 28 25 20 28 10 C35 14 42 28 40 40"/>
    {/* pot */}
    <path d="M28 80 L25 100 L55 100 L52 80 Z"/>
    <line x1="25" y1="86" x2="55" y2="86" strokeWidth="1"/>
  </svg>
);

const TestPaper = ({style={}}) => (
  <svg viewBox="0 0 90 110" {...D} strokeWidth="1.7" style={{opacity:.14,...style}}>
    <rect x="10" y="8" width="70" height="95" rx="5"/>
    <line x1="22" y1="25" x2="68" y2="25" strokeDasharray="2 2"/>
    <line x1="22" y1="38" x2="68" y2="38" strokeDasharray="2 2"/>
    <line x1="22" y1="51" x2="68" y2="51" strokeDasharray="2 2"/>
    <line x1="22" y1="64" x2="55" y2="64" strokeDasharray="2 2"/>
    <line x1="22" y1="77" x2="50" y2="77" strokeDasharray="2 2"/>
    {/* big tick / check */}
    <path d="M55 70 L62 80 L78 58" strokeWidth="2.5"/>
    {/* grade circle */}
    <circle cx="68" cy="22" r="10"/>
    <text x="64" y="27" fontSize="10" fontFamily="Caveat,cursive" fill="#2d2d2d" strokeWidth="0" style={{opacity:.7}}>A+</text>
  </svg>
);

const StickyNoteStack = ({style={}}) => (
  <svg viewBox="0 0 90 100" {...D} strokeWidth="1.7" style={{opacity:.14,...style}}>
    <rect x="18" y="18" width="60" height="60" rx="4" transform="rotate(-8 48 48)"/>
    <rect x="14" y="14" width="60" height="60" rx="4" transform="rotate(-3 44 44)"/>
    <rect x="10" y="10" width="60" height="60" rx="4"/>
    <line x1="20" y1="28" x2="60" y2="28" strokeDasharray="2 2"/>
    <line x1="20" y1="38" x2="60" y2="38" strokeDasharray="2 2"/>
    <line x1="20" y1="48" x2="48" y2="48" strokeDasharray="2 2"/>
    {/* folded corner */}
    <path d="M70 10 L70 25 L55 10 Z"/>
  </svg>
);

const ReadingStudent = ({style={}}) => (
  <svg viewBox="0 0 100 130" {...D} strokeWidth="1.8" style={{opacity:.14,...style}}>
    {/* head */}
    <circle cx="50" cy="22" r="16"/>
    {/* hair */}
    <path d="M34 18 Q36 8 50 6 Q64 8 66 18" strokeWidth="1" fill="none"/>
    {/* body */}
    <path d="M35 38 Q32 60 30 80 L70 80 Q68 60 65 38 Q58 35 50 35 Q42 35 35 38Z"/>
    {/* arms holding book */}
    <path d="M30 50 Q18 55 16 68 L36 68"/>
    <path d="M70 50 Q82 55 84 68 L64 68"/>
    {/* open book */}
    <path d="M20 65 L20 85 Q30 82 50 85 Q70 82 80 85 L80 65 Q70 62 50 65 Q30 62 20 65Z"/>
    <line x1="50" y1="65" x2="50" y2="85"/>
    {/* legs */}
    <line x1="42" y1="80" x2="38" y2="110"/>
    <line x1="58" y1="80" x2="62" y2="110"/>
    {/* feet */}
    <path d="M38 110 Q33 112 30 110"/>
    <path d="M62 110 Q67 112 70 110"/>
    {/* glasses */}
    <circle cx="44" cy="22" r="6" strokeWidth="1"/>
    <circle cx="56" cy="22" r="6" strokeWidth="1"/>
    <line x1="50" y1="22" x2="50" y2="22" strokeWidth="1"/>
  </svg>
);

const Pencilcase = ({style={}}) => (
  <svg viewBox="0 0 120 60" {...D} strokeWidth="1.8" style={{opacity:.14,...style}}>
    <rect x="5" y="15" width="110" height="35" rx="17"/>
    <line x1="5" y1="32" x2="115" y2="32"/>
    {/* zipper */}
    {[0,1,2,3,4,5,6,7].map(i=>(
      <line key={i} x1={20+i*12} y1="29" x2={20+i*12} y2="35" strokeWidth="1.2"/>
    ))}
    <circle cx="112" cy="32" r="4"/>
    {/* pencils sticking out */}
    <line x1="30" y1="15" x2="28" y2="2"/>
    <line x1="50" y1="15" x2="52" y2="1"/>
    <line x1="70" y1="15" x2="68" y2="3"/>
    <polygon points="27,2 29,2 28,0" strokeWidth="1"/>
    <polygon points="51,1 53,1 52,-1" strokeWidth="1"/>
    <polygon points="67,3 69,3 68,1" strokeWidth="1"/>
  </svg>
);

const Microscope = ({style={}}) => (
  <svg viewBox="0 0 80 110" {...D} strokeWidth="1.8" style={{opacity:.14,...style}}>
    {/* base */}
    <path d="M15 100 L65 100 L60 90 L20 90 Z"/>
    {/* arm */}
    <rect x="34" y="30" width="12" height="60" rx="4"/>
    {/* eyepiece */}
    <rect x="28" y="18" width="24" height="16" rx="4"/>
    <line x1="40" y1="18" x2="40" y2="10"/>
    <ellipse cx="40" cy="10" rx="8" ry="4"/>
    {/* objective lens */}
    <ellipse cx="40" cy="88" rx="10" ry="5"/>
    {/* focus knob */}
    <ellipse cx="52" cy="58" rx="5" ry="8"/>
  </svg>
);

const Pushpin = ({style={}}) => (
  <svg viewBox="0 0 50 80" {...D} strokeWidth="1.8" style={{opacity:.17,...style}}>
    <circle cx="25" cy="22" r="16"/>
    <circle cx="25" cy="22" r="7" strokeWidth="1.2"/>
    <line x1="25" y1="38" x2="25" y2="72"/>
    <path d="M20 70 L25 78 L30 70"/>
  </svg>
);

const BooksStack = ({style={}}) => (
  <svg viewBox="0 0 100 110" {...D} strokeWidth="1.7" style={{opacity:.15,...style}}>
    {/* book 3 (bottom) */}
    <rect x="8" y="82" width="84" height="18" rx="3"/>
    <line x1="18" y1="82" x2="18" y2="100"/>
    {/* book 2 */}
    <rect x="12" y="58" width="76" height="18" rx="3" transform="rotate(-2 50 67)"/>
    <line x1="22" y1="57" x2="21" y2="75" />
    {/* book 1 (top) */}
    <rect x="14" y="34" width="72" height="18" rx="3" transform="rotate(3 50 43)"/>
    <line x1="24" y1="34" x2="25" y2="52"/>
    {/* spine detail lines */}
    <line x1="20" y1="90" x2="80" y2="90" strokeWidth="1" strokeDasharray="3 3"/>
  </svg>
);

/* ── Root ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("av_session")||"null"); } catch { return null; }
  });
  const login  = u => { sessionStorage.setItem("av_session", JSON.stringify(u)); setUser(u); };
  const logout = () => { sessionStorage.removeItem("av_session"); setUser(null); };
  return user ? <NotesApp user={user} logout={logout}/> : <AuthScreen login={login}/>;
}

/* ── AUTH ──────────────────────────────────────────────────────────────── */
function AuthScreen({ login }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    setErr("");
    const users = gU();
    if (!email||!pw) return setErr("Please fill all fields.");
    if (mode==="register") {
      if (!name) return setErr("What's your name?");
      if (users[email]) return setErr("Account exists — sign in instead.");
      users[email]={name,pw}; sU(users); login({email,name});
    } else {
      if (!users[email]) return setErr("No account found.");
      if (users[email].pw!==pw) return setErr("Wrong password.");
      login({email, name:users[email].name});
    }
  };

  return (
    <div style={{minHeight:"100vh", background:"#f7f3eb", display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden"}}>
      {/* ── scattered doodles ── */}
      <Pencil       style={{position:"absolute",width:52,top:"5%",left:"4%",transform:"rotate(18deg)",animation:"float 4s ease-in-out infinite"}}/>
      <StarDoodle   style={{position:"absolute",width:36,top:"16%",left:"3%",transform:"rotate(10deg)"}}/>
      <CoffeeCup    style={{position:"absolute",width:68,top:"28%",left:"2%",transform:"rotate(-6deg)",animation:"float 6s ease-in-out infinite 0.5s"}}/>
      <Ruler        style={{position:"absolute",width:140,top:"50%",left:"-20px",transform:"rotate(-15deg)"}}/>
      <Pushpin      style={{position:"absolute",width:32,top:"66%",left:"8%",transform:"rotate(8deg)"}}/>
      <Pencilcase   style={{position:"absolute",width:110,bottom:"14%",left:"2%",transform:"rotate(-10deg)"}}/>
      <StarDoodle   style={{position:"absolute",width:24,bottom:"8%",left:"16%",transform:"rotate(30deg)"}}/>
      <OpenBook     style={{position:"absolute",width:120,top:"6%",right:"4%",transform:"rotate(-8deg)"}}/>
      <GradCap      style={{position:"absolute",width:90,top:"20%",right:"2%",transform:"rotate(5deg)",animation:"float 5s ease-in-out infinite 1s"}}/>
      <Glasses      style={{position:"absolute",width:78,top:"36%",right:"5%",transform:"rotate(-12deg)"}}/>
      <Lightbulb    style={{position:"absolute",width:58,top:"52%",right:"3%",transform:"rotate(8deg)"}}/>
      <PaperClip    style={{position:"absolute",width:26,top:"65%",right:"14%",transform:"rotate(-18deg)"}}/>
      <Eraser       style={{position:"absolute",width:72,bottom:"22%",right:"4%",transform:"rotate(10deg)"}}/>
      <Backpack     style={{position:"absolute",width:85,bottom:"6%",right:"6%",transform:"rotate(-5deg)",animation:"float 7s ease-in-out infinite 2s"}}/>
      <Clock        style={{position:"absolute",width:65,top:"8%",left:"22%",transform:"rotate(-5deg)"}}/>
      <TestPaper    style={{position:"absolute",width:70,bottom:"16%",left:"22%",transform:"rotate(6deg)"}}/>
      <BooksStack   style={{position:"absolute",width:75,top:"70%",right:"22%",transform:"rotate(-4deg)"}}/>
      <Compass      style={{position:"absolute",width:55,top:"42%",left:"18%",transform:"rotate(14deg)"}}/>
      <ReadingStudent style={{position:"absolute",width:80,bottom:"6%",left:"38%",transform:"rotate(-3deg)",opacity:.12}}/>
      <StickyNoteStack style={{position:"absolute",width:65,top:"12%",right:"22%",transform:"rotate(8deg)"}}/>
      <Microscope   style={{position:"absolute",width:58,top:"55%",right:"18%",transform:"rotate(-10deg)"}}/>
      <Plant        style={{position:"absolute",width:55,bottom:"28%",right:"28%",transform:"rotate(4deg)"}}/>
      <Headphones   style={{position:"absolute",width:70,bottom:"42%",left:"10%",transform:"rotate(-8deg)"}}/>
      <Calculator   style={{position:"absolute",width:52,top:"80%",left:"30%",transform:"rotate(12deg)"}}/>
      <NoteScroll   style={{position:"absolute",width:50,top:"35%",right:"26%",transform:"rotate(-6deg)"}}/>

      {/* ruled-paper lines behind card */}
      <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,#e8e0ce 27px,#e8e0ce 28px)",opacity:.4,pointerEvents:"none"}}/>

      {/* card */}
      <div style={{background:"#fff", border:"1.5px solid #e0d8c8", borderRadius:20, padding:"44px 40px", width:400, maxWidth:"92vw", boxShadow:"6px 8px 32px rgba(0,0,0,.08)", animation:"popIn .5s cubic-bezier(.34,1.56,.64,1)", position:"relative", zIndex:10}}>
        {/* top tape strip */}
        <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",width:60,height:22,background:"rgba(245,200,66,.55)",borderRadius:3,border:"1px solid rgba(200,160,0,.2)"}}/>

        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:38,fontWeight:700,color:"#1a1a1a",letterSpacing:-1,lineHeight:1}}>
            AVote
          </div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:16,color:"#888",marginTop:4}}>
            {mode==="login" ? "good to see you again ✏️" : "let's get you started 📓"}
          </div>
        </div>

        {/* mode tabs */}
        <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:"2px solid #f0e8d4"}}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"10px 0",border:"none",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:18,fontWeight:600,color:mode===m?"#1a1a1a":"#bbb",borderBottom:mode===m?"2px solid #1a1a1a":"2px solid transparent",marginBottom:-2,cursor:"pointer",transition:"all .2s"}}>
              {m==="login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {mode==="register" && (
            <LineInput placeholder="Your name" value={name} onChange={setName} icon="👤"/>
          )}
          <LineInput placeholder="Email" type="email" value={email} onChange={setEmail} icon="✉"/>
          <LineInput placeholder="Password" type="password" value={pw} onChange={setPw} onEnter={submit} icon="🔑"/>
          {err && (
            <div style={{fontFamily:"'Caveat',cursive",fontSize:15,color:"#c0392b",background:"#fff5f5",border:"1px dashed #e99",borderRadius:8,padding:"8px 12px"}}>
              ✗ {err}
            </div>
          )}
          <button className="ink-btn" onClick={submit}
            style={{background:"#1a1a1a",color:"#f7f3eb",border:"none",borderRadius:12,padding:"14px",fontFamily:"'Caveat',cursive",fontSize:20,fontWeight:700,cursor:"pointer",marginTop:4,letterSpacing:.3,boxShadow:"3px 4px 0 #888"}}>
            {mode==="login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LineInput({placeholder, type="text", value, onChange, onEnter, icon}) {
  const [focus,setFocus]=useState(false);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,borderBottom:`2px solid ${focus?"#1a1a1a":"#e0d8c8"}`,paddingBottom:8,transition:"border-color .2s"}}>
      <span style={{fontSize:15,opacity:.5}}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        onKeyDown={e=>e.key==="Enter"&&onEnter&&onEnter()}
        style={{border:"none",background:"transparent",fontSize:16,fontFamily:"'Lora',serif",flex:1,color:"#1a1a1a"}}/>
    </div>
  );
}

/* ── NOTES APP ─────────────────────────────────────────────────────────── */
function NotesApp({user, logout}) {
  const [notes, setNotes]   = useState(()=>gN(user.email));
  const [search, setSearch] = useState("");
  const [editing, setEditing]= useState(null);
  const [preview, setPreview]= useState(null);
  const [showMd, setShowMd] = useState(false);

  const persist  = n => { setNotes(n); sN(user.email,n); };
  const filtered = notes.filter(n=>
    n.title.toLowerCase().includes(search.toLowerCase())||
    n.body.toLowerCase().includes(search.toLowerCase())
  );
  const pinned   = filtered.filter(n=>n.pinned);
  const unpinned = filtered.filter(n=>!n.pinned);

  const openNew  = () => setEditing({id:null,title:"",body:"",pinned:false});
  const openEdit = n  => { setEditing({...n}); setPreview(null); };
  const saveNote = () => {
    if (!editing.title.trim()&&!editing.body.trim()) return setEditing(null);
    if (editing.id) persist(notes.map(n=>n.id===editing.id?{...editing}:n));
    else persist([{...editing,id:nid(),createdAt:fmt()},...notes]);
    setEditing(null);
  };
  const deleteNote = id => { persist(notes.filter(n=>n.id!==id)); setPreview(null); };
  const togglePin  = id => persist(notes.map(n=>n.id===id?{...n,pinned:!n.pinned}:n));
  const prevNote   = preview ? notes.find(n=>n.id===preview) : null;

  return (
    <div style={{display:"flex",height:"100vh",background:"#f7f3eb",overflow:"hidden",position:"relative"}}>
      {/* subtle ruled lines on bg */}
      <div style={{position:"fixed",inset:0,backgroundImage:"repeating-linear-gradient(transparent,transparent 31px,#e8e0ce 31px,#e8e0ce 32px)",opacity:.3,pointerEvents:"none",zIndex:0}}/>

      {/* ── Sidebar ── */}
      <aside style={{width:230,background:"#fff",borderRight:"1.5px solid #e8dfc8",display:"flex",flexDirection:"column",padding:"28px 18px",gap:6,flexShrink:0,position:"relative",zIndex:1}}>
        {/* sidebar doodles */}
        <NoteScroll   style={{position:"absolute",width:55,bottom:90,right:-8,transform:"rotate(12deg)",opacity:.12}}/>
        <PaperClip    style={{position:"absolute",width:22,top:14,right:20,transform:"rotate(15deg)",opacity:.2}}/>
        <StarDoodle   style={{position:"absolute",width:28,bottom:160,left:8,transform:"rotate(20deg)",opacity:.12}}/>
        <Pushpin      style={{position:"absolute",width:24,bottom:220,right:12,transform:"rotate(-10deg)",opacity:.15}}/>
        <Plant        style={{position:"absolute",width:42,bottom:50,left:4,transform:"rotate(-4deg)",opacity:.12}}/>

        <div style={{fontFamily:"'Caveat',cursive",fontSize:32,fontWeight:700,color:"#1a1a1a",marginBottom:4,letterSpacing:-1}}>
          AVote
        </div>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:14,color:"#aaa",marginBottom:20}}>
          your study notes ✏️
        </div>

        <button className="ink-btn" onClick={openNew}
          style={{background:"#1a1a1a",color:"#f7f3eb",border:"none",borderRadius:12,padding:"12px 16px",fontFamily:"'Caveat',cursive",fontSize:19,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,justifyContent:"center",boxShadow:"2px 3px 0 #bbb",marginBottom:8}}>
          + New Note
        </button>

        <div style={{display:"flex",flexDirection:"column",gap:2,marginTop:8}}>
          {[
            {icon:"📋",label:"All Notes",count:notes.length},
            {icon:"📌",label:"Pinned",count:notes.filter(n=>n.pinned).length},
          ].map(item=>(
            <div key={item.label} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:"#f9f6ef"}}>
              <span style={{fontSize:15}}>{item.icon}</span>
              <span style={{fontFamily:"'Caveat',cursive",fontSize:17,color:"#444",flex:1}}>{item.label}</span>
              <span style={{fontFamily:"'Caveat',cursive",fontSize:15,color:"#aaa"}}>{item.count}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:"auto",paddingTop:16,borderTop:"1.5px dashed #e0d8c8"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:17,color:"#f5c842",flexShrink:0}}>
              {user.name[0].toUpperCase()}
            </div>
            <span style={{fontFamily:"'Caveat',cursive",fontSize:16,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
          </div>
          <button onClick={logout} style={{background:"none",border:"1.5px dashed #d0c8b0",color:"#aaa",borderRadius:10,padding:"7px 14px",fontFamily:"'Caveat',cursive",fontSize:16,cursor:"pointer",width:"100%",textAlign:"left"}}>
            sign out ↗
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{flex:1,overflowY:"auto",padding:"36px 40px",position:"relative",zIndex:1}}>
        {/* ── ambient doodles (fixed, behind content) ── */}
        <Pencil          style={{position:"fixed",width:46,top:18,right:28,transform:"rotate(-20deg)",pointerEvents:"none"}}/>
        <GradCap         style={{position:"fixed",width:80,top:10,right:80,transform:"rotate(6deg)",pointerEvents:"none"}}/>
        <Lightbulb       style={{position:"fixed",width:54,top:16,right:176,transform:"rotate(-10deg)",pointerEvents:"none"}}/>
        <Headphones      style={{position:"fixed",width:68,top:12,right:250,transform:"rotate(4deg)",pointerEvents:"none"}}/>
        <Clock           style={{position:"fixed",width:58,top:20,right:340,transform:"rotate(-6deg)",pointerEvents:"none"}}/>
        <StickyNoteStack style={{position:"fixed",width:55,top:14,right:420,transform:"rotate(10deg)",pointerEvents:"none"}}/>
        <Ruler           style={{position:"fixed",width:150,bottom:28,right:20,transform:"rotate(4deg)",pointerEvents:"none"}}/>
        <Eraser          style={{position:"fixed",width:70,bottom:24,right:190,transform:"rotate(-8deg)",pointerEvents:"none"}}/>
        <Calculator      style={{position:"fixed",width:50,bottom:20,right:280,transform:"rotate(12deg)",pointerEvents:"none"}}/>
        <Compass         style={{position:"fixed",width:52,bottom:18,right:358,transform:"rotate(-5deg)",pointerEvents:"none"}}/>
        <Plant           style={{position:"fixed",width:50,bottom:20,right:432,transform:"rotate(3deg)",pointerEvents:"none"}}/>
        <Microscope      style={{position:"fixed",width:52,bottom:16,right:506,transform:"rotate(-12deg)",pointerEvents:"none"}}/>
        <Glasses         style={{position:"fixed",width:66,bottom:100,right:24,transform:"rotate(-6deg)",pointerEvents:"none"}}/>
        <StarDoodle      style={{position:"fixed",width:32,bottom:90,right:116,pointerEvents:"none"}}/>
        <PaperClip       style={{position:"fixed",width:24,bottom:120,right:170,transform:"rotate(20deg)",pointerEvents:"none"}}/>
        <TestPaper       style={{position:"fixed",width:60,bottom:80,right:200,transform:"rotate(8deg)",pointerEvents:"none"}}/>
        <BooksStack      style={{position:"fixed",width:68,bottom:70,right:290,transform:"rotate(-4deg)",pointerEvents:"none"}}/>
        <Pushpin         style={{position:"fixed",width:28,bottom:140,right:380,transform:"rotate(-15deg)",pointerEvents:"none"}}/>
        <CoffeeCup       style={{position:"fixed",width:58,bottom:60,right:378,transform:"rotate(6deg)",pointerEvents:"none"}}/>
        <Pencilcase      style={{position:"fixed",width:100,bottom:50,right:460,transform:"rotate(-6deg)",pointerEvents:"none"}}/>
        <ReadingStudent  style={{position:"fixed",width:72,bottom:52,right:584,transform:"rotate(2deg)",pointerEvents:"none"}}/>
        <NoteScroll      style={{position:"fixed",width:48,bottom:150,right:28,transform:"rotate(-12deg)",pointerEvents:"none"}}/>
        <OpenBook        style={{position:"fixed",width:90,bottom:160,right:100,transform:"rotate(5deg)",pointerEvents:"none"}}/>
        <Backpack        style={{position:"fixed",width:70,bottom:155,right:214,transform:"rotate(-8deg)",pointerEvents:"none"}}/>

        {/* Topbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:36,flexWrap:"wrap",gap:14}}>
          <div>
            <h1 style={{fontFamily:"'Caveat',cursive",fontSize:36,fontWeight:700,color:"#1a1a1a",lineHeight:1}}>
              My Notes
            </h1>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:16,color:"#aaa",marginTop:2}}>
              {notes.length===0 ? "nothing here yet..." : `${notes.length} note${notes.length!==1?"s":""} total`}
            </p>
          </div>
          {/* Search */}
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1.5px solid #e0d8c4",borderRadius:12,padding:"10px 16px",width:260,boxShadow:"2px 3px 0 #e0d8c4"}}>
            <span style={{opacity:.4,fontSize:15}}>🔍</span>
            <input placeholder="search notes…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{border:"none",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:17,flex:1,color:"#333"}}/>
            {search&&<span onClick={()=>setSearch("")} style={{cursor:"pointer",fontSize:13,color:"#bbb"}}>✕</span>}
          </div>
        </div>

        {notes.length===0&&!editing ? (
          <EmptyState onClick={openNew}/>
        ) : (
          <>
            {pinned.length>0 && (
              <>
                <SectionLabel>📌 Pinned</SectionLabel>
                <NoteGrid>{pinned.map((n,i)=><NoteCard key={n.id} note={n} idx={i} onEdit={openEdit} onPin={togglePin} onPreview={setPreview}/>)}</NoteGrid>
              </>
            )}
            {unpinned.length>0 && (
              <>
                <SectionLabel>{pinned.length>0?"✏️ Others":"✏️ All Notes"}</SectionLabel>
                <NoteGrid>{unpinned.map((n,i)=><NoteCard key={n.id} note={n} idx={i} onEdit={openEdit} onPin={togglePin} onPreview={setPreview}/>)}</NoteGrid>
              </>
            )}
            {filtered.length===0&&search&&(
              <div style={{textAlign:"center",padding:"80px 0",fontFamily:"'Caveat',cursive",fontSize:22,color:"#bbb"}}>
                nothing found for "{search}" 🔍
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Editor Modal ── */}
      {editing && (
        <Overlay onClose={saveNote}>
          <div style={{background:"#fff",borderRadius:20,width:580,maxWidth:"93vw",maxHeight:"86vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"8px 10px 0 #c8bfa4",border:"1.5px solid #e0d8c4",animation:"popIn .38s cubic-bezier(.34,1.56,.64,1)",position:"relative"}}>
            {/* tape */}
            <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:56,height:20,background:"rgba(245,200,66,.5)",borderRadius:3,border:"1px solid rgba(200,160,0,.2)",zIndex:2}}/>
            {/* left ruled margin line */}
            <div style={{position:"absolute",left:56,top:0,bottom:0,width:"1.5px",background:"#f5c0c0",opacity:.5,pointerEvents:"none"}}/>

            <div style={{padding:"24px 24px 0 64px",display:"flex",alignItems:"center",gap:10}}>
              <input placeholder="Title…" value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}
                style={{flex:1,border:"none",fontFamily:"'Caveat',cursive",fontSize:26,fontWeight:700,color:"#1a1a1a",background:"transparent"}}/>
              <div style={{display:"flex",gap:6,marginRight:8}}>
                <SmBtn onClick={()=>setShowMd(!showMd)}>{showMd?"✏️":"👁"}</SmBtn>
                <SmBtn onClick={()=>setEditing({...editing,pinned:!editing.pinned})}>{editing.pinned?"📌":"📍"}</SmBtn>
              </div>
            </div>

            {showMd
              ? <div style={{flex:1,padding:"14px 24px 14px 64px",overflowY:"auto",minHeight:260,fontSize:15,lineHeight:2,color:"#333",fontFamily:"'Lora',serif"}}
                  dangerouslySetInnerHTML={{__html:renderMd(editing.body)||"<span style='opacity:.3;font-family:Caveat,cursive;font-size:1.1em'>nothing to preview…</span>"}}/>
              : <textarea value={editing.body} onChange={e=>setEditing({...editing,body:e.target.value})}
                  placeholder="write here… **bold**, *italic*, `code`, # heading"
                  style={{flex:1,border:"none",padding:"14px 24px 14px 64px",fontFamily:"'Lora',serif",fontSize:15,lineHeight:2,resize:"none",minHeight:260,background:"transparent",color:"#333",backgroundImage:"repeating-linear-gradient(transparent,transparent 31px,#f0e8d4 31px,#f0e8d4 32px)",backgroundAttachment:"local"}}/>
            }

            <div style={{padding:"12px 24px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1.5px dashed #e8dfc8"}}>
              <button onClick={()=>setEditing(null)} style={{background:"none",border:"1.5px dashed #d0c8b0",color:"#aaa",borderRadius:10,padding:"8px 18px",fontFamily:"'Caveat',cursive",fontSize:17,cursor:"pointer"}}>
                cancel
              </button>
              <button className="ink-btn" onClick={saveNote}
                style={{background:"#1a1a1a",color:"#f7f3eb",border:"none",borderRadius:12,padding:"10px 26px",fontFamily:"'Caveat',cursive",fontSize:19,fontWeight:700,cursor:"pointer",boxShadow:"2px 3px 0 #888"}}>
                save note →
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Preview Modal ── */}
      {prevNote && (
        <Overlay onClose={()=>setPreview(null)}>
          <div style={{background:tint(prevNote.id),borderRadius:20,width:560,maxWidth:"93vw",maxHeight:"86vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"8px 10px 0 #c8bfa4",border:"1.5px solid #e0d8c4",animation:"popIn .38s cubic-bezier(.34,1.56,.64,1)",position:"relative"}}>
            <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:56,height:20,background:"rgba(245,200,66,.5)",borderRadius:3,border:"1px solid rgba(200,160,0,.2)",zIndex:2}}/>
            <div style={{position:"absolute",left:56,top:0,bottom:0,width:"1.5px",background:"#f5c0c0",opacity:.45,pointerEvents:"none"}}/>

            <div style={{padding:"24px 24px 0 64px",display:"flex",alignItems:"flex-start",gap:10}}>
              <h2 style={{flex:1,fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:28,color:"#1a1a1a",lineHeight:1.2}}>{prevNote.title||"Untitled"}</h2>
              <button onClick={()=>setPreview(null)} style={{background:"rgba(0,0,0,.07)",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>
            <div style={{flex:1,padding:"14px 24px 14px 64px",overflowY:"auto",fontSize:15,lineHeight:2,color:"#333",fontFamily:"'Lora',serif",backgroundImage:"repeating-linear-gradient(transparent,transparent 31px,rgba(0,0,0,.04) 31px,rgba(0,0,0,.04) 32px)",backgroundAttachment:"local"}}
              dangerouslySetInnerHTML={{__html:renderMd(prevNote.body)||"<span style='opacity:.3;font-family:Caveat,cursive;font-size:1.1em'>empty note</span>"}}/>
            <div style={{padding:"12px 24px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1.5px dashed #e0d4b8"}}>
              <span style={{fontFamily:"'Caveat',cursive",fontSize:15,color:"#aaa"}}>{prevNote.createdAt}</span>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>openEdit(prevNote)} style={{background:"rgba(0,0,0,.07)",border:"none",borderRadius:10,padding:"8px 18px",fontFamily:"'Caveat',cursive",fontSize:17,cursor:"pointer",color:"#444"}}>edit ✏️</button>
                <button onClick={()=>deleteNote(prevNote.id)} style={{background:"rgba(0,0,0,.07)",border:"none",borderRadius:10,padding:"8px 18px",fontFamily:"'Caveat',cursive",fontSize:17,cursor:"pointer",color:"#c0392b"}}>delete 🗑</button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

/* ── Small components ──────────────────────────────────────────────────── */
const SectionLabel = ({children}) => (
  <div style={{fontFamily:"'Caveat',cursive",fontSize:18,fontWeight:600,color:"#888",marginBottom:14,marginTop:8,display:"flex",alignItems:"center",gap:10}}>
    {children}
    <div style={{flex:1,height:"1.5px",background:"repeating-linear-gradient(90deg,#d0c8b0 0,#d0c8b0 6px,transparent 6px,transparent 12px)"}}/>
  </div>
);

const NoteGrid = ({children}) => (
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:18,marginBottom:32}}>
    {children}
  </div>
);

function NoteCard({note, idx, onEdit, onPin, onPreview}) {
  const snippet = note.body.replace(/[#*`]/g,"").slice(0,120);
  return (
    <div className="card-lift" onClick={()=>onPreview(note.id)}
      style={{background:tint(note.id),border:"1.5px solid #e0d8c4",borderRadius:16,padding:"16px 14px",display:"flex",flexDirection:"column",gap:8,minHeight:155,boxShadow:"3px 4px 0 #ddd5bc",animation:`fadeUp .4s ${idx*.06}s ease both`,position:"relative",overflow:"hidden"}}>
      {/* ruled lines */}
      <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(transparent,transparent 23px,rgba(0,0,0,.05) 23px,rgba(0,0,0,.05) 24px)",borderRadius:16,pointerEvents:"none"}}/>
      {/* left margin */}
      <div style={{position:"absolute",left:32,top:0,bottom:0,width:1,background:"rgba(245,150,150,.35)",pointerEvents:"none"}}/>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,position:"relative",paddingLeft:20}}>
        <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:17,color:"#1a1a1a",flex:1,lineHeight:1.3}}>{note.title||"Untitled"}</p>
        <button onClick={e=>{e.stopPropagation();onPin(note.id);}}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:14,opacity:.6,padding:0,lineHeight:1,flexShrink:0}}>
          {note.pinned?"📌":"·"}
        </button>
      </div>

      <p style={{fontFamily:"'Lora',serif",fontSize:12,lineHeight:1.7,flex:1,color:"#555",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",position:"relative",paddingLeft:20}}>
        {snippet || <em style={{opacity:.4}}>empty</em>}
      </p>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",paddingLeft:20}}>
        <span style={{fontFamily:"'Caveat',cursive",fontSize:13,color:"#bbb"}}>{note.createdAt}</span>
        <button onClick={e=>{e.stopPropagation();onEdit(note);}}
          style={{background:"rgba(0,0,0,.06)",border:"none",borderRadius:7,padding:"3px 10px",cursor:"pointer",fontFamily:"'Caveat',cursive",fontSize:14,color:"#666"}}>
          edit
        </button>
      </div>
    </div>
  );
}

function EmptyState({onClick}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"58vh",gap:18,textAlign:"center",position:"relative"}}>
      <OpenBook style={{width:130,animation:"float 4s ease-in-out infinite",opacity:.2}}/>
      <h2 style={{fontFamily:"'Caveat',cursive",fontSize:28,fontWeight:700,color:"#555"}}>no notes yet…</h2>
      <p style={{fontFamily:"'Lora',serif",fontStyle:"italic",color:"#aaa",fontSize:15,maxWidth:260,lineHeight:1.7}}>a blank page is full of possibility. start writing!</p>
      <button className="ink-btn" onClick={onClick}
        style={{background:"#1a1a1a",color:"#f7f3eb",border:"none",borderRadius:12,padding:"13px 30px",fontFamily:"'Caveat',cursive",fontSize:20,fontWeight:700,cursor:"pointer",boxShadow:"3px 4px 0 #888",marginTop:4}}>
        + create first note
      </button>
    </div>
  );
}

function Overlay({onClose,children}) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(40,32,20,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(3px)",padding:16}}>
      {children}
    </div>
  );
}

function SmBtn({onClick,children}) {
  return (
    <button onClick={onClick} style={{background:"#f5f0e8",border:"1px solid #e0d8c4",borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {children}
    </button>
  );
}
