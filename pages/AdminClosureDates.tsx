import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc,
  getDoc,
  Timestamp
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./AdminClosureDates.css";

interface ClosureDate {
  id: string;
  date: string; // YYYY-MM-DD format
  reason: string;
  createdAt: Date;
  addedBy: string;
}

const AdminClosureDates = () => {
  const navigate = useNavigate();
  const [closureDates, setClosureDates] = useState<ClosureDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const isAdmin = userDoc.data()?.isAdmin === true;
        setIsAdmin(isAdmin);
        
        if (!isAdmin) {
          navigate("/");
        }
      } catch (err) {
        console.error("Admin verification error:", err);
        setError("Failed to verify admin status");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchClosureDates = async () => {
      try {
        const q = query(collection(db, "closureDates"));
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as ClosureDate[];
        
        // Sort by date (ascending)
        dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setClosureDates(dates);
      } catch (err) {
        console.error("Error fetching closure dates:", err);
        setError("Failed to load closure dates");
      }
    };

    fetchClosureDates();
  }, [isAdmin]);

  const handleAddClosureDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    try {
      // Check if date is already marked as closed
      const existing = closureDates.find(d => d.date === selectedDate);
      if (existing) {
        setError("This date is already marked as closed");
        return;
      }

      await addDoc(collection(db, "closureDates"), {
        date: selectedDate,
        reason: reason || "Clinic closed",
        createdAt: new Date(),
        addedBy: auth.currentUser?.uid || "admin"
      });

      setSuccessMessage(`Successfully marked ${selectedDate} as closed`);
      setSelectedDate("");
      setReason("");
      
      // Refresh the list
      const q = query(collection(db, "closureDates"));
      const snapshot = await getDocs(q);
      const dates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as ClosureDate[];
      
      dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setClosureDates(dates);
    } catch (err) {
      console.error("Error adding closure date:", err);
      setError("Failed to add closure date");
    }
  };

  const handleRemoveClosureDate = async (id: string, date: string) => {
    if (!window.confirm(`Are you sure you want to reopen ${date}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "closureDates", id));
      setClosureDates(prev => prev.filter(d => d.id !== id));
      setSuccessMessage(`Successfully reopened ${date}`);
    } catch (err) {
      console.error("Error removing closure date:", err);
      setError("Failed to remove closure date");
    }
  };

  if (loading) {
    return <div className="loading">Checking permissions...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-closure-dates">
      <div className="admin-actions">
        <button 
          onClick={() => navigate("/admin")}
          className="admin-nav-button"
        >
          ← Back to Admin Dashboard
        </button>
      </div>

      <h2>Manage Clinic Closure Dates</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="closure-form-container">
        <form onSubmit={handleAddClosureDate} className="closure-form">
          <div className="form-group">
            <label>Select Date to Close:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Only allow future dates
              required
            />
          </div>

          <div className="form-group">
            <label>Reason (optional):</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Public holiday, Staff training"
            />
          </div>

          <button type="submit" className="add-button">
            Mark as Closed
          </button>
        </form>

        <div className="closure-list">
          <h3>Upcoming Closure Dates</h3>
          {closureDates.length === 0 ? (
            <p>No upcoming closure dates</p>
          ) : (
            <ul>
              {closureDates.map((closure) => (
                <li key={closure.id} className="closure-item">
                  <div>
                    <strong>{closure.date}</strong>
                    {closure.reason && <span> - {closure.reason}</span>}
                  </div>
                  <button
                    onClick={() => handleRemoveClosureDate(closure.id, closure.date)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClosureDates;