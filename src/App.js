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
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

  /* ================= AUTH ================= */

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      if (u?.email) setView("admin");
      setLoading(false);
    });
  }, []);

  const loginAdmin = async () => {
    const email = prompt("Admin email:");
    const password = prompt("Password:");
    if (!email || !password) return;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setView("form");
  };

  /* ================= FIRESTORE ================= */

  useEffect(() => {
    if (view !== "admin") return;
    const unsub = onSnapshot(collection(db, "store_checklists"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setReports(data);
    });
    return () => unsub();
  }, [view]);

  const submitForm = async () => {
    if (!name || store.length !== 7) {
      alert("Name and 7-digit store required");
      return;
    }

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
    alert("Submitted");
  };

  const deleteReport = async id => {
    if (!window.confirm("Delete report permanently?")) return;
    await deleteDoc(doc(db, "store_checklists", id));
  };

  const exportPDF = r => {
    const pdf = new jsPDF();

    const submittedDate = r.createdAt?.toDate
      ? r.createdAt.toDate()
      : new Date();

    const dateStr = submittedDate.toLocaleDateString();
    const timeStr = submittedDate.toLocaleTimeString();

    pdf.setFontSize(16);
    pdf.text("Circle K Store Checklist Report", 14, 18);

    pdf.setFontSize(10);
    pdf.text(`Store #: ${r.store}`, 14, 28);
    pdf.text(`Inspector: ${r.name}`, 14, 34);
    pdf.text(`Date: ${dateStr}`, 14, 40);
    pdf.text(`Time: ${timeStr}`, 14, 46);

    autoTable(pdf, {
      startY: 54,
      head: [["Checklist Item", "Answer"]],
      body: Object.entries(r.answers),
      styles: { fontSize: 8 },
    });

    pdf.save(`Store_${r.store}_${dateStr.replace(/\//g, "-")}.pdf`);
  };

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
      <div className="header">
        <div className="brand">
          <ClipboardCheck />
          <span className="store">Store</span>
          <span className="checklist">Checklist</span>
        </div>

        <div className="nav-group">
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

          {!user?.email ? (
            <button className="nav-btn" onClick={loginAdmin}>
              <LogIn size={18} /> Admin Login
            </button>
          ) : (
            <button className="nav-btn" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      </div>

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

          <button className="nav-btn success" onClick={submitForm}>
            Submit Checklist
          </button>
        </div>
      )}

      {view === "admin" && (
        <div className="admin-dashboard">
          {reports.length === 0 && (
            <div className="empty-state">No reports yet</div>
          )}

          {reports.map(r => {
            const d = r.createdAt?.toDate
              ? r.createdAt.toDate()
              : null;

            return (
              <div key={r.id} className="report-box">
                <h3>Store #{r.store}</h3>
                <p>{r.name}</p>

                {d && (
                  <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                    <Clock size={14} />{" "}
                    {d.toLocaleDateString()}{" "}
                    {d.toLocaleTimeString()}
                  </p>
                )}

                <div className="nav-group">
                  <button className="nav-btn" onClick={() => exportPDF(r)}>
                    <Download size={16} />
                  </button>
                  <button
                    className="nav-btn"
                    onClick={() => deleteReport(r.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
