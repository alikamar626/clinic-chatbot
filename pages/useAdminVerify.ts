import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export const useAdminVerify = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Check both auth token claims and Firestore document
        const token = await user.getIdTokenResult();
        const userDoc = await getDoc(doc(db, "users", user.uid));

        const isAdminFromToken = token.claims.admin === true;
        const isAdminFromFirestore = userDoc.data()?.isAdmin === true;

        if (!isAdminFromToken && !isAdminFromFirestore) {
          console.error("Access denied: not admin");
          navigate("/home");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Admin verification error:", error);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  return { isAdmin, loading };
};