import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ClipboardCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Loader2,
  Download,
  Trash2,
  Clock,
  UserPlus,
  ShieldCheck,
  ListChecks,
  Eye,
  X,
  Plus,
  FileText,
  UserMinus,
  Search,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  AlertTriangle,
  Calendar,
  User
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCI3bmiE5QCjxOnFPoNs8sUv3ZvgLlXzC4",
  authDomain: "circle-k-list.firebaseapp.com",
  projectId: "circle-k-list",
  storageBucket: "circle-k-list.appspot.com",
  messagingSenderId: "830027363672",
  appId: "1:830027363672:web:b56094b154273423f0212d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DEFAULT_QUESTIONS = [
  "Sweep and Mop Floor (Sales Floor + Behind Register Area)",
  "Clean Restrooms (Men and Women)",
  "Scan Lottery",
  "Stock Condiments (Fresh & Bottles)",
  "Stock Cups, Lids and Straws",
  "Fill Coffee Beans and Cappuccino Powder",
  "Stock Cooler (Beer Side)",
  "Clean Coffee Machines",
  "Front and Face Cooler",
  "Wash Dishes and Utensils",
  "Clean Hot Dog Grill, Tray and Underneath",
  "Stock Hot Dogs in Jars",
  "Remove Expired Products from Dairy Case",
  "Prepare and Label Sanitizer Solution"
];

/* ================= STYLES ================= */
const CustomStyles = () => (
  <style>{`
    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&family=Inter:wght@400;600&display=swap");
    :root {
      --bg: #0d1b2a;
      --card: #1b263b;
      --accent-blue: #4cc9f0;
      --accent-orange: #ff9f1c;
      --text-primary: #e0e1dd;
      --text-secondary: #778da9;
      --success: #00ff9c;
      --danger: #ff4d4f;
      --warning: #ffd166;
    }
    body { 
      margin: 0; 
      font-family: "Josefin Sans", sans-serif; 
      background-color: var(--bg); 
      color: var(--text-primary); 
      overflow-x: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    .app-container { max-width: 1400px; margin: 0 auto; padding: 12px; min-height: 100vh; }
    
    .header { 
      display: flex; 
      flex-direction: column; 
      gap: 12px; 
      margin-bottom: 20px; 
      background: rgba(27, 38, 59, 0.95); 
      backdrop-filter: blur(12px); 
      padding: 16px; 
      border-radius: 20px; 
      border: 1px solid rgba(255, 255, 255, 0.1); 
      position: sticky; 
      top: 8px; 
      z-index: 100; 
    }
    
    .brand { font-size: 1.6rem; font-weight: 700; display: flex; align-items: center; gap: 8px; letter-spacing: -0.5px; }
    .brand .store { color: var(--accent-orange); }
    
    .nav-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .nav-btn { 
      padding: 10px 14px; 
      border-radius: 10px; 
      border: 1px solid rgba(255,255,255,0.1); 
      background: rgba(65, 90, 119, 0.35); 
      color: white; 
      cursor: pointer; 
      font-weight: 600; 
      display: inline-flex; 
      align-items: center; 
      gap: 6px; 
      transition: all 0.2s;
      font-size: 0.85rem;
      font-family: inherit;
    }
    .nav-btn:active { transform: scale(0.96); }
    .nav-btn.active, .nav-btn.primary { background: var(--accent-blue); color: var(--bg); border: none; }
    .nav-btn.danger { background: rgba(255,77,79,0.15); color: var(--danger); border-color: var(--danger); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
    
    .card { background: var(--card); padding: 20px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px; }
    
    .input-field { 
      width: 100%; 
      padding: 14px; 
      border-radius: 12px; 
      border: 1px solid rgba(255,255,255,0.15); 
      background: rgba(13, 27, 42, 0.8); 
      color: white; 
      outline: none; 
      font-family: inherit;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .input-field:focus { border-color: var(--accent-blue); }
    
    .opt-group { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; width: 100%; }
    .opt-btn { 
      padding: 14px 4px; 
      border-radius: 10px; 
      background: rgba(13, 27, 42, 0.5); 
      border: 1px solid rgba(255,255,255,0.1); 
      color: var(--text-secondary); 
      cursor: pointer; 
      font-weight: 700;
      transition: all 0.2s;
      font-size: 1rem;
      font-family: inherit;
    }
    .opt-btn.active-yes { background: var(--success); color: #004d30; border-color: var(--success); }
    .opt-btn.active-no { background: var(--danger); color: white; border-color: var(--danger); }
    .opt-btn.active-na { background: var(--warning); color: #4d3d00; border-color: var(--warning); }
    
    .modal-overlay { 
      position: fixed; 
      inset: 0; 
      background: rgba(0,0,0,0.85); 
      backdrop-filter: blur(12px); 
      z-index: 1000; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 16px; 
    }
    .modal-content { 
      background: var(--card); 
      width: 100%; 
      max-width: 500px; 
      max-height: 90vh; 
      border-radius: 28px; 
      overflow-y: auto; 
      padding: 24px; 
      position: relative; 
      border: 1px solid rgba(255,255,255,0.1); 
    }
    
    .progress-bar-container { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin: 10px 0; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: var(--accent-blue); transition: width 0.3s ease; }

    .stat-card { background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }

    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .score-badge { display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; border: 4px solid var(--accent-blue); font-weight: 700; font-size: 1.2rem; }

    .mini-progress { width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; margin-top: 8px; }
    .mini-fill { height: 100%; border-radius: 2px; }

    .scroll-custom::-webkit-scrollbar { width: 4px; }
    .scroll-custom::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    .scroll-custom::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 10px; }

    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
      margin-bottom: 24px;
    }

    .report-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    @media (max-width: 1100px) {
      .report-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 800px) {
      .report-grid { grid-template-columns: repeat(2, 1fr); }
      .admin-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 500px) {
      .report-grid { grid-template-columns: 1fr; }
      .form-meta { grid-template-columns: 1fr !important; }
      .stats-summary { grid-template-columns: 1fr 1fr !important; }
    }
  `}</style>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null); 
  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [notes, setNotes] = useState("");
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [reports, setReports] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmittedScore, setLastSubmittedScore] = useState({ yes: 0, total: 0 });
  const [pdfGenerating, setPdfGenerating] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [isStorePrefilled, setIsStorePrefilled] = useState(false);

  // Pagination State
  const [reportPage, setReportPage] = useState(1);
  const reportsPerPage = 12; // Increased since we show 4 in a row

  // QR Logic State
  const [qrStoreInput, setQrStoreInput] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  // Admin Actions State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("manager"); 
  const [newAdminAssignedStore, setNewAdminAssignedStore] = useState("");
  const [userActionState, setUserActionState] = useState({ loading: false, error: null, success: false });
  const [loginError, setLoginError] = useState(null);
  const [newQuestionText, setNewQuestionText] = useState("");

  /* ================= CALCULATIONS ================= */
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const currentYesCount = useMemo(() => Object.values(answers).filter(v => v === "Yes").length, [answers]);
  const isFormValid = useMemo(() => name.trim() !== "" && store.trim().length >= 7 && answeredCount === dynamicQuestions.length, [name, store, answeredCount, dynamicQuestions]);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (adminData?.role === "manager" && adminData?.assignedStore) {
        list = list.filter(r => r.store === adminData.assignedStore);
    }
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.store.toLowerCase().includes(lowSearch) || 
        r.name.toLowerCase().includes(lowSearch)
      );
    }
    return list;
  }, [reports, searchTerm, adminData]);

  const totalReportPages = Math.ceil(filteredReports.length / reportsPerPage);
  
  const paginatedReports = useMemo(() => {
    const startIndex = (reportPage - 1) * reportsPerPage;
    return filteredReports.slice(startIndex, startIndex + reportsPerPage);
  }, [filteredReports, reportPage]);

  const filteredAdmins = useMemo(() => {
    if (!adminSearchTerm) return allAdmins;
    const lowSearch = adminSearchTerm.toLowerCase();
    return allAdmins.filter(adm => 
        (adm.email?.toLowerCase().includes(lowSearch)) ||
        (adm.assignedStore?.toLowerCase().includes(lowSearch))
    );
  }, [allAdmins, adminSearchTerm]);

  const statistics = useMemo(() => {
    if (reports.length === 0) return null;

    const statsReports = adminData?.role === 'super' 
      ? reports 
      : reports.filter(r => r.store === adminData?.assignedStore);

    if (statsReports.length === 0) return null;

    const totalAudits = statsReports.length;
    const avgScore = Math.round(statsReports.reduce((acc, r) => acc + (r.yesCount / r.totalQuestions), 0) / totalAudits * 100);
    
    const taskFailures = {};
    const storeStats = {};

    statsReports.forEach(r => {
        if (!storeStats[r.store]) storeStats[r.store] = { count: 0, score: 0 };
        storeStats[r.store].count++;
        storeStats[r.store].score += (r.yesCount / r.totalQuestions);

        Object.entries(r.answers).forEach(([task, status]) => {
            if (status === "No") {
                taskFailures[task] = (taskFailures[task] || 0) + 1;
            }
        });
    });

    const topStoreEntry = Object.entries(storeStats).sort((a,b) => (b[1].score/b[1].count) - (a[1].score/a[1].count))[0];
    const frequentFailures = Object.entries(taskFailures).sort((a,b) => b[1] - a[1]).slice(0, 3);

    return {
        totalAudits,
        avgScore,
        topStore: topStoreEntry ? { id: topStoreEntry[0], score: Math.round((topStoreEntry[1].score/topStoreEntry[1].count)*100) } : null,
        frequentFailures
    };
  }, [reports, adminData]);

  /* ================= HELPERS ================= */
  const getPercentageColor = (p) => p >= 90 ? 'var(--success)' : p >= 70 ? 'var(--warning)' : 'var(--danger)';

  const formatDateTime = (timestamp) => {
    if (!timestamp?.toDate) return { date: 'Recently', time: '' };
    const dateObj = timestamp.toDate();
    return {
      date: dateObj.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeParam = params.get('store');
    if (storeParam) { setStore(storeParam); setIsStorePrefilled(true); }
    
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const adminDoc = await getDoc(doc(db, "admins", u.uid));
        if (adminDoc.exists()) setAdminData(adminDoc.data());
        setView("admin");
      } else {
        setUser(null); setAdminData(null);
        if (view !== "login") setView("form");
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsubQ = onSnapshot(collection(db, "checklist_questions"), snap => {
      setDynamicQuestions(snap.empty ? DEFAULT_QUESTIONS : snap.docs.map(d => d.data().text));
    });
    return () => unsubQ();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubR = onSnapshot(collection(db, "store_checklists"), snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    const unsubA = onSnapshot(collection(db, "admins"), snap => {
      setAllAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubR(); unsubA(); };
  }, [user]);

  const handleLogin = async () => {
    setLoginError(null);
    try { await signInWithEmailAndPassword(auth, adminEmail, adminPass); } 
    catch (err) { setLoginError("Invalid credentials."); }
  };

  const submitForm = async () => {
    if (!isFormValid) return;
    setSubmitStatus("submitting");
    try {
      await addDoc(collection(db, "store_checklists"), {
        name, store, answers, notes, yesCount: currentYesCount, totalQuestions: dynamicQuestions.length, createdAt: serverTimestamp(),
      });
      setLastSubmittedScore({ yes: currentYesCount, total: dynamicQuestions.length });
      setSubmitStatus("success");
      setShowSuccessModal(true);
      setName(""); setAnswers({}); setNotes("");
      if (!isStorePrefilled) setStore("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setSubmitStatus("error"); }
  };

  const createAdmin = async () => {
    if (!newAdminEmail || !newAdminPass) return;
    setUserActionState({ loading: true, error: null, success: false });
    try {
      const c = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPass);
      await setDoc(doc(db, "admins", c.user.uid), { 
        id: c.user.uid, email: newAdminEmail, role: newAdminRole,
        assignedStore: newAdminRole === 'manager' ? newAdminAssignedStore : null,
        createdAt: serverTimestamp()
      });
      setNewAdminEmail(""); setNewAdminPass(""); setNewAdminAssignedStore("");
      setUserActionState({ loading: false, error: null, success: true });
      setTimeout(() => setUserActionState(p => ({ ...p, success: false })), 3000);
    } catch (err) { setUserActionState({ loading: false, error: err.message, success: false }); }
  };

  const generateQR = () => {
    if (!qrStoreInput) return;
    const url = `${window.location.origin}${window.location.pathname}?store=${qrStoreInput}`;
    setQrLink(url);
    if (!window.QRCode) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => new window.QRCode(qrRef.current, { text: url, width: 160, height: 160 });
      document.head.appendChild(script);
    } else {
      qrRef.current.innerHTML = "";
      new window.QRCode(qrRef.current, { text: url, width: 160, height: 160 });
    }
  };

  const downloadPDF = async (report) => {
    if (pdfGenerating) return;
    setPdfGenerating(report.id);
    const loadScript = (src) => new Promise(res => {
      const s = document.createElement("script"); s.src = src; s.onload = res; document.head.appendChild(s);
    });
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(255, 159, 28); doc.text("CIRCLE K AUDIT", 105, 20, { align: "center" });
      doc.setFontSize(10); doc.setTextColor(40);
      doc.text(`STORE: #${report.store} | INSPECTOR: ${report.name} | SCORE: ${report.yesCount}/${report.totalQuestions}`, 15, 30);
      doc.autoTable({ startY: 35, head: [['Task', 'Status']], body: Object.entries(report.answers) });
      doc.save(`Audit_${report.store}.pdf`);
    } finally { setPdfGenerating(null); }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d1b2a'}}><Loader2 className="animate-spin" color="#4cc9f0" size={50} /></div>;

  return (
    <div className="app-container">
      <CustomStyles />
      <header className="header">
        <div className="brand"><span className="store">CIRCLE K</span> <span style={{opacity: 0.6}}>NIGHTSHIFT</span></div>
        <div className="nav-group">
          <button className={`nav-btn ${view === "form" ? "active" : ""}`} onClick={() => setView("form")}><ClipboardCheck size={18}/> Audit</button>
          {user ? (
            <>
              <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}><LayoutDashboard size={18}/> Dashboard</button>
              <button className="nav-btn danger" onClick={() => { signOut(auth); setView("form"); }}><LogOut size={18}/></button>
            </>
          ) : (
            <button className={`nav-btn ${view === "login" ? "active" : ""}`} onClick={() => setView("login")}><LogIn size={18}/> Login</button>
          )}
        </div>
      </header>

      {view === "login" && (
        <div className="card" style={{maxWidth: '400px', margin: '40px auto'}}>
          <h2 style={{marginTop: 0, textAlign: 'center'}}><ShieldCheck size={28} color="var(--accent-blue)"/> Admin Login</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <input placeholder="Email" className="input-field" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            <input placeholder="Password" type="password" className="input-field" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {loginError && <div style={{color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center'}}>{loginError}</div>}
            <button className="nav-btn primary" style={{justifyContent:'center', padding: '166x'}} onClick={handleLogin}>Sign In</button>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="card" style={{maxWidth: '700px', margin: '0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
            <h2 style={{margin:0}}>Store Audit</h2>
            <div className="score-badge" style={{borderColor: currentYesCount === dynamicQuestions.length ? 'var(--success)' : 'var(--accent-blue)'}}>
              {currentYesCount}/{dynamicQuestions.length}
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{width: `${(answeredCount/dynamicQuestions.length) * 100}%`}}></div>
          </div>

          <div className="form-meta" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', margin:'20px 0'}}>
            <input className="input-field" placeholder="Inspector Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-field" placeholder="7-digit Store #" value={store} onChange={e => setStore(e.target.value)} readOnly={isStorePrefilled} />
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {dynamicQuestions.map((q, i) => (
              <div key={i} className="stat-card">
                <p style={{margin: '0 0 12px 0', fontWeight: 600}}>{q}</p>
                <div className="opt-group">
                  {["Yes", "No", "N/A"].map(o => (
                    <button key={o} onClick={() => setAnswers({...answers, [q]: o})} className={`opt-btn ${answers[q] === o ? (o === 'Yes' ? 'active-yes' : o === 'No' ? 'active-no' : 'active-na') : ''}`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <textarea className="input-field" style={{marginTop:'20px', height:'100px'}} placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          <button className="nav-btn primary" style={{width: '100%', marginTop: '24px', padding: '18px', justifyContent: 'center'}} onClick={submitForm} disabled={!isFormValid || submitStatus === "submitting"}>
            {submitStatus === "submitting" ? <Loader2 className="animate-spin" /> : "Submit Audit"}
          </button>
        </div>
      )}

      {view === "admin" && user && (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px'}}>
             <div>
                <h2 style={{margin:0}}>{adminData?.role === 'super' ? 'Super Admin Panel' : `Manager Store #${adminData?.assignedStore}`}</h2>
                <p style={{margin:0, opacity:0.6, fontSize:'0.8rem'}}>{user.email}</p>
             </div>
             <div className="card" style={{margin:0, padding:'8px 16px', display:'flex', alignItems:'center', gap:'12px', flex:1, maxWidth:'400px'}}>
                <Search size={20} color="var(--text-secondary)"/>
                <input className="input-field" style={{background:'none', border:'none', padding:0}} placeholder="Search reports..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setReportPage(1);}} />
             </div>
          </div>

          {statistics && (
            <div className="stats-summary" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px'}}>
                <div className="stat-card">
                    <div style={{fontSize:'0.7rem', opacity:0.6, fontWeight:700}}>TOTAL AUDITS</div>
                    <div style={{fontSize:'1.5rem', fontWeight:800}}>{statistics.totalAudits}</div>
                </div>
                <div className="stat-card">
                    <div style={{fontSize:'0.7rem', opacity:0.6, fontWeight:700}}>AVG COMPLIANCE</div>
                    <div style={{fontSize:'1.5rem', fontWeight:800, color:getPercentageColor(statistics.avgScore)}}>{statistics.avgScore}%</div>
                </div>
                <div className="stat-card" style={{gridColumn: 'span 2', display:'flex', flexDirection:'column', gap:'6px'}}>
                    <div style={{fontSize:'0.7rem', color:'var(--danger)', fontWeight:700, display:'flex', alignItems:'center', gap:'4px'}}>
                        <AlertTriangle size={12}/> CRITICAL FAILURES
                    </div>
                    {statistics.frequentFailures.length > 0 ? statistics.frequentFailures.map(([task, count], i) => (
                        <div key={i} style={{fontSize:'0.65rem', display:'flex', justifyContent:'space-between', background:'rgba(255,77,79,0.1)', padding:'3px 8px', borderRadius:'4px'}}>
                            <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1}}>{task}</span>
                            <span style={{fontWeight:800, color:'var(--danger)', marginLeft:'10px'}}>{count} Fails</span>
                        </div>
                    )) : <span style={{fontSize:'0.7rem', opacity:0.4}}>No failures detected</span>}
                </div>
            </div>
          )}

          {adminData?.role === "super" && (
            <div className="admin-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
              <div className="card" style={{margin:0}}>
                <h3 style={{marginTop:0}}><ListChecks size={20}/> Task Editor</h3>
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <input className="input-field" placeholder="New Task..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} />
                  <button className="nav-btn primary" onClick={async () => {
                      if(!newQuestionText) return;
                      await addDoc(collection(db, "checklist_questions"), { text: newQuestionText });
                      setNewQuestionText("");
                  }}><Plus/></button>
                </div>
                <div className="scroll-custom" style={{maxHeight:'200px', overflowY:'auto'}}>
                  {dynamicQuestions.map((q, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #ffffff08', fontSize:'0.85rem'}}>
                      <span style={{flex:1}}>{q}</span>
                      <button style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}} onClick={async () => {
                         const snap = await getDocs(query(collection(db, "checklist_questions"), where("text", "==", q)));
                         snap.forEach(d => deleteDoc(doc(db, "checklist_questions", d.id)));
                      }}><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{margin:0}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <h3 style={{margin:0}}><Users size={20}/> Users</h3>
                    <input className="input-field" style={{width:'120px', fontSize:'0.7rem', padding:'6px'}} placeholder="Search user..." value={adminSearchTerm} onChange={e => setAdminSearchTerm(e.target.value)} />
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'8px', marginBottom:'10px'}}>
                    <input className="input-field" style={{fontSize:'0.75rem'}} placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                    <input className="input-field" style={{fontSize:'0.75rem'}} placeholder="Store #" value={newAdminAssignedStore} onChange={e => setNewAdminAssignedStore(e.target.value)} />
                    <button className="nav-btn primary" onClick={createAdmin}><UserPlus size={16}/></button>
                </div>
                <div className="scroll-custom" style={{maxHeight:'150px', overflowY:'auto'}}>
                   {filteredAdmins.map(adm => (
                     <div key={adm.id} style={{padding:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #ffffff08', fontSize:'0.8rem'}}>
                        <div>
                            <div style={{fontWeight:600}}>{adm.email}</div>
                            <div style={{fontSize:'0.6rem', color:'var(--accent-blue)'}}>#{adm.assignedStore || 'Super'}</div>
                        </div>
                        {adm.id !== user.uid && <button onClick={async () => await deleteDoc(doc(db, "admins", adm.id))} style={{background:'none', border:'none', color:'var(--danger)'}}><UserMinus size={14}/></button>}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {adminData?.role === "super" && (
            <div className="card" style={{margin:0}}>
                <h3 style={{marginTop:0}}><QrCode size={20}/> Store QR Generator</h3>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <input className="input-field" placeholder="Store Number" value={qrStoreInput} onChange={e => setQrStoreInput(e.target.value)} />
                    <button className="nav-btn primary" onClick={generateQR}>Generate</button>
                    <div ref={qrRef} style={{background:'white', padding:'8px', borderRadius:'8px'}}></div>
                </div>
            </div>
          )}

          <div className="report-grid">
            {paginatedReports.map(r => (
              <div key={r.id} className="stat-card" style={{padding: '12px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                  <span style={{fontWeight:700, color:'var(--accent-orange)', fontSize: '0.85rem'}}>Store #{r.store}</span>
                  <div style={{display:'flex', gap:'4px'}}>
                    <button className="nav-btn" style={{padding: '4px'}} onClick={() => setSelectedReport(r)}><Eye size={12}/></button>
                    <button className="nav-btn primary" style={{padding: '4px'}} onClick={() => downloadPDF(r)}><Download size={12}/></button>
                    {adminData?.role === 'super' && <button className="nav-btn danger" style={{padding: '4px'}} onClick={() => setDeleteId(r.id)}><Trash2 size={12}/></button>}
                  </div>
                </div>
                <div style={{fontWeight:600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={r.name}>{r.name}</div>
                <div style={{fontSize:'0.7rem', opacity:0.6}}>{formatDateTime(r.createdAt).date}</div>
                <div style={{marginTop:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div style={{fontSize:'1rem', fontWeight:800, color:getPercentageColor((r.yesCount/r.totalQuestions)*100)}}>{r.yesCount}/{r.totalQuestions}</div>
                   <div className="mini-progress" style={{width:'40px', margin:0}}><div className="mini-fill" style={{width:`${(r.yesCount/r.totalQuestions)*100}%`, background:getPercentageColor((r.yesCount/r.totalQuestions)*100)}}></div></div>
                </div>
              </div>
            ))}
          </div>

          {totalReportPages > 1 && (
            <div className="pagination-bar">
              <button className="nav-btn" onClick={() => setReportPage(p => Math.max(1, p - 1))} disabled={reportPage === 1}>
                <ChevronLeft size={18}/>
              </button>
              <span style={{fontWeight: 700, color: 'var(--text-secondary)'}}>
                Page {reportPage} of {totalReportPages}
              </span>
              <button className="nav-btn" onClick={() => setReportPage(p => Math.min(totalReportPages, p + 1))} disabled={reportPage === totalReportPages}>
                <ChevronRight size={18}/>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom: '20px'}}>
              <div>
                <h2 style={{margin:0, color:'var(--accent-orange)'}}>Store #{selectedReport.store} Audit</h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                  <User size={14}/> {selectedReport.name}
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer'}}><X size={24}/></button>
            </div>

            <div style={{background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Calendar size={14}/> {formatDateTime(selectedReport.createdAt).date}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Clock size={14}/> {formatDateTime(selectedReport.createdAt).time}</div>
            </div>

            <div className="scroll-custom" style={{maxHeight:'400px', overflowY:'auto', paddingRight: '10px'}}>
                {Object.entries(selectedReport.answers).map(([q, a], i) => (
                    <div key={i} style={{padding:'12px', background:'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius:'10px', marginBottom:'8px', fontSize:'0.85rem', display:'flex', justifyContent:'space-between', alignItems: 'center', gap: '15px'}}>
                        <span style={{lineHeight: 1.4}}>{q}</span>
                        <span style={{
                          fontWeight:800, 
                          padding: '4px 10px', 
                          borderRadius: '6px',
                          background: a === 'Yes' ? 'rgba(0, 255, 156, 0.1)' : a === 'No' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 209, 102, 0.1)',
                          color: a === 'Yes' ? 'var(--success)' : a === 'No' ? 'var(--danger)' : 'var(--warning)'
                        }}>{a}</span>
                    </div>
                ))}
            </div>

            {selectedReport.notes && (
               <div style={{marginTop: '20px'}}>
                  <h4 style={{margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.6}}>Notes</h4>
                  <div style={{padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '4px solid var(--accent-blue)'}}>
                    {selectedReport.notes}
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{textAlign:'center'}}>
            <CheckCircle2 size={60} color="var(--success)" style={{margin:'0 auto 20px'}} />
            <h2>Submitted!</h2>
            <p>Score: {lastSubmittedScore.yes} / {lastSubmittedScore.total}</p>
            <button className="nav-btn primary" style={{width:'100%'}} onClick={() => setShowSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Audit?</h3>
            <p>This cannot be undone.</p>
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="nav-btn" onClick={() => setDeleteId(null)} style={{flex:1}}>Cancel</button>
                <button className="nav-btn danger" onClick={async () => { await deleteDoc(doc(db, "store_checklists", deleteId)); setDeleteId(null); }} style={{flex:1}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}