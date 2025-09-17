import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./AdminMedicationsList.css";
import { useNavigate } from "react-router-dom";
import { useAdminVerify } from "./useAdminVerify";

interface Times {
  morning?: boolean;
  noon?: boolean;
  night?: boolean;
}

interface Medication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string;
  createdAt?: any;
  times: Times;
}

const AdminMedicationsList = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); 
  const { isAdmin, loading } = useAdminVerify();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      navigate("/home");
      return;
    }

    const fetchMedications = async () => {
      try {
        const q = query(collection(db, "medications"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const meds: Medication[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Medication[];
        setMedications(meds);
      } catch (err) {
        console.error("Failed to fetch medications", err);
        setError("Failed to load medications");
      }
    };

    fetchMedications();
  }, [isAdmin, loading, navigate]);

  // Filter by searchEmail
  const filteredMedications = medications.filter((med) =>
    med.userEmail.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="admin-medications-list-container">
      <button 
        onClick={() => navigate('/admin')}
        className="admin-nav-button"
      >
        Back to Admin
      </button>

      <h2>All Patients' Medications</h2>
      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Search by email..."
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        className="search-input"
      />

      <table className="medications-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Email</th>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Instructions</th>
            <th>Start</th>
            <th>End</th>
            <th>Morning</th>
            <th>Noon</th>
            <th>Night</th>
            <th>Date Added</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedications.map((med) => (
            <tr key={med.id}>
              <td>{med.userName}</td>
              <td>{med.userEmail}</td>
              <td>{med.medicationName}</td>
              <td>{med.dosage}</td>
              <td>{med.instructions}</td>
              <td>{med.startDate}</td>
              <td>{med.endDate}</td>
              <td>{med.times?.morning ? "✔️" : ""}</td>
              <td>{med.times?.noon ? "✔️" : ""}</td>
              <td>{med.times?.night ? "✔️" : ""}</td>
              <td>{med.createdAt?.toDate?.().toLocaleString() || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminMedicationsList;
