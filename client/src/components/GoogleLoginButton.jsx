import { useEffect } from "react";
import { serverUrl } from "../../config.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
function GoogleLoginButton() {
  const navigate = useNavigate();
  useEffect(() => {
    // Ensure Google API exists
    if (!window.google) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID is missing!");
      return;
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    // Render Google Login Button
    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        with: "100%",
      }
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch(`${serverUrl}/auth/google/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (data?.token) {
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Login failed!");
      }
    } catch (error) {
      toast.error("Google login error!");
    }
  };

  return <div id="googleBtn"></div>;
}

export default GoogleLoginButton;
