"use client";

import { createOrder } from "@/services/payments";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-sdk")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        alert("Unable to load Razorpay SDK");
        return;
      }

      // Create Order from backend

      const payload = {
        amount : 500,
      }
      const resposne = await createOrder(payload)

      const order = resposne.data;
      console.log('order: ', order);
      

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "My Company",
        description: "Payment",

        handler: async function (resposne: any) {
          console.log("Payment Success", resposne);

          const base_url = process.env.NEXT_PUBLIC_API_URL;

          await fetch(`${base_url}/payments/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(resposne),
          });

          alert("Payment Successful");
        },

        prefill: {
          name: "Sahil",
          email: "test@example.com",
          contact: "9999999999",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error(response.error);
        alert("Payment Failed");
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#059669",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            padding: "4px 12px",
            borderRadius: 99,
            marginBottom: 12,
          }}
        >
          Payments
        </span>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
          }}
        >
          Pay with Razorpay
        </h1>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            marginTop: 30,
            padding: "12px 24px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Pay ₹500"}
        </button>
      </div>
    </div>
  );
}