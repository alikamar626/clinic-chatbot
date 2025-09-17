# Clinic Appointment Bot

A **React-based chatbot** for Heart Clinic that helps patients **book, cancel, and check appointments** in a conversational interface. The app uses **Firebase Authentication** and **Firestore** for secure data storage and management.

---

## 🚀 Features

- **User Authentication:** Only signed-in users can access appointment functionalities.  
- **Appointment Booking:** Prevents double bookings and ensures future dates.  
- **Cancellation:** Users can cancel upcoming appointments.  
- **Available Slots:** Displays available clinic hours (09:00 AM – 03:00 PM).  
- **Dynamic Chat Interface:** Interactive bot responses with loading indicators.  
- **Error Handling:** Graceful feedback for invalid inputs, unavailable slots, or permission issues.

---


## ⚡ How It Works

1. **Authentication:** Checks if a user is logged in; otherwise redirects to login.  
2. **User Data Fetching:** Retrieves `name`, `email`, and `phone` from Firestore.  
3. **Booking Appointments:**  
   - Validates future dates.  
   - Checks existing appointments to avoid conflicts.  
   - Checks if the clinic is closed on selected dates.  
   - Shows available time slots.  
4. **Cancelling Appointments:**  
   - Cancels only future confirmed appointments.  
   - Updates status to `cancelled` in Firestore.  
5. **Interactive Chat:**  
   - Users type messages or use buttons.  
   - Bot responds with confirmations, errors, or prompts.  

---

## ⚙️ Setup & Usage

1. **Clone the repository**
```bash
git clone https://github.com/alikamar626/clinic-chatbot.git
