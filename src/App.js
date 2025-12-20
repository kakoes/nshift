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
  Store
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
    .app-container { max-width: 1200px; margin: 0 auto; padding: 12px; min-height: 100vh; }
    
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
    .input-field.highlight { border-color: var(--accent-orange); box-shadow: 0 0 10px rgba(255, 159, 28, 0.2); }
    .input-field.error { border-color: var(--danger); }
    
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
      animation: modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes modalAppear {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .progress-bar-container {
        width: 100%;
        height: 8px;
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        margin: 10px 0;
        overflow: hidden;
    }
    .progress-bar-fill {
        height: 100%;
        background: var(--accent-blue);
        transition: width 0.3s ease;
    }

    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .score-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 4px solid var(--accent-blue);
      font-weight: 700;
      font-size: 1.2rem;
    }

    .mini-progress {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.05);
      border-radius: 2px;
      margin-top: 8px;
    }

    .mini-fill {
      height: 100%;
      border-radius: 2px;
    }

    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      padding: 20px 0;
    }

    .qr-container-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: white;
      padding: 16px;
      border-radius: 16px;
      min-width: 160px;
    }

    .qr-canvas-container img {
      display: block;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .admin-grid { grid-template-columns: 1fr !important; }
      .form-meta { grid-template-columns: 1fr !important; }
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
  const [isStorePrefilled, setIsStorePrefilled] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
  const [newQuestionText, setNewQuestionText] = useState("");
  const [userActionState, setUserActionState] = useState({ loading: false, error: null, success: false });
  const [loginError, setLoginError] = useState(null);

  /* ================= VALIDATION LOGIC ================= */
  const isStoreValid = useMemo(() => {
    // Requirements: At least 7 characters
    return store.trim().length >= 7;
  }, [store]);

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const currentYesCount = useMemo(() => {
    return Object.values(answers).filter(v => v === "Yes").length;
  }, [answers]);

  const isFormValid = useMemo(() => {
    return name.trim() !== "" && 
           isStoreValid && 
           answeredCount === dynamicQuestions.length;
  }, [name, isStoreValid, answeredCount, dynamicQuestions]);

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

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const getPercentageColor = (percent) => {
    if (percent >= 90) return 'var(--success)';
    if (percent >= 70) return 'var(--warning)';
    return 'var(--danger)';
  };

  /* ================= QR CODE ENGINE ================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeParam = params.get('store');
    if (storeParam) {
      setStore(storeParam);
      setIsStorePrefilled(true);
    }
  }, []);

  const generateQR = async () => {
    if (!qrStoreInput) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const finalUrl = `${baseUrl}?store=${qrStoreInput}`;
    setQrLink(finalUrl);

    if (!window.QRCode) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => createQRImage(finalUrl);
      document.head.appendChild(script);
    } else {
      createQRImage(finalUrl);
    }
  };

  const createQRImage = (url) => {
    if (qrRef.current) qrRef.current.innerHTML = "";
    new window.QRCode(qrRef.current, {
      text: url,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.H
    });
  };

  const copyQrLink = () => {
    const el = document.createElement('textarea');
    el.value = qrLink;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const img = qrRef.current?.querySelector('img');
    if (img) {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = `Store_${qrStoreInput}_QR.png`;
      link.click();
    }
  };

  /* ================= PDF ENGINE ================= */
  const downloadPDF = async (report) => {
    if (pdfGenerating) return;
    setPdfGenerating(report.id);

    const loadScript = (src) => new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const dateStr = report.createdAt?.toDate 
        ? report.createdAt.toDate().toLocaleString() 
        : new Date().toLocaleString();

      doc.setFillColor(27, 38, 59);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 159, 28);
      doc.setFontSize(24);
      doc.text("CIRCLE K", 105, 20, { align: "center" });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("NIGHTSHIFT MANAGEMENT REPORT", 105, 30, { align: "center" });

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(`STORE: #${report.store}`, 15, 50);
      doc.text(`INSPECTOR: ${report.name.toUpperCase()}`, 15, 55);
      doc.text(`DATE: ${dateStr}`, 15, 60);
      
      const scoreColor = (report.yesCount / report.totalQuestions) > 0.8 ? [0, 150, 0] : [200, 0, 0];
      doc.setTextColor(...scoreColor);
      doc.setFontSize(12);
      doc.text(`SCORE: ${report.yesCount} / ${report.totalQuestions} TASKS COMPLETED`, 15, 70);

      const tableData = Object.entries(report.answers).map(([q, a]) => [q, a || "N/A"]);
      
      doc.autoTable({
        startY: 75,
        head: [['Task Description', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [27, 38, 59], textColor: [255, 255, 255], fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 30, halign: 'center' } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            const val = data.cell.raw;
            if (val === 'Yes') data.cell.styles.textColor = [0, 128, 0];
            if (val === 'No') data.cell.styles.textColor = [200, 0, 0];
          }
        }
      });

      if (report.notes) {
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "bold");
        doc.text("SHIFT SUMMARY / NOTES:", 15, finalY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(report.notes, 15, finalY + 7, { maxWidth: 180 });
      }

      doc.save(`CK_Report_${report.store}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Download Failed:", err);
    } finally {
      setPdfGenerating(null);
    }
  };

  /* ================= FIREBASE LOGIC ================= */
  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const adminDoc = await getDoc(doc(db, "admins", u.uid));
        if (adminDoc.exists()) setAdminData(adminDoc.data());
        setView("admin");
      } else {
        setUser(null);
        setAdminData(null);
        if (view !== "login") setView("form");
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "checklist_questions"), snap => {
      const qList = snap.empty ? DEFAULT_QUESTIONS : snap.docs.map(d => d.data().text);
      setDynamicQuestions(qList);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubReports = onSnapshot(collection(db, "store_checklists"), snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    const unsubAdmins = onSnapshot(collection(db, "admins"), snap => {
      setAllAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubReports(); unsubAdmins(); };
  }, [user]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
    } catch (err) {
      setLoginError("Invalid email or password.");
    }
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

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSubmitStatus("idle");
  };

  const addQuestion = async () => {
    if (!newQuestionText) return;
    await addDoc(collection(db, "checklist_questions"), { text: newQuestionText, createdAt: serverTimestamp() });
    setNewQuestionText("");
  };

  const createAdmin = async () => {
    if (!newAdminEmail || !newAdminPass) return;
    setUserActionState({ loading: true, error: null, success: false });
    try {
      const c = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPass);
      await setDoc(doc(db, "admins", c.user.uid), { 
        id: c.user.uid, 
        email: newAdminEmail, 
        role: newAdminRole,
        assignedStore: newAdminRole === 'manager' ? newAdminAssignedStore : null,
        createdAt: serverTimestamp()
      });
      setNewAdminEmail(""); setNewAdminPass(""); setNewAdminAssignedStore("");
      setUserActionState({ loading: false, error: null, success: true });
      setTimeout(() => setUserActionState(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      let message = "Failed to create user.";
      if (err.code === 'auth/email-already-in-use') message = "This email is already registered.";
      setUserActionState({ loading: false, error: message, success: false });
    }
  };

  const removeAdmin = async (adminId) => {
    if (adminId === user.uid) return;
    try { await deleteDoc(doc(db, "admins", adminId)); } catch (e) { console.error(e); }
  };

  const confirmDeleteReport = async () => {
    if (deleteId) {
      await deleteDoc(doc(db, "store_checklists", deleteId));
      setDeleteId(null);
    }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d1b2a'}}><Loader2 className="animate-spin" color="#4cc9f0" size={50} /></div>;

  return (
    <div className="app-container">
      <CustomStyles />
      <header className="header">
        <div className="brand"><span className="store">NIGHT SHIFT</span> <span style={{opacity: 0.6}}>CHECKLIST</span></div>
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

      {(view === "login" && !user) && (
        <div className="card" style={{maxWidth: '400px', margin: '40px auto'}}>
          <h2 style={{marginTop: 0, textAlign: 'center'}}><ShieldCheck size={28} color="var(--accent-blue)"/> Admin Access</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <input placeholder="Email" className="input-field" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            <input placeholder="Password" type="password" className="input-field" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {loginError && <div style={{color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center'}}>{loginError}</div>}
            <button className="nav-btn primary" style={{justifyContent:'center', padding: '16px'}} onClick={handleLogin}>Sign In</button>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="card" style={{maxWidth: '700px', margin: '0 auto', padding: '16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
            <div style={{flex: 1}}>
              <h2 style={{margin:0}}>Store Audit</h2>
              <p style={{margin:0, opacity:0.6, fontSize:'0.85rem'}}>Please answer all questions below.</p>
            </div>
            <div className="score-badge" style={{borderColor: currentYesCount === dynamicQuestions.length ? 'var(--success)' : 'var(--accent-blue)'}}>
              {currentYesCount}/{dynamicQuestions.length}
            </div>
          </div>

          <div style={{marginBottom: '20px'}}>
             <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', fontWeight:700, marginBottom:'4px', color:'var(--accent-blue)'}}>
                 <span>COMPLETION PROGRESS</span>
                 <span>{answeredCount} / {dynamicQuestions.length}</span>
             </div>
             <div className="progress-bar-container">
                 <div className="progress-bar-fill" style={{width: `${(answeredCount/dynamicQuestions.length) * 100}%`}}></div>
             </div>
          </div>

          <div className="form-meta" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
            <div>
              <label style={{fontSize:'0.75rem', color:'var(--accent-orange)', fontWeight:700, marginLeft:'8px'}}>INSPECTOR NAME *</label>
              <input className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{fontSize:'0.75rem', color:'var(--accent-orange)', fontWeight:700, marginLeft:'8px', display:'flex', justifyContent:'space-between'}}>
                <span>STORE NUMBER *</span>
                {!isStoreValid && store.length > 0 && <span style={{color:'var(--danger)', fontSize:'0.65rem'}}>Min 7 digits</span>}
              </label>
              <input 
                className={`input-field ${isStorePrefilled ? 'highlight' : ''} ${(!isStoreValid && store.length > 0) ? 'error' : ''}`} 
                placeholder="7-digit Store #" 
                value={store} 
                onChange={e => setStore(e.target.value)} 
                readOnly={isStorePrefilled}
              />
            </div>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {dynamicQuestions.map((q, i) => (
              <div key={i} style={{background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: answers[q] ? '1px solid rgba(0, 255, 156, 0.2)' : '1px solid rgba(255,255,255,0.05)'}}>
                <p style={{margin: '0 0 12px 0', fontSize: '1rem', lineHeight: '1.4', fontWeight: 600}}>{q}</p>
                <div className="opt-group">
                  {["Yes", "No", "N/A"].map(o => (
                    <button 
                      key={o} 
                      onClick={() => setAnswers({...answers, [q]: o})} 
                      className={`opt-btn ${answers[q] === o ? (o === 'Yes' ? 'active-yes' : o === 'No' ? 'active-no' : 'active-na') : ''}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:'24px'}}>
            <label style={{fontSize:'0.75rem', color:'var(--accent-orange)', fontWeight:700, marginLeft:'8px', display:'flex', alignItems:'center', gap:'4px'}}><MessageSquare size={14}/> SHIFT SUMMARY / NOTES</label>
            <textarea 
              className="input-field" 
              placeholder="Record any issues, maintenance needs, or special comments here..." 
              rows={4} 
              style={{resize: 'none', height: '100px'}}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button 
            className="nav-btn primary" 
            style={{width: '100%', marginTop: '24px', padding: '18px', justifyContent: 'center', fontSize: '1.1rem'}} 
            onClick={submitForm} 
            disabled={!isFormValid || submitStatus === "submitting"}
          >
            {submitStatus === "submitting" ? <Loader2 className="animate-spin" /> : 
             !isFormValid ? (
                !isStoreValid && store.length > 0 ? "Store Number must be 7+ digits" :
                name.trim() === "" ? "Enter Inspector Name" :
                answeredCount < dynamicQuestions.length ? `Answer ${dynamicQuestions.length - answeredCount} more questions` :
                "Complete & Submit"
             ) : 'Complete & Submit'}
          </button>
        </div>
      )}

      {view === "admin" && user && (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px'}}>
             <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <div className="score-badge" style={{width: '40px', height: '40px', fontSize: '1rem', background: 'var(--accent-orange)', color: 'white', border: 'none'}}>
                    <ShieldCheck size={20}/>
                </div>
                <div>
                    <h2 style={{margin:0}}>{adminData?.role === 'super' ? 'Super Admin' : `Store Manager (#${adminData?.assignedStore})`}</h2>
                    <p style={{margin:0, opacity:0.6, fontSize:'0.8rem'}}>{user.email}</p>
                </div>
             </div>
             <div className="card" style={{margin:0, padding:'8px 16px', display:'flex', alignItems:'center', gap:'12px', flex:1, minWidth:'300px'}}>
                <Search size={20} color="var(--text-secondary)"/>
                <input 
                className="input-field" 
                style={{background:'none', border:'none', padding:0}} 
                placeholder="Filter by Store or Inspector..." 
                value={searchTerm}
                onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
                />
            </div>
          </div>

          {adminData?.role === "super" && (
            <>
            <div className="admin-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px'}}>
              <div className="card" style={{margin: 0}}>
                <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'8px'}}><ListChecks size={20}/> Task Editor</h3>
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <input className="input-field" placeholder="Add Task..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} />
                  <button className="nav-btn primary" onClick={addQuestion}><Plus/></button>
                </div>
                <div style={{maxHeight:'250px', overflowY:'auto', background:'rgba(0,0,0,0.2)', borderRadius:'12px'}}>
                  {dynamicQuestions.map((q, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'12px', borderBottom:'1px solid #ffffff11', fontSize:'0.9rem', alignItems:'center'}}>
                      <span style={{lineHeight: 1.2, flex:1}}>{q}</span>
                      <button style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer', padding:'5px'}} onClick={async () => {
                         const snap = await getDocs(query(collection(db, "checklist_questions"), where("text", "==", q)));
                         snap.forEach(d => deleteDoc(doc(db, "checklist_questions", d.id)));
                      }}><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{margin:0, display:'flex', flexDirection:'column'}}>
                <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'8px'}}><UserPlus size={20}/> User Management</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'15px'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                    <input className="input-field" placeholder="Email Address" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                    <input className="input-field" type="password" placeholder="Password" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} />
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
                    <select className="input-field" value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)}>
                        <option value="manager">Store Manager</option>
                        <option value="super">Super Admin</option>
                    </select>
                    <input 
                        className="input-field" 
                        placeholder="Assign Store #" 
                        disabled={newAdminRole === 'super'} 
                        value={newAdminAssignedStore} 
                        onChange={e => setNewAdminAssignedStore(e.target.value)} 
                    />
                    <button className="nav-btn primary" style={{justifyContent:'center'}} disabled={userActionState.loading} onClick={createAdmin}>
                        {userActionState.loading ? <Loader2 className="animate-spin" size={16}/> : 'Create User'}
                    </button>
                  </div>
                  {userActionState.error && <div style={{color:'var(--danger)', fontSize:'0.75rem'}}>{userActionState.error}</div>}
                  {userActionState.success && <div style={{color:'var(--success)', fontSize:'0.75rem'}}>User created successfully!</div>}
                </div>
                <div style={{maxHeight:'150px', overflowY:'auto', background:'rgba(0,0,0,0.2)', borderRadius:'12px'}}>
                   {allAdmins.map(adm => (
                     <div key={adm.id} style={{padding:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #ffffff08', fontSize:'0.85rem'}}>
                        <div style={{display:'flex', flexDirection:'column'}}>
                          <span style={{fontWeight:600}}>{adm.email}</span>
                          <span style={{fontSize:'0.65rem', color: adm.role === 'super' ? 'var(--accent-orange)' : 'var(--accent-blue)'}}>
                            {adm.role === 'super' ? 'SUPER ADMIN' : `STORE MANAGER (#${adm.assignedStore || '?'})`}
                          </span>
                        </div>
                        {adm.id !== user.uid && <button onClick={() => removeAdmin(adm.id)} style={{background:'rgba(255,77,79,0.1)', border:'none', color:'var(--danger)', padding:'6px', borderRadius:'8px', cursor:'pointer'}}><UserMinus size={16}/></button>}
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="card" style={{margin:0}}>
               <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'8px'}}><QrCode size={20}/> Store QR Generator</h3>
               <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'20px', alignItems:'start'}}>
                  <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    <input className="input-field" placeholder="Enter Store Number (e.g. 1042781)" value={qrStoreInput} onChange={e => setQrStoreInput(e.target.value)} />
                    <button className="nav-btn primary" style={{justifyContent:'center', padding:'14px'}} onClick={generateQR}>Generate QR Code</button>
                    {qrLink && (
                      <div style={{background:'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'12px', marginTop:'10px', display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{fontSize:'0.75rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, opacity:0.8}}>{qrLink}</div>
                        <button onClick={copyQrLink} style={{background:'none', border:'none', color:'var(--accent-blue)', cursor:'pointer', padding:'5px'}}>{copied ? <Check size={18}/> : <Copy size={18}/>}</button>
                      </div>
                    )}
                  </div>
                  {qrLink && (
                    <div className="qr-container-wrapper">
                      <div className="qr-canvas-container" ref={qrRef}></div>
                      <button className="nav-btn" style={{fontSize:'0.75rem', width:'100%', justifyContent:'center', padding:'8px', color:'#333'}} onClick={downloadQR}>
                        <Download size={14}/> Save Image
                      </button>
                    </div>
                  )}
               </div>
            </div>
            </>
          )}

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px'}}>
            {paginatedReports.map(r => {
              const yesPercent = Math.round((r.yesCount / r.totalQuestions) * 100);
              return (
                <div key={r.id} className="card" style={{margin:0, padding:'18px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                    <span style={{fontSize:'1.2rem', fontWeight:700, color:'var(--accent-orange)'}}>Store #{r.store}</span>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button className="nav-btn" onClick={() => setSelectedReport(r)}><Eye size={16}/></button>
                      <button className="nav-btn primary" onClick={() => downloadPDF(r)} disabled={pdfGenerating === r.id}>
                        {pdfGenerating === r.id ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                      </button>
                      {adminData?.role === 'super' && <button className="nav-btn danger" onClick={() => setDeleteId(r.id)}><Trash2 size={16}/></button>}
                    </div>
                  </div>
                  <div style={{fontSize:'1rem', fontWeight:600}}>{r.name}</div>
                  <div style={{marginTop:'12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.85rem'}}>
                      <span style={{color:'var(--text-secondary)'}}>Compliance Score</span>
                      <span style={{fontWeight:700, color: getPercentageColor(yesPercent)}}>{yesPercent}%</span>
                    </div>
                    <div className="mini-progress">
                      <div className="mini-fill" style={{width: `${yesPercent}%`, background: getPercentageColor(yesPercent)}}></div>
                    </div>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px'}}>
                    <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'4px'}}>
                      <Clock size={14}/> {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </div>
                    <div style={{color:'var(--accent-blue)', fontWeight:700, fontSize:'1.1rem'}}>{r.yesCount} / {r.totalQuestions}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                <ChevronLeft size={18}/>
              </button>
              <span style={{fontWeight: 700, fontSize: '0.9rem'}}>Page {currentPage} of {totalPages}</span>
              <button className="nav-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {filteredReports.length === 0 && (
            <div style={{textAlign:'center', padding:'40px', opacity:0.5}}>No reports found for your assigned store.</div>
          )}
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{textAlign:'center', padding:'40px 20px'}}>
            <div style={{marginBottom:'20px'}}><CheckCircle2 size={80} color="var(--success)" /></div>
            <h1 style={{margin:'0 0 10px 0', fontSize:'2rem'}}>Audit Complete!</h1>
            <p style={{opacity:0.8, fontSize:'1.1rem', margin:'0 0 24px 0'}}>The report has been successfully submitted.</p>
            <div style={{background:'rgba(0,255,156,0.1)', border:'1px solid rgba(0,255,156,0.2)', borderRadius:'20px', padding:'20px', marginBottom:'30px'}}>
                <div style={{fontSize:'0.8rem', fontWeight:700, color:'var(--success)', letterSpacing:'1px', marginBottom:'5px'}}>FINAL SCORE</div>
                <div style={{fontSize:'3rem', fontWeight:800, color:'var(--success)'}}>{lastSubmittedScore.yes} / {lastSubmittedScore.total}</div>
                <div style={{fontSize:'0.9rem', opacity:0.7}}>{Math.round((lastSubmittedScore.yes/lastSubmittedScore.total)*100)}% Compliance</div>
            </div>
            <button className="nav-btn primary" style={{width:'100%', padding:'18px', justifyContent:'center', fontSize:'1.1rem'}} onClick={closeSuccessModal}>Return to Form</button>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{textAlign:'center'}}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this report?</p>
            <div style={{display:'flex', gap:'12px', marginTop:'24px'}}>
              <button className="nav-btn" style={{flex:1, justifyContent:'center'}} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="nav-btn danger" style={{flex:1, justifyContent:'center'}} onClick={confirmDeleteReport}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <div>
                <h2 style={{margin:0, color:'var(--accent-orange)'}}>Store #{selectedReport.store}</h2>
                <div style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>{selectedReport.createdAt?.toDate ? selectedReport.createdAt.toDate().toLocaleString() : 'Recent'}</div>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{background:'none', border:'none', color:'white'}}><X/></button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px', maxHeight:'400px', overflowY:'auto'}}>
              {Object.entries(selectedReport.answers).map(([q, a], i) => (
                <div key={i} style={{padding:'12px', background:'rgba(0,0,0,0.25)', borderRadius:'14px', fontSize:'0.9rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{flex:1, marginRight:'15px'}}>{q}</span>
                  <span style={{fontWeight:800, color: a === 'Yes' ? 'var(--success)' : a === 'No' ? 'var(--danger)' : 'var(--warning)'}}>{a}</span>
                </div>
              ))}
              {selectedReport.notes && (
                <div style={{marginTop:'15px', padding:'15px', borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                  <div style={{fontSize:'0.75rem', color:'var(--accent-orange)', fontWeight:700, marginBottom:'8px'}}>SHIFT SUMMARY</div>
                  <div style={{fontSize:'0.9rem', lineHeight:1.5, background:'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'8px'}}>{selectedReport.notes}</div>
                </div>
              )}
            </div>
            <button className="nav-btn primary" style={{width:'100%', marginTop:'24px', padding:'18px', justifyContent:'center'}} onClick={() => downloadPDF(selectedReport)}>
              {pdfGenerating === selectedReport.id ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18}/>} Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}