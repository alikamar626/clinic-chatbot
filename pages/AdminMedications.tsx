import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { useAdminVerify } from "./useAdminVerify";
import "./AdminMedications.css";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
}

interface Medication {
  userId: string;
  userName: string;
  userEmail: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string;
  times: {
    morning: boolean;
    noon: boolean;
    night: boolean;
  };
  createdAt: Date;
  addedBy: string;
}

const AdminMedications = () => {
  const navigate = useNavigate(); 
  const { isAdmin, loading } = useAdminVerify();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState({
    morning: false,
    noon: false,
    night: false
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("email"));
        const snapshot = await getDocs(q);
        const usersData: User[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleTimeChange = (time: keyof typeof times) => {
    setTimes(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!selectedUserId || !medicationName || !dosage || !instructions || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (!times.morning && !times.noon && !times.night) {
      setError("Please select at least one time of day");
      return;
    }

    try {
      const selectedUser = users.find((u) => u.id === selectedUserId);
      if (!selectedUser) {
        throw new Error("Selected user not found");
      }

      await addDoc(collection(db, "medications"), {
        userId: selectedUserId,
        userName: selectedUser.name || selectedUser.fullName || selectedUser.email,
        userEmail: selectedUser.email,
        medicationName,
        dosage,
        instructions,
        startDate,
        endDate,
        times,
        createdAt: new Date(),
        addedBy: auth.currentUser?.uid || "system"
      });

      setSuccessMessage("Medication added successfully");
      setMedicationName("");
      setDosage("");
      setInstructions("");
      setStartDate("");
      setEndDate("");
      setTimes({
        morning: false,
        noon: false,
        night: false
      });
    } catch (err) {
      console.error("Error adding medication:", err);
      setError("Failed to add medication. Please try again.");
    }
  };

  const getUserDisplayName = (user: User) => {
    const name = user.name || user.fullName || '';
    return name ? `${name} (${user.email})` : user.email;
  };

  if (loading) {
    return <div className="loading-message">Verifying permissions...</div>;
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
    <div className="admin-medication-container">
      <div className="admin-actions">
        <button 
          onClick={() => navigate("/admin")}
          className="admin-nav-button"
        >
          ← Back to Admin Dashboard
        </button>
      </div>
      <h2>Add Medication for Patient</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleAddMedication} className="medication-form">
        <div className="form-group">
          <label>Select Patient:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">-- Select Patient --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserDisplayName(user)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Medication Name:</label>
          <input
            type="text"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Dosage:</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Instructions:</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Times:</label>
          <div className="time-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={times.morning}
                onChange={() => handleTimeChange('morning')}
              />
              Morning
            </label>
            <label>
              <input
                type="checkbox"
                checked={times.noon}
                onChange={() => handleTimeChange('noon')}
              />
              Noon
            </label>
            <label>
              <input
                type="checkbox"
                checked={times.night}
                onChange={() => handleTimeChange('night')}
              />
              Night
            </label>
          </div>
        </div>

        <button type="submit">Add Medication</button>
      </form>
    </div>
  );
};

export default AdminMedications;