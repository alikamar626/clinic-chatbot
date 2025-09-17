import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import Firebase configuration

export interface Appointment {
  userId: string;
  date: string;
  time: string;
  createdAt: Date;
}

const saveAppointment = async (userId: string, date: string, time: string): Promise<void> => {
  try {
    await addDoc(collection(db, "appointments"), {
      userId,
      date,
      time,
      
      createdAt: new Date(),
    });
    console.log("✅ Appointment saved successfully!");
  } catch (error) {
    console.error("❌ Error saving appointment:", error);
  }
};

export { saveAppointment };
