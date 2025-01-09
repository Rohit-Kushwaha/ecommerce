const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (only once)
const serviceAccount = require("../notikey/noti.json"); // Path to your Firebase service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send a notification
const sendNotifications = async (deviceToken, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: deviceToken, // FCM Device Token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Controller to handle notification requests
const notificationCtrl = {
  sendNotification: async (req, res) => {
    try {
      const deviceToken =
        "cR-bsRwSR5-oD4oAbb0bT_:APA91bFTkLFv_haSzpp-CPiEqamL4ru27EoZK8GYYJU7HZ25YhlWO4bewxIaOfxmYCJut1PxHwVAjJ2V7ewfuvUyfM7MOtAp28pcccBp4h-NIc-xthU_UXc";

      const title = "Hello!";
      const body = "This is a test notification.";

      const response = await sendNotifications(deviceToken, title, body);
      res.json({ msg: "Notification sent successfully", response });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification", details: error.message });
    }
  },
};

module.exports = notificationCtrl;
