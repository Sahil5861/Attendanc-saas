import { Eye,EyeOffIcon } from "lucide-react";
import React, { ReactNode, useState } from "react";

interface CustomInputProps {
    label?: string;
    type?: string;
    value?: string | number;
    placeholder?: string;
    name?: string;
    icon?: ReactNode;
    focus?: boolean;
    min?: number;
    maxLength?:number;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;

    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    // border: "1.5px solid #d1fae5",
    border: "1.5px solid rgb(209, 213, 219)",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    fontFamily: "Plus, Jakarta, sans-serif",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
};

const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems:'center',
    gap: '10px',
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#10b981";
    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,.12)";
};
const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    // e.target.style.borderColor = "#d1fae5";
    e.target.style.borderColor = "rgb(209, 213, 219)";
    e.target.style.boxShadow = "none";
};

export default function CustomInput({
    label,
    type = "text",
    value,
    placeholder,
    name,
    icon,
    disabled = false,
    required = false,
    readonly= false,
    focus=false,
    maxLength,
    min,
    onChange,
    onInput,
    onBlur,
    onFocus,
}: CustomInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
        <div>
            {label && 
                <label style={labelStyle}> {icon} {label}<sup style={{color:'red'}}>{required == true ? '*' : ''}</sup>  </label>
            }

            <div style={{ position: "relative" }}>
                <input
                    type={
                        isPassword
                            ? showPassword
                                ? "text"
                                : "password"
                            : type
                    }
                    name={name}
                    autoComplete="new-password"
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readonly}
                    required={required}
                    autoFocus={focus}
                    onChange={onChange}
                    onInput={onInput}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    min={min}

                    maxLength={type === 'tel' ? 10 : maxLength}  
                    
                    style={{
                        ...inputStyle,
                        paddingRight: isPassword ? 45 : 14,
                    }}
                />

                {/* {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                        }}
                    >
                        {showPassword ? <EyeOffIcon/> : <Eye/>}
                    </button>
                )} */}
            </div>
        </div>
    );
}