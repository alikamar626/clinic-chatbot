import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./AdminAppointments.css";

interface Appointment {
  id: string;
  userName: string;
  userEmail: string;
  selectedDate: string;
  appointmentTime: string;
  status: "confirmed" | "cancelled" | "waiting";
  createdAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  userId: string;
}

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming">("upcoming");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled" | "waiting">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          console.error("Access denied: not admin");
          navigate("/home");
          return;
        }

        setIsAdmin(true);
        fetchAppointments();
      } catch (error) {
        console.error("Admin verification error:", error);
        setError("Failed to verify admin privileges");
        navigate("/home");
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      let q = query(collection(db, "appointments"), orderBy("selectedDate"));

      if (statusFilter !== "all") {
        q = query(q, where("status", "==", statusFilter));
      }

      const querySnapshot = await getDocs(q);
      const now = new Date();
      const appointmentsData: Appointment[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const appointmentDate = new Date(data.selectedDate);
        const [hours, minutes] = data.appointmentTime.split(":").map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);

        if (filter === "all" || appointmentDate >= now) {
          appointmentsData.push({
            id: docSnap.id,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            selectedDate: data.selectedDate,
            appointmentTime: data.appointmentTime,
            status: data.status,
            createdAt: data.createdAt.toDate(),
            
          });
        }
      });

      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "confirmed" | "cancelled") => {
    if (!window.confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) {
      return;
    }

    try {
      const appointmentRef = doc(db, "appointments", id);
      const updateData: Partial<Appointment> = {
        status: newStatus,
        ...(newStatus === "confirmed" && { confirmedAt: new Date() }),
        ...(newStatus === "cancelled" && { cancelledAt: new Date() }),
      };

      await updateDoc(appointmentRef, updateData);

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, ...updateData } : appt))
      );
    } catch (error) {
      console.error("Update error:", error);
      setError(`Failed to ${newStatus} appointment`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return new Date(0, 0, 0, parseInt(hours), parseInt(minutes)).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin) {
    return <div className="loading-message">Verifying access...</div>;
  }

  return (
    
    <div className="admin-container">
      <div className="admin-actions">
        <button 
            onClick={() => navigate('/adminmedications')}
            className="admin-nav-button"
          >
            Manage Medications
          </button>
          <button 
            onClick={() => navigate('/adminmedicationslist')}
            className="admin-nav-button"
          >
            Manage AdminMedicationsList
          </button>
          <button 
            onClick={() => navigate('/adminclosuredates')}
            className="admin-nav-button"
          >
            Manage AdminMedicationsList
          </button>
          </div>
      <header className="admin-header">
        <h1>Appointment Management</h1>
        
        <div className="admin-filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "upcoming")}>
            <option value="upcoming">Upcoming</option>
            <option value="all">All Appointments</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button onClick={fetchAppointments} className="refresh-btn">
            Refresh
          </button>
        </div>
      

      </header>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="no-appointments">No appointments found</div>
      ) : (
        <div className="table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.userName}</td>
                  <td>{appointment.userEmail}</td>
                  <td>{formatDate(appointment.selectedDate)}</td>
                  <td>{formatTime(appointment.appointmentTime)}</td>
                  <td className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                    {appointment.confirmedAt && (
                      <div className="status-date">
                        Confirmed: {formatTime(appointment.confirmedAt.toISOString())}
                      </div>
                    )}
                    {appointment.cancelledAt && (
                      <div className="status-date">
                        Cancelled: {formatTime(appointment.cancelledAt.toISOString())}
                      </div>
                    )}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
