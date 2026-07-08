interface Props {
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export default function ModalHeader({
  title,
  subtitle,
  onClose,
}: Props) {
  return (
    <div
      style={{
        padding: "22px 28px 18px",
        borderBottom: "1.5px solid #f0fdf4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {title && (
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "1.5px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: 18,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}