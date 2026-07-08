"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getNewCaptcha } from "@/services/auth.service";

export interface CaptchaHandle {
  verify: (input: string) => boolean;
  refresh: () => void;
}





function generateCaptchaText(length = 6) {
  // Avoid visually-confusing characters like 0/O, 1/I
  // const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  // let text = "";
  // for (let i = 0; i < length; i++) {
  //   text += chars[Math.floor(Math.random() * chars.length)];
  // }
  // return text;

  // fetchCaptcha();
  return 'SAHIL0';
}

const Captcha = forwardRef<CaptchaHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");  
  const [captchaId, setCaptchaTId] = useState("");  

  const fetchCaptcha = async ()=>{
    const res = await getNewCaptcha(6);
    // return res.data.data;

    // console.log(res.data);
    
    setText(res.data.data.captcha);
    setCaptchaTId(res.data.data.captchaId);
  }


  useEffect(() => {
    if(!text)  return;
    draw(text);
  }, [text])


  useEffect(()=>{
    fetchCaptcha();
  }, [])  

  const draw = (value: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.fillStyle = "#f0fdf4";
    ctx.fillRect(0, 0, width, height);

    // noisy lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(16,185,129,${Math.random() * 0.3 + 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // distorted characters
    const charWidth = width / (value.length + 1);
    const colors = ["#065f46", "#0e7490", "#0f172a"];

    value.split("").forEach((char, i) => {
      ctx.save();
      const x = charWidth * (i + 0.8);
      const y = height / 2 + (Math.random() * 10 - 5);
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 30 - 15) * (Math.PI / 180));
      ctx.font = "bold 24px monospace";
      ctx.fillStyle = colors[i % colors.length];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(6,182,212,${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // const refresh = async() => {
  //   const newText = generateCaptchaText();
  //   setText(newText);

  //   draw(newText);
  // };

  const refresh = async () => {
    await fetchCaptcha();
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    verify: (input: string) => input.trim().toUpperCase() === text,
    refresh,
  }));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <canvas
        ref={canvasRef}
        width={180}
        height={48}
        style={{ borderRadius: 8, border: "1.5px solid #d1fae5" }}
      />
      <button
        type="button"
        onClick={refresh}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#f0fdf4",
          border: "1.5px solid #d1fae5",
          borderRadius: 8,
          padding: "9px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: "#059669",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  );
});

Captcha.displayName = "Captcha";
export default Captcha;