
import { useState } from "react";
import { getAdminPushToken } from "../firebase/firebase";

// Replace with your existing RTK Query API hook if available.
const API_URL = import.meta.env.VITE_API_URL;

export default function EnablePushNotifications() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const enableNotifications = async () => {
    try {
      setLoading(true);
      setStatus("");

      const token = await getAdminPushToken();

      const response = await fetch(`${API_URL}/push/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not register this device."
        );
      }

      setStatus("Notifications enabled on this device.");
    } catch (error) {
      console.error("Enable notifications error:", error);
      setStatus(error.message || "Unable to enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Enabling..." : "Enable Push Notifications"}
      </button>

      {status && (
        <p role="status" className="text-sm">
          {status}
        </p>
      )}
    </div>
  );
}
