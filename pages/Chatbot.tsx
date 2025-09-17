import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import "./Chatbot.css";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp?: Date;
}

interface AppointmentData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  selectedDate: string;
  appointmentTime: string;
  createdAt: Date;
  status: 'confirmed' | 'cancelled'|'waiting';
  cancelledAt?: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: "bot", 
      text: "Welcome to Heart Clinic! How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [awaitingResponse, setAwaitingResponse] = useState<"date" | "time" | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  // Clinic hours from 9:00 AM to 3:00 PM
  const clinicHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(user);
        setUserEmail(user.email || "");
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || "");
            setUserPhone(userData.phone || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          addBotMessage("⚠️ Error loading your profile. Please try again later.");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: "bot", text, timestamp: new Date() }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: "user", text, timestamp: new Date() }]);
  };

  const isValidDate = (dateString: string): boolean => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false;
    
    return d.toISOString().slice(0, 10) === dateString;
  };

  const fetchAvailableAppointments = async (date: string): Promise<string[]> => {
    if (!currentUser) {
      addBotMessage("🔒 Please sign in to check availability.");
      navigate('/login');
      return [];
    }
  
    try {
      // First check if the clinic is closed on this date
      const closureQuery = query(
        collection(db, "closureDates"),
        where("date", "==", date)
      );
      const closureSnapshot = await getDocs(closureQuery);
      
      if (!closureSnapshot.empty) {
        const closureData = closureSnapshot.docs[0].data();
        addBotMessage(`❌ Clinic is closed on ${date} (${closureData.reason || "No reason provided"})`);
        return [];
      }
  
      // Then check for booked appointments
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef, 
        where("selectedDate", "==", date),
        where("status", "==", "confirmed")
      );
      const querySnapshot = await getDocs(q);
      
      const bookedTimes = querySnapshot.docs.map(doc => {
        const data = doc.data() as AppointmentData;
        return data.appointmentTime;
      });
  
      return clinicHours.filter(slot => !bookedTimes.includes(slot));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error instanceof Error && 'code' in error && error.code === 'permission-denied') {
        addBotMessage("🔒 Permission denied. Please sign in again.");
        navigate('/login');
      } else {
        addBotMessage("⚠️ We're having trouble checking availability. Please try again later.");
      }
      return [];
    }
  };

  const checkExistingAppointment = async (userId: string): Promise<AppointmentData | null> => {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("userId", "==", userId),
        where("status", "==", "confirmed")
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      // Find the most recent appointment (either upcoming or past)
      let mostRecentAppointment: AppointmentData | null = null;
      querySnapshot.forEach(doc => {
        const apptData = { id: doc.id, ...doc.data() } as AppointmentData;
        if (!mostRecentAppointment || 
            new Date(apptData.selectedDate) > new Date(mostRecentAppointment.selectedDate)) {
          mostRecentAppointment = apptData;
        }
      });

      return mostRecentAppointment;
    } catch (error) {
      console.error("Error checking appointments:", error);
      return null;
    }
  };

  const handleAppointmentBooking = async (time: string) => {
    if (!currentUser || !selectedDate || !userName || !userEmail) {
      addBotMessage("⚠️ Missing information. Please start over.");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user has any existing confirmed appointments
      const existingAppointment = await checkExistingAppointment(currentUser.uid);
      
      if (existingAppointment) {
        const appointmentDate = new Date(existingAppointment.selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate >= today) {
          addBotMessage(
            `❌ You already have an upcoming appointment on ${existingAppointment.selectedDate} at ${existingAppointment.appointmentTime}. ` +
            `Please cancel this appointment before booking a new one.`
          );
          setAwaitingResponse(null);
          setSelectedDate(null);
          setIsCancelling(false);
          return;
        }
      }

      // Verify date is valid
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);

      if (selected < today) {
        addBotMessage("❌ Please select a date in the future.");
        return;
      }

      // Check if slot is still available
      const availableTimes = await fetchAvailableAppointments(selectedDate);
      if (!availableTimes.includes(time)) {
        addBotMessage("❌ This time slot was just booked. Please choose another time.");
        return;
      }

      // Book the appointment
      const batch = writeBatch(db);
      const appointmentRef = doc(collection(db, "appointments"));
      
      batch.set(appointmentRef, {
        userId: currentUser.uid,
        userName,
        userEmail,
        userPhone,
        selectedDate,
        appointmentTime: time,
        createdAt: new Date(),
        status: 'confirmed'
      });

      await batch.commit();
      
      addBotMessage(`✅ Appointment confirmed on ${selectedDate} at ${time}!\n\n` +
                   `A confirmation has been sent to ${userEmail}.`);
      setAwaitingResponse(null);
      setSelectedDate(null);
      setIsCancelling(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
      addBotMessage("⚠️ Failed to book appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!currentUser) {
      addBotMessage("🔒 Please sign in to cancel appointments.");
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      // Check for existing appointment
      const existingAppointment = await checkExistingAppointment(currentUser.uid);
      
      if (!existingAppointment) {
        addBotMessage("ℹ️ You don't have any upcoming appointments to cancel.");
        setIsCancelling(false);
        return;
      }

      // Verify the appointment is in the future
      const appointmentDate = new Date(existingAppointment.selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        addBotMessage("ℹ️ This appointment is in the past and cannot be cancelled.");
        setIsCancelling(false);
        return;
      }

      // Update the appointment status to 'cancelled'
      const batch = writeBatch(db);
      const appointmentRef = doc(db, "appointments", existingAppointment.id);
      
      batch.update(appointmentRef, {
        status: 'cancelled',
        cancelledAt: new Date()
      });

      await batch.commit();
      
      addBotMessage(`✅ Appointment on ${existingAppointment.selectedDate} at ${existingAppointment.appointmentTime} has been cancelled.`);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      addBotMessage("⚠️ Failed to cancel appointment. Please try again.");
    } finally {
      setIsLoading(false);
      setIsCancelling(false);
    }
  };

  const handleUserMessage = async () => {
    const input = userInput.trim();
    if (!input) return;

    addUserMessage(input);
    setUserInput("");
    setIsLoading(true);

    try {
      if (input.toLowerCase().includes("cancel") || isCancelling) {
        if (!isCancelling) {
          // First cancellation request - confirm
          const existingAppointment = await checkExistingAppointment(currentUser?.uid || '');
          
          if (existingAppointment) {
            const appointmentDate = new Date(existingAppointment.selectedDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (appointmentDate >= today) {
              addBotMessage(
                `You have an upcoming appointment on ${existingAppointment.selectedDate} at ${existingAppointment.appointmentTime}.\n` +
                `Are you sure you want to cancel this appointment? (yes/no)`
              );
              setIsCancelling(true);
            } else {
              addBotMessage("ℹ️ You don't have any upcoming appointments to cancel.");
            }
          } else {
            addBotMessage("ℹ️ You don't have any appointments to cancel.");
          }
        } else {
          // Already in cancellation mode - handle confirmation
          if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'y') {
            await handleCancelAppointment();
          } else {
            addBotMessage("Appointment cancellation cancelled. How else can I help?");
            setIsCancelling(false);
          }
        }
        return;
      }

      const dateMatch = input.match(/\d{4}-\d{2}-\d{2}/);
      
      if (awaitingResponse === "date") {
        if (!dateMatch || !isValidDate(input)) {
          addBotMessage("❌ Please enter a valid date in YYYY-MM-DD format (e.g., 2023-12-25).");
          return;
        }

        // Check for existing appointments
        const existingAppointment = await checkExistingAppointment(currentUser?.uid || '');
        if (existingAppointment) {
          const appointmentDate = new Date(existingAppointment.selectedDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (appointmentDate >= today) {
            addBotMessage(
              `❌ You already have an upcoming appointment on ${existingAppointment.selectedDate} at ${existingAppointment.appointmentTime}. ` +
              `Please cancel this appointment before booking a new one.`
            );
            setAwaitingResponse(null);
            setSelectedDate(null);
            setIsCancelling(false);
            return;
          }
        }

        const date = dateMatch[0];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(date);

        if (selected < today) {
          addBotMessage("❌ Please select a date in the future.");
          return;
        }

        setSelectedDate(date);
        const availableTimes = await fetchAvailableAppointments(date);

        if (availableTimes.length === 0) {
          addBotMessage(`❌ No available slots on ${date}. Please try another date.`);
          setAwaitingResponse("date");
          setSelectedDate(null);
        } else {
          addBotMessage(
            `✅ Available times on ${date}:\n${availableTimes.join(", ")}\n\n` +
            "Please choose a time (e.g., 09:00)."
          );
          setAwaitingResponse("time");
        }
      } 
      else if (awaitingResponse === "time") {
        const timeMatch = input.match(/^\d{2}:\d{2}$/);
        
        if (!timeMatch || !clinicHours.includes(input)) {
          addBotMessage(`❌ Please choose a valid time slot from our working hours (${clinicHours.join(", ")}).`);
          return;
        }

        await handleAppointmentBooking(input);
      } 
      else if (dateMatch || input.toLowerCase().includes("appointment") || input.toLowerCase().includes("book")) {
        // First check if user has existing appointments
        const existingAppointment = await checkExistingAppointment(currentUser?.uid || '');
        if (existingAppointment) {
          const appointmentDate = new Date(existingAppointment.selectedDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (appointmentDate >= today) {
            addBotMessage(
              `❌ You already have an upcoming appointment on ${existingAppointment.selectedDate} at ${existingAppointment.appointmentTime}. ` +
              `Please cancel this appointment before booking a new one.`
            );
            return;
          } else {
            addBotMessage(
              `ℹ️ Your most recent appointment was on ${existingAppointment.selectedDate}. ` +
              `You may now book a new appointment.`
            );
            addBotMessage("📅 Please enter the date you'd like to book (YYYY-MM-DD format):");
            setAwaitingResponse("date");
            return;
          }
        }

        addBotMessage("📅 Please enter the date you'd like to book (YYYY-MM-DD format):");
        setAwaitingResponse("date");
      } 
      else if (input.toLowerCase().includes("available") || input.toLowerCase().includes("slots")) {
        if (dateMatch) {
          try {
            const availableTimes = await fetchAvailableAppointments(dateMatch[0]);
            addBotMessage(
              availableTimes.length > 0
                ? `✅ Available slots on ${dateMatch[0]}: ${availableTimes.join(", ")}`
                : `❌ No available slots on ${dateMatch[0]}. Try another date.`
            );
          } catch (error) {
            addBotMessage("⚠️ We're having trouble checking availability. Please try again later.");
          }
        } else {
          addBotMessage("Please specify a date in YYYY-MM-DD format to check availability.");
        }
      } 
      else {
        addBotMessage(
          "I can help you with:\n" +
          "- Booking appointments 📅\n" +
          "- Checking availability 🕒\n" +
          "- Canceling appointments ❌\n\n" +
          "How can I assist you?"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleUserMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Heart Clinic Appointment Bot</h2>
        {userName && <p>Welcome, {userName}</p>}
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}-message`}>
            <div className="message-content">
              {msg.text.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
            <div className="message-timestamp">
              {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content loading">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button 
          onClick={handleUserMessage}
          disabled={isLoading || !userInput.trim()}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;