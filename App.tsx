import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import { AuthProvider } from "./pages/AuthContext";
import ForgotPassword from "./pages/ForgotPassword"; // Import the ForgotPassword component
import AboutUs from "./pages/about";
import AdminAppointments from "./pages/AdminAppointments";
import AdminMedications from "./pages/AdminMedications";
import AdminMedicationsList from "./pages/AdminMedicationsList";
import AdminClosureDates from "./pages/AdminClosureDates";





const AppContent = () => {
  const location = useLocation();

  // Define routes where Header and Footer should not be displayed
  const noHeaderFooterRoutes = ["/login", "/signup", "/forgot-password","/admin","/adminmedications","/adminmedicationslist","/adminclosuredates"];

  // Check if the current route is in the noHeaderFooterRoutes array
  const shouldShowHeaderFooter = !noHeaderFooterRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowHeaderFooter && <Header />} {/* Conditionally render Header */}
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/appointment" element={<Chatbot />} />
        <Route path="/about" element={<AboutUs />} />
        < Route path="/admin" element={<AdminAppointments />} />
        < Route path="/AdminMedications" element={<AdminMedications />} />
        < Route path="/AdminMedicationslist" element={<AdminMedicationsList />} />
        < Route path="/AdminClosureDates" element={<AdminClosureDates />} />



        


      </Routes>
      {shouldShowHeaderFooter && <Footer />} {/* Conditionally render Footer */}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;