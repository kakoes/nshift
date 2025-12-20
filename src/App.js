import React, { useEffect, useState, useMemo } from "react";
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
  Trophy
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

    .success-icon-bounce {
      animation: bounce 0.6s infinite alternate;
    }
    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-10px); }
    }

    @media (max-width: 600px) {
      .admin-grid { grid-template-columns: 1fr !important; }
      .form-meta { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
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

  // Admin Actions State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("viewer");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [userActionState, setUserActionState] = useState({ loading: false, error: null, success: false });
  const [loginError, setLoginError] = useState(null);

  /* ================= CALCULATIONS ================= */
  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const currentYesCount = useMemo(() => {
    return Object.values(answers).filter(v => v === "Yes").length;
  }, [answers]);

  const isFormValid = useMemo(() => {
    return name.trim() !== "" && 
           store.trim() !== "" && 
           answeredCount === dynamicQuestions.length;
  }, [name, store, answeredCount, dynamicQuestions]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    const lowSearch = searchTerm.toLowerCase();
    return reports.filter(r => 
      r.store.toLowerCase().includes(lowSearch) || 
      r.name.toLowerCase().includes(lowSearch)
    );
  }, [reports, searchTerm]);

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
        if (adminDoc.exists()) setAdminRole(adminDoc.data().role);
        setView("admin");
      } else {
        setUser(null);
        setAdminRole(null);
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
      
      // Reset form
      setName(""); setStore(""); setAnswers({}); setNotes("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { 
      setSubmitStatus("error"); 
    }
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
        createdAt: serverTimestamp()
      });
      setNewAdminEmail(""); setNewAdminPass("");
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
    try {
      await deleteDoc(doc(db, "admins", adminId));
    } catch (e) { console.error(e); }
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
        <div className="brand"><span className="store">CIRCLE K</span> <span style={{opacity: 0.6}}>CHECKLIST</span></div>
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
            <button className="nav-btn primary" style={{padding:'16px', justifyContent:'center'}} onClick={handleLogin}>Sign In</button>
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
              <label style={{fontSize:'0.75rem', color:'var(--accent-orange)', fontWeight:700, marginLeft:'8px'}}>STORE NUMBER *</label>
              <input className="input-field" placeholder="e.g. 1234" value={store} onChange={e => setStore(e.target.value)} />
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
             !isFormValid ? `Finish answering to Submit` : 'Complete & Submit'}
          </button>
          
          {!isFormValid && answeredCount < dynamicQuestions.length && (
              <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--danger)', fontSize:'0.85rem', marginTop:'12px', justifyContent:'center'}}>
                  <AlertCircle size={14}/> {dynamicQuestions.length - answeredCount} questions remaining
              </div>
          )}
        </div>
      )}

      {view === "admin" && user && (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          <div className="card" style={{margin:0, padding:'16px', display:'flex', alignItems:'center', gap:'12px'}}>
            <Search size={20} color="var(--text-secondary)"/>
            <input 
              className="input-field" 
              style={{background:'none', border:'none', padding:0}} 
              placeholder="Filter by Store or Inspector..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {adminRole === "super" && (
            <div className="admin-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div className="card" style={{margin: 0}}>
                <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'8px'}}><ListChecks size={20}/> Task Editor</h3>
                <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                  <input className="input-field" placeholder="Add Task..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} />
                  <button className="nav-btn primary" onClick={addQuestion}><Plus/></button>
                </div>
                <div style={{maxHeight:'250px', overflowY:'auto', background:'rgba(0,0,0,0.2)', borderRadius:'12px'}}>
                  {dynamicQuestions.map((q, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'12px', borderBottom:'1px solid #ffffff11', fontSize:'0.9rem', alignItems:'center'}}>
                      <span style={{lineHeight: 1.2}}>{q}</span>
                      <button style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}} onClick={async () => {
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
                  <div style={{display:'flex', gap:'8px'}}>
                    <input className="input-field" placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                    <input className="input-field" type="password" placeholder="Pass" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} />
                  </div>
                  <button className="nav-btn primary" style={{justifyContent:'center'}} disabled={userActionState.loading} onClick={createAdmin}>
                    {userActionState.loading ? <Loader2 className="animate-spin" size={16}/> : 'Create User'}
                  </button>
                  {userActionState.error && <div style={{color:'var(--danger)', fontSize:'0.8rem'}}>{userActionState.error}</div>}
                  {userActionState.success && <div style={{color:'var(--success)', fontSize:'0.8rem'}}>✓ User created successfully</div>}
                </div>
                <div style={{maxHeight:'150px', overflowY:'auto', background:'rgba(0,0,0,0.2)', borderRadius:'12px'}}>
                   {allAdmins.map(adm => (
                     <div key={adm.id} style={{padding:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #ffffff08', fontSize:'0.85rem'}}>
                        <div style={{display:'flex', flexDirection:'column'}}>
                          <span style={{fontWeight:600}}>{adm.email}</span>
                          <span style={{fontSize:'0.65rem', color:'var(--accent-blue)'}}>{adm.role?.toUpperCase()}</span>
                        </div>
                        {adm.id !== user.uid && <button onClick={() => removeAdmin(adm.id)} style={{background:'rgba(255,77,79,0.1)', border:'none', color:'var(--danger)', padding:'6px', borderRadius:'8px', cursor:'pointer'}}><UserMinus size={16}/></button>}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px'}}>
            {filteredReports.map(r => (
              <div key={r.id} className="card" style={{margin:0, padding:'18px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                  <span style={{fontSize:'1.2rem', fontWeight:700, color:'var(--accent-orange)'}}>Store #{r.store}</span>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button className="nav-btn" onClick={() => setSelectedReport(r)}><Eye size={16}/></button>
                    <button className="nav-btn primary" onClick={() => downloadPDF(r)} disabled={pdfGenerating === r.id}>
                      {pdfGenerating === r.id ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                    </button>
                    {adminRole === 'super' && <button className="nav-btn danger" onClick={() => setDeleteId(r.id)}><Trash2 size={16}/></button>}
                  </div>
                </div>
                <div style={{fontSize:'1rem', fontWeight:600}}>{r.name}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px'}}>
                  <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'4px'}}>
                    <Clock size={14}/> {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                  <div style={{color:'var(--accent-blue)', fontWeight:700, fontSize:'1.1rem'}}>{r.yesCount} / {r.totalQuestions}</div>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div style={{textAlign:'center', gridColumn:'1/-1', padding:'40px', opacity:0.5}}>No reports found.</div>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{textAlign:'center', padding:'40px 20px'}}>
            <div style={{marginBottom:'20px'}}>
               <CheckCircle2 size={80} color="var(--success)" className="success-icon-bounce" />
            </div>
            <h1 style={{margin:'0 0 10px 0', fontSize:'2rem'}}>Audit Complete!</h1>
            <p style={{opacity:0.8, fontSize:'1.1rem', margin:'0 0 24px 0'}}>The report has been successfully submitted to the management dashboard.</p>
            
            <div style={{background:'rgba(0,255,156,0.1)', border:'1px solid rgba(0,255,156,0.2)', borderRadius:'20px', padding:'20px', marginBottom:'30px'}}>
                <div style={{fontSize:'0.8rem', fontWeight:700, color:'var(--success)', letterSpacing:'1px', marginBottom:'5px'}}>FINAL SCORE</div>
                <div style={{fontSize:'3rem', fontWeight:800, color:'var(--success)'}}>{lastSubmittedScore.yes} / {lastSubmittedScore.total}</div>
                <div style={{fontSize:'0.9rem', opacity:0.7}}>Tasks marked as "Yes"</div>
            </div>

            <button className="nav-btn primary" style={{width:'100%', padding:'18px', justifyContent:'center', fontSize:'1.1rem'}} onClick={closeSuccessModal}>
              Return to Form
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

      {/* View Report Modal */}
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