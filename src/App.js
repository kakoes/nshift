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
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence,
} from "firebase/firestore";

import "./App.css";

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

enableIndexedDbPersistence(db).catch(() => {});

/* ================= QUESTIONS ================= */

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

/* ================= APP ================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [answers, setAnswers] = useState(
    Object.fromEntries(QUESTIONS.map(q => [q, null]))
  );

  const [reports, setReports] = useState([]);

  const [submitStatus, setSubmitStatus] = useState("idle");
  const [cooldown, setCooldown] = useState(0);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");

  const [filterStore, setFilterStore] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [page, setPage] = useState(1);

  /* ================= AUTH ================= */

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      if (u?.email) setView("admin");
      setLoading(false);
    });
  }, []);

  const loginAdmin = async () => {
    try {
      setAdminError("");
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      setAdminEmail("");
      setAdminPass("");
    } catch {
      setAdminError("Invalid admin credentials");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setView("form");
  };

  /* ================= FIRESTORE ================= */

  useEffect(() => {
    if (view !== "admin") return;

    const unsub = onSnapshot(collection(db, "store_checklists"), snap => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      data.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );

      setReports(data);
    });

    return () => unsub();
  }, [view]);

  /* ================= SUBMIT ================= */

  useEffect(() => {
    if (cooldown === 0) return;
    const t = setInterval(() => {
      setCooldown(c => c - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submitForm = async () => {
    if (!name || store.length !== 7) {
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("submitting");

    const yesCount = Object.values(answers).filter(v => v === "Yes").length;

    await addDoc(collection(db, "store_checklists"), {
      name,
      store,
      answers,
      yesCount,
      totalQuestions: QUESTIONS.length,
      createdAt: serverTimestamp(),
    });

    setName("");
    setStore("");
    setAnswers(Object.fromEntries(QUESTIONS.map(q => [q, null])));
    setSubmitStatus("success");
    setCooldown(10);
  };

  const deleteReport = async id => {
    await deleteDoc(doc(db, "store_checklists", id));
  };

  /* ================= FILTER + PAGINATION ================= */

  const filtered = reports.filter(r => {
    const storeMatch = filterStore
      ? r.store?.includes(filterStore)
      : true;

    const dateMatch =
      filterDate && r.createdAt?.toDate
        ? r.createdAt.toDate().toISOString().slice(0, 10) === filterDate
        : true;

    return storeMatch && dateMatch;
  });

  const totalPages = Math.ceil(filtered.length / REPORTS_PER_PAGE);

  const paginated = filtered.slice(
    (page - 1) * REPORTS_PER_PAGE,
    page * REPORTS_PER_PAGE
  );

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="loader-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <ClipboardCheck />
          <span className="store">Store</span>
          <span className="checklist">Checklist</span>
        </div>

        {/* BUTTONS MOVED UNDER TITLE */}
        <div className="nav-group header-nav">
          <button
            className={`nav-btn ${view === "form" ? "active" : ""}`}
            onClick={() => setView("form")}
          >
            <ClipboardCheck size={18} /> Form
          </button>

          {user?.email && (
            <button
              className={`nav-btn ${view === "admin" ? "active" : ""}`}
              onClick={() => setView("admin")}
            >
              <LayoutDashboard size={18} /> Admin
            </button>
          )}

          {user?.email ? (
            <button className="nav-btn" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button className="nav-btn" onClick={() => setView("admin")}>
              <LogIn size={18} /> Admin Login
            </button>
          )}
        </div>
      </div>

      {/* ADMIN LOGIN */}
      {view === "admin" && !user?.email && (
        <div className="card">
          <h2>Admin Login</h2>

          <div className="form-grid">
            <div className="input-wrapper">
              <label className="input-label">Email</label>
              <input
                className="input-field"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
              />
            </div>
          </div>

          <button className="nav-btn primary" onClick={loginAdmin}>
            Login
          </button>

          {adminError && <div className="status error">{adminError}</div>}
        </div>
      )}

      {/* FORM */}
      {view === "form" && (
        <div className="card">
          <div className="form-grid">
            <div className="input-wrapper">
              <label className="input-label">Name</label>
              <input
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Store #</label>
              <input
                className="input-field"
                maxLength={7}
                value={store}
                onChange={e => setStore(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {QUESTIONS.map(q => (
            <div key={q} className="question-item">
              <div className="question-text">{q}</div>
              <div className="options">
                {["Yes", "No", "N/A"].map(opt => (
                  <button
                    key={opt}
                    className={`opt-btn ${
                      answers[q] === opt
                        ? opt === "Yes"
                          ? "active-yes"
                          : opt === "No"
                          ? "active-no"
                          : "active-na"
                        : ""
                    }`}
                    onClick={() =>
                      setAnswers({ ...answers, [q]: opt })
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {cooldown === 0 && (
            <button className="nav-btn success" onClick={submitForm}>
              Submit Checklist
            </button>
          )}

          {cooldown > 0 && (
            <div className="status info">
              You can submit again in {cooldown}s
            </div>
          )}

          {submitStatus === "error" && (
            <div className="status error">
              Name and 7-digit store required
            </div>
          )}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && user?.email && (
        <>
          {/* FILTERS RESTORED */}
          <div className="card">
            <div className="form-grid">
              <div className="input-wrapper">
                <label className="input-label">Filter Store</label>
                <input
                  className="input-field"
                  value={filterStore}
                  onChange={e => setFilterStore(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Filter Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-dashboard seven-col">
            {paginated.map(r => {
              const d = r.createdAt?.toDate
                ? r.createdAt.toDate()
                : null;

              return (
                <div key={r.id} className="report-box compact">
                  <h3>Store #{r.store}</h3>
                  <p>{r.name}</p>

                  {d && (
                    <p className="report-time">
                      <Clock size={12} />{" "}
                      {d.toLocaleDateString()}{" "}
                      {d.toLocaleTimeString()}
                    </p>
                  )}

                  <div className="nav-group">
                    <button
                      className="nav-btn"
                      onClick={() => deleteReport(r.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="nav-group pagination">
            <button
              className="nav-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} / {totalPages}
            </span>

            <button
              className="nav-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
