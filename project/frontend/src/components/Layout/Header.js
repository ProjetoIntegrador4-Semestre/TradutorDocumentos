import React, { useEffect, useState } from "react";
import "./Layout.css";
import { authFetch } from "../../api/client";

export default function Header() {
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const res = await authFetch("/users/me");
      if (res.ok) {
        const me = await res.json();
        setName(me.full_name || me.email);
      }
    })();
  }, []);

  return (
    <header className="header">
      <div>Bem-vindo(a) {name ? `, ${name}` : ""}</div>
    </header>
  );
}
