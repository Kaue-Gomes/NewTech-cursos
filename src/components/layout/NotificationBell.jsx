import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getCurrentUser } from "../../services/auth.js";
import { getNotifications, markNotificationRead } from "../../services/platform.js";

export default function NotificationBell() {
  const user = getCurrentUser();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (!user?.email) return;
    getNotifications(user.email).then(setItems).catch(console.error);
  }, [user?.email]);

  useEffect(() => {
    function onClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    function onEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  if (!user) return null;

  const unread = items.filter((n) => !n.read_at).length;

  async function handleRead(id) {
    await markNotificationRead(user.email, id);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
    );
  }

  return (
    <div className="notification-bell-wrap" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="notification-bell"
        aria-label={`Notificações${unread ? `, ${unread} não lidas` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unread > 0 ? <span className="notification-badge">{unread}</span> : null}
      </button>

      {open ? (
        <div className="notification-panel" role="dialog" aria-label="Centro de notificações">
          {items.length === 0 ? (
            <div className="notification-item">Nenhuma notificação.</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`notification-item ${item.read_at ? "" : "unread"}`}
                onClick={() => handleRead(item.id)}
              >
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
