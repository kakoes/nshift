import React, { useEffect, useState } from "react";
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
  AlertCircle
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
      backdrop-filter: blur(8px); 
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
    
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

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
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [reports, setReports] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [pdfGenerating, setPdfGenerating] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 

  // Admin Actions State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("viewer");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [userActionState, setUserActionState] = useState({ loading: false, error: null, success: false });
  const [loginError, setLoginError] = useState(null);

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
      if (!jsPDF) throw new Error("jsPDF constructor not found");

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

      const fileName = `CK_Report_${report.store}_${Date.now()}.pdf`;
      doc.save(fileName);
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
        
        // AUTO-NAVIGATE TO DASHBOARD ON LOGIN OR PERSISTENT SESSION
        setView("admin");
      } else {
        setUser(null);
        setAdminRole(null);
        // Only reset to form if user explicitly signs out
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
      // The onAuthStateChanged listener above catches this and sets view to "admin" automatically
    } catch (err) {
      setLoginError("Invalid email or password.");
    }
  };

  const submitForm = async () => {
    if (!name || !store) return setSubmitStatus("error");
    setSubmitStatus("submitting");
    try {
      const yesCount = Object.values(answers).filter(v => v === "Yes").length;
      await addDoc(collection(db, "store_checklists"), {
        name, store, answers, yesCount, totalQuestions: dynamicQuestions.length, createdAt: serverTimestamp(),
      });
      setName(""); setStore(""); setAnswers({}); setSubmitStatus("success");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSubmitStatus("idle"), 4000);
    } catch (e) { setSubmitStatus("error"); }
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

      {/* LOGIN VIEW - Automatically disappears if user state changes */}
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
          <div className="form-meta" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
            <input className="input-field" placeholder="Inspector Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-field" placeholder="Store Number" value={store} onChange={e => setStore(e.target.value)} />
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {dynamicQuestions.map((q, i) => (
              <div key={i} style={{background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
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

          <button className="nav-btn primary" style={{width: '100%', marginTop: '24px', padding: '18px', justifyContent: 'center', fontSize: '1.1rem'}} onClick={submitForm} disabled={submitStatus === "submitting"}>
            {submitStatus === "submitting" ? <Loader2 className="animate-spin" /> : 'Complete Inspection'}
          </button>
          {submitStatus === "success" && <div style={{color: 'var(--success)', textAlign: 'center', marginTop: '15px', fontWeight: 'bold'}}>✓ Report Submitted!</div>}
          {submitStatus === "error" && <div style={{color: 'var(--danger)', textAlign: 'center', marginTop: '15px'}}>⚠ Name and Store # Required</div>}
        </div>
      )}

      {view === "admin" && user && (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
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
            {reports.map(r => (
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
          </div>
        </div>
      )}

      {/* Modals */}
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