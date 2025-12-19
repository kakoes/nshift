import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, FileX } from 'lucide-react';

export default function Admin({ db, questions }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'store_checklists');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  if (loading) return <div className="loader-screen">Loading Reports...</div>;

  return (
    <div className="admin-dashboard">
      {reports.length === 0 ? (
        <div className="empty-state">
          <FileX size={56} color="#4cc9f0" style={{ opacity: 0.8, marginBottom: 20 }} />
          <h3>No Reports Found</h3>
          <p>Submit a checklist to see records here.</p>
        </div>
      ) : (
        reports.map(r => (
          <div key={r.id} className="report-box">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 15}}>
              <div>
                <div style={{fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-blue)'}}>Store #{r.store}</div>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{r.name}</div>
              </div>
              <div className="badge badge-yes">Score: {Math.round((r.yesCount / r.totalQuestions) * 100)}%</div>
            </div>
            <div className="scroll-answers">
              {questions.map(q => (
                <div key={q} className="ans-row">
                  <span>{q}</span>
                  <span className={`badge badge-${r.answers?.[q]?.toLowerCase().replace('/','') || 'na'}`}>
                    {r.answers?.[q] || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
            <button 
              className="nav-btn" 
              style={{width:'100%', marginTop: 15, background: 'rgba(255, 77, 79, 0.1)', color: 'var(--danger)'}}
              onClick={() => { if(window.confirm("Delete?")) deleteDoc(doc(db, 'store_checklists', r.id)); }}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}