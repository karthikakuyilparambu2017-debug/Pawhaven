import api from "./client";

// Loads Razorpay's checkout script if index.html did not already load it
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load the payment window. Check your internet and try again."));
    document.body.appendChild(script);
  });
}

const makeError = (message, code, extra = {}) => {
  const err = new Error(message);
  err.code = code;
  Object.assign(err, extra);
  return err;
};

/**
 * Opens Razorpay for a booking.
 * Resolves when the payment is paid AND verified by your backend.
 * Rejects with err.code = "CLOSED" | "FAILED" | "VERIFY_FAILED" or a normal API error.
 */
export async function payForBooking(booking, user) {
  await loadRazorpay();

  // 1. Ask your backend to create the order
  const res = await api.post("/payments/create-order", { bookingId: booking._id });
  const order = res.data.data;

  // 2. Open the Razorpay window
  return new Promise((resolve, reject) => {
    let failedReason = "";

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "PawHaven",
      description: `Stay for ${booking.pet?.name || "your pet"}`,
      prefill: { name: user?.name || "", email: user?.email || "" },
      theme: { color: "#2f7d5b" },

      // 3. Payment done in the popup: your backend checks the signature
      handler: async (response) => {
        try {
          const verified = await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve(verified.data);
        } catch (e) {
          reject(
            makeError(
              "Your payment went through, but we could not confirm it yet. Please refresh this page. If the booking still shows unpaid, contact us with this payment ID: " +
                response.razorpay_payment_id,
              "VERIFY_FAILED"
            )
          );
        }
      },

      modal: {
        ondismiss: () =>
          reject(
            failedReason
              ? makeError(failedReason, "FAILED")
              : makeError("Payment window closed.", "CLOSED")
          ),
      },
    });

    // The window stays open after a failed attempt so the user can retry
    rzp.on("payment.failed", (r) => {
      failedReason = r?.error?.description || "Payment failed.";
    });

    rzp.open();
  });
}