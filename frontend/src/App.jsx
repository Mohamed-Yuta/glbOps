import React, { useEffect, useState } from "react";
import GlobetudesProjets from "./GlobetudesProjets";
import LoginScreen from "./components/LoginScreen";
import { apiGet, clearTokens, isAuthenticated, login as apiLogin, restoreSession } from "./lib/api";

export default function App() {
  const [status, setStatus] = useState("checking"); // checking | anonymous | authenticated
  const [authUser, setAuthUser] = useState(null);

  const loadCurrentUser = async () => {
    const me = await apiGet("/auth/me/");
    setAuthUser(me);
    setStatus("authenticated");
  };

  useEffect(() => {
    (async () => {
      if (isAuthenticated() && (await restoreSession())) {
        try {
          await loadCurrentUser();
          return;
        } catch {
          clearTokens();
        }
      }
      setStatus("anonymous");
    })();
  }, []);

  const handleLogin = async (username, password) => {
    await apiLogin(username, password);
    await loadCurrentUser();
  };

  const handleLogout = () => {
    clearTokens();
    setAuthUser(null);
    setStatus("anonymous");
  };

  if (status === "checking") return null;
  if (status === "anonymous") return <LoginScreen onLogin={handleLogin} />;

  return <GlobetudesProjets authUser={authUser} onLogout={handleLogout} />;
}
