import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    setAuthed(!!localStorage.getItem("access_token"));
    setReady(true);
  }, []);

  if (!ready) return null;
  return authed ? children : <Navigate to="/login" replace />;
}
