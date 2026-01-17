import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();
  const showIframe = pathname !== "/embed";

  return (
    <>
      <Outlet />

      {showIframe && (
        <iframe
          title="Chatbot"
          src="/embed"
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 360,
            height: 520,
            border: "none",
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            zIndex: 999999,
            background: "white",
          }}
        />
      )}
    </>
  );
}
