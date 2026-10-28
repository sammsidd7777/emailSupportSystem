
import { useEffect } from "react";
import { listenForForegroundMessages } from "../../firebase/firebase";

export default function AdminPushListener() {
  useEffect(() => {
    let unsubscribe = () => {};

    listenForForegroundMessages((payload) => {
      const title =
        payload.notification?.title || "New Support Ticket";

      const body =
        payload.notification?.body || "A ticket needs attention.";

      // Replace with your preferred toast library if installed.
      console.log("Foreground push received:", title, body);

      // Dispatch a toast here, or update your notification UI.
    })
      .then((cleanup) => {
        unsubscribe = cleanup;
      })
      .catch((error) => {
        console.error("Foreground notification listener failed:", error);
      });

    return () => unsubscribe();
  }, []);

  return null;
}
