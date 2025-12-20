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
  Search,
  RotateCcw,
  Filter
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
} from "firebase/firestore";

/* ================= FIREBASE ================= */

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

/* ================= CONSTANTS ================= */

const QUESTIONS = [
  "Sweep and Mop Floor (Sales Floor + Behind Register Area) including corners",
  "Clean Restrooms (Men and Women)",
  "Scan Lottery",
  "Stock Condiments (Fresh & Bottles)",
  "Stock Cups, Lids and Straws",
  "Fill Coffee Beans and Cappuccino Powder",
  "Stock Cooler (Beer Side)",
  "Clean Coffee Machines",
  "Front and Face Cooler",
  "Front and Face Dairy and C-Store",
  "Wash Dishes and Utensils",
  "Stock Sandwiches from Rack into Cold Case",
  "Fill and Replace Cold Creamers (Liquid)",
  "Clean Hot Dog Grill, Tray and Underneath",
  "Stock Hot Dogs in Jars",
  "Put Hot Dogs on Roller Grill",
  "Cook Sandwiches, Browns and Tornados",
  "Ice Beer on the Ice Down",
  "Clean Cappuccino Machine Every Night",
  "Remove Expired Products from Dairy Case",
  "Remove Expired Products from Cold Sandwich Case",
  "Clean Microwaves, Fountain Machines, Fill Napkins",
  "Stock Toilet Paper and Soap in Restrooms",
  "Prepare and Label Sanitizer Sink, Bottle and Bucket Solution",
];

const REPORTS_PER_PAGE = 14;

/* ================= STYLES ================= */

const CustomStyles = () => (
  <style>{`
    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap");

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

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Josefin Sans", sans-serif;
      background-color: var(--bg);
      color: var(--text-primary);
    }

    .app-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 16px;
      min-height: 100vh;
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 24px;
      background: rgba(27, 38, 59, 0.9);
      backdrop-filter: blur(12px);
      padding: 18px 22px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 16px;
      z-index: 100;
    }

    .brand {
      font-size: 1.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand .store { color: var(--accent-orange); }
    .brand .checklist { color: var(--accent-blue); }

    .nav-btn {
      padding: 10px 16px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(65, 90, 119, 0.35);
      color: white;
      cursor: pointer;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .nav-btn.active, .nav-btn.primary { background: var(--accent-blue); color: var(--bg); }
    .nav-btn.success { background: var(--success); color: var(--bg); }
    .nav-btn.danger { background: rgba(255,77,79,0.15); color: var(--danger); border-color: var(--danger); }

    .card {
      background: var(--card);
      padding: 24px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 24px;
    }

    .input-label {
      font-size: 0.8rem;
      color: var(--accent-blue);
      margin-bottom: 6px;
      font-weight: 600;
      display: block;
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 2px solid rgba(255,255,255,0.1);
      background: rgba(13, 27, 42, 0.55);
      color: white;
      outline: none;
      font-family: inherit;
    }

    .input-field:focus { border-color: var(--accent-blue); }

    /* FILTERS GRID */
    .filter-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      align-items: end;
      margin-bottom: 20px;
      background: rgba(27, 38, 59, 0.5);
      padding: 16px;
      border-radius: 20px;
    }

    .report-box {
      background: var(--card);
      border-radius: 20px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .report-box h3 { font-size: 0.9rem; margin: 0; color: var(--accent-orange); }
    .employee-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary) !important; margin: 4px 0; }
    .report-time { color: var(--text-secondary) !important; font-size: 0.7rem; display: flex; align-items: center; gap: 4px; }

    .admin-dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }

    @media (min-width: 1200px) { .admin-dashboard-grid { grid-template-columns: repeat(7, 1fr); } }

    .question-item {
      margin-bottom: 12px;
      background: rgba(13, 27, 42, 0.35);
      padding: 14px;
      border-radius: 16px;
      border-left: 4px solid var(--accent-blue);
    }

    .opt-btn { flex: 1; padding: 8px; border-radius: 10px; background: var(--bg); border: none; color: white; cursor: pointer; }
    .opt-btn.active-yes { background: var(--success); color: var(--bg); }
    .opt-btn.active-no { background: var(--danger); color: white; }
    .opt-btn.active-na { background: var(--warning); color: var(--bg); }

    .loader-screen { height: 100vh; display: flex; align-items: center; justify-content: center; }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `}</style>
);

/* ================= APP ================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [answers, setAnswers] = useState(Object.fromEntries(QUESTIONS.map(q => [q, null])));
  const [submitStatus, setSubmitStatus] = useState("idle");

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");

  // Reports State
  const [reports, setReports] = useState([]);
  
  // FILTERING STATES
  const [filterStore, setFilterStore] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [page, setPage] = useState(1);

  // Super Admin State
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("viewer");
  const [createAdminStatus, setCreateAdminStatus] = useState("");

  /* ================= AUTH ================= */

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "admins", u.uid));
        setAdminRole(snap.exists() ? snap.data().role : "super");
      } else {
        setAdminRole(null);
      }
      setLoading(false);
    });
  }, []);

  const loginAdmin = async () => {
    try {
      setAdminError("");
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      setView("admin");
    } catch (err) {
      setAdminError("Invalid Login");
    }
  };

  /* ================= DATA ================= */

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "store_checklists"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReports(data);
    });
    return () => unsub();
  }, [user]);

  const deleteReport = async (id) => {
    if (adminRole !== 'super') return;
    if (window.confirm("Delete this report?")) {
      await deleteDoc(doc(db, "store_checklists", id));
    }
  };

  const submitForm = async () => {
    if (!name || !store) { setSubmitStatus("error"); return; }
    setSubmitStatus("submitting");
    const yesCount = Object.values(answers).filter(v => v === "Yes").length;
    await addDoc(collection(db, "store_checklists"), {
      name, store, answers, yesCount, totalQuestions: QUESTIONS.length, createdAt: serverTimestamp(),
    });
    setName(""); setStore(""); setAnswers(Object.fromEntries(QUESTIONS.map(q => [q, null])));
    setSubmitStatus("success");
    setTimeout(() => setSubmitStatus("idle"), 3000);
  };

  const createAdminAccount = async () => {
    if (!newAdminEmail || !newAdminPass) return;
    setCreateAdminStatus("Creating...");
    try {
      const cred = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPass);
      await setDoc(doc(db, "admins", cred.user.uid), {
        email: newAdminEmail,
        role: newAdminRole,
        createdAt: serverTimestamp(),
      });
      setNewAdminEmail(""); setNewAdminPass("");
      setCreateAdminStatus("Admin Created!");
      setTimeout(() => setCreateAdminStatus(""), 3000);
    } catch (err) {
      setCreateAdminStatus("Error: " + err.message);
    }
  };

  /* ================= FILTER LOGIC ================= */

  const filtered = reports.filter(r => {
    const sMatch = filterStore ? r.store?.includes(filterStore) : true;
    const nMatch = filterName ? r.name?.toLowerCase().includes(filterName.toLowerCase()) : true;
    
    if (!r.createdAt?.toDate) return sMatch && nMatch;
    
    const rDate = r.createdAt.toDate();
    rDate.setHours(0,0,0,0);
    
    let dMatch = true;
    if (filterDateStart) {
      const start = new Date(filterDateStart);
      start.setHours(0,0,0,0);
      dMatch = dMatch && rDate >= start;
    }
    if (filterDateEnd) {
      const end = new Date(filterDateEnd);
      end.setHours(23,59,59,999);
      dMatch = dMatch && rDate <= end;
    }
    
    return sMatch && nMatch && dMatch;
  });

  const resetFilters = () => {
    setFilterStore("");
    setFilterName("");
    setFilterDateStart("");
    setFilterDateEnd("");
    setPage(1);
  };

  const paginated = filtered.slice((page - 1) * REPORTS_PER_PAGE, page * REPORTS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / REPORTS_PER_PAGE) || 1;

  if (loading) return <div className="loader-screen"><CustomStyles /><Loader2 className="animate-spin" color="#4cc9f0" size={64} /></div>;

  return (
    <div className="app-container">
      <CustomStyles />
      
      <header className="header">
        <div className="brand">
          <ClipboardCheck color="var(--accent-orange)" />
          <span className="store">CIRCLE K</span>
          <span className="checklist">NightShift</span>
        </div>
        <div className="nav-group">
          <button className={`nav-btn ${view === "form" ? "active" : ""}`} onClick={() => setView("form")}><ClipboardCheck size={20} /> New Form</button>
          {user ? (
            <>
              <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}><LayoutDashboard size={20} /> Dashboard</button>
              <button className="nav-btn" onClick={() => { signOut(auth); setView("form"); }}><LogOut size={20} /> Logout</button>
            </>
          ) : (
            <button className={`nav-btn ${view === "login" ? "active" : ""}`} onClick={() => setView("login")}><LogIn size={20} /> Admin</button>
          )}
        </div>
      </header>

      {view === "login" && (
        <div className="card" style={{maxWidth: '400px', margin: '40px auto'}}>
          <h2 style={{color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '10px'}}><ShieldCheck /> Admin Access</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>
            <input placeholder="Admin Email" className="input-field" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            <input placeholder="Password" type="password" className="input-field" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
            <button className="nav-btn primary" style={{justifyContent: 'center'}} onClick={loginAdmin}>Login</button>
            {adminError && <p className="status error">{adminError}</p>}
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="card" style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
            <div>
              <label className="input-label">Inspector Name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
            </div>
            <div>
              <label className="input-label">Store Number</label>
              <input className="input-field" value={store} onChange={e => setStore(e.target.value)} placeholder="Store #" />
            </div>
          </div>
          {QUESTIONS.map((q, i) => (
            <div key={i} className="question-item">
              <div style={{color: '#ffc99c', marginBottom: '10px', fontSize: '0.95rem'}}>{q}</div>
              <div style={{display: 'flex', gap: '10px'}}>
                {["Yes", "No", "N/A"].map(o => (
                  <button key={o} onClick={() => setAnswers({...answers, [q]: o})} className={`opt-btn ${answers[q] === o ? (o === 'Yes' ? 'active-yes' : o === 'No' ? 'active-no' : 'active-na') : ''}`}>{o}</button>
                ))}
              </div>
            </div>
          ))}
          <button className="nav-btn primary" style={{width: '100%', marginTop: '20px', padding: '16px'}} onClick={submitForm}>Submit Report</button>
          {submitStatus === "success" && <p className="status info" style={{color: 'var(--success)', textAlign: 'center'}}>Report Saved!</p>}
          {submitStatus === "error" && <p className="status error" style={{textAlign: 'center'}}>Name and Store # required.</p>}
        </div>
      )}

      {view === "admin" && user && (
        <div>
          {/* SUPER ADMIN: ACCOUNT CREATION */}
          {adminRole === "super" && (
            <div className="card" style={{borderLeft: '4px solid var(--accent-orange)'}}>
              <h3 style={{color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '8px'}}><UserPlus size={18} /> Manage Admin Accounts</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '15px'}}>
                <input placeholder="Email" className="input-field" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                <input placeholder="Password" type="password" className="input-field" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} />
                <select className="input-field" value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)}>
                  <option value="viewer">Viewer (Read Only)</option>
                  <option value="super">Super Admin (Full Control)</option>
                </select>
                <button className="nav-btn success" style={{justifyContent: 'center'}} onClick={createAdminAccount}>Create</button>
              </div>
              {createAdminStatus && <p className="status info">{createAdminStatus}</p>}
            </div>
          )}

          {/* FILTER BAR FOR ALL ADMINS */}
          <div className="filter-bar">
            <div>
              <label className="input-label"><Search size={12} /> Store #</label>
              <input className="input-field" placeholder="Search Store..." value={filterStore} onChange={e => setFilterStore(e.target.value)} />
            </div>
            <div>
              <label className="input-label"><Filter size={12} /> Inspector</label>
              <input className="input-field" placeholder="Search Name..." value={filterName} onChange={e => setFilterName(e.target.value)} />
            </div>
            <div>
              <label className="input-label"><Clock size={12} /> From Date</label>
              <input type="date" className="input-field" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
            </div>
            <div>
              <label className="input-label"><Clock size={12} /> To Date</label>
              <input type="date" className="input-field" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
            </div>
            <button className="nav-btn danger" style={{height: '46px'}} onClick={resetFilters}><RotateCcw size={16} /> Reset</button>
          </div>

          {/* DASHBOARD GRID */}
          <div className="admin-dashboard-grid">
            {paginated.map(r => {
               const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
               return (
                <div key={r.id} className="report-box">
                  <div>
                    <h3>Store #{r.store}</h3>
                    <div className="employee-name">{r.name}</div>
                    <div className="report-time"><Clock size={12} /> {d.toLocaleDateString()}</div>
                  </div>
                  
                  <div style={{marginTop: '12px'}}>
                    <div style={{color: r.yesCount > 20 ? 'var(--success)' : 'var(--accent-orange)', fontSize: '0.8rem', fontWeight: 700}}>
                      Score: {r.yesCount}/{r.totalQuestions}
                    </div>
                    <div style={{display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end'}}>
                      <button className="nav-btn" style={{padding: '6px'}} title="Download PDF"><Download size={14}/></button>
                      {adminRole === "super" && (
                        <button className="nav-btn" style={{background: 'rgba(255,77,79,0.1)', padding: '6px'}} onClick={() => deleteReport(r.id)}>
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
               )
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', alignItems: 'center'}}>
              <button className="nav-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span style={{fontWeight: 700, color: 'var(--accent-blue)'}}>{page} / {totalPages}</span>
              <button className="nav-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}