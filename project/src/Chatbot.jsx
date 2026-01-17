export default function Chatbot() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        Chatbot
      </div>

      {/* messages scroll only */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        Messages...
      </div>

      {/* input */}
      <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
        Input...
      </div>
    </div>
  );
}
