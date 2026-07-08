import ModalHeader from "../common/ModalHeader";

interface Props {
    open: boolean;
    title: string;    
    subtitle: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function CompanyModal({
    open,
    title,    
    subtitle,
    onClose,
    children,
}: Props) {
    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                zIndex: 9999,
                padding: "32px 16px",
                overflowY: "auto",
            }}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 980,
                    maxHeight: "calc(100vh - 64px)",
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 20px 50px rgba(0,0,0,.15)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* <div
                    style={{
                        minHeight: 72,
                        padding: "0 24px",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 22,
                                fontWeight: 700,
                                color: "#0f172a",
                            }}
                        >
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            color: "#64748b",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            lineHeight: 1,
                        }}
                    >
                        x
                    </button>
                </div> */}


                <ModalHeader
                    title={title}
                    subtitle={subtitle}
                    onClose={onClose}
                />

                <div 
                    style={{
                        padding: 24,
                        overflowY: "auto",
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
