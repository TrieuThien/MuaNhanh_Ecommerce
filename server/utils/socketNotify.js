// utils/socketNotify.js
import { getIO } from "../socket.js";

// Mock notifications array
// const notifications = [
// // { id: 1, title: "New order received", time: "2 min ago", type: "order" },
// // { id: 2, title: "Low stock alert", time: "1 hour ago", type: "warning" },
// // { id: 3, title: "User registration", time: "3 hours ago", type: "user" },
// ];

const skNotifyNewOrder = (order) => {
    try {
        const io = getIO();

        const shortId = order._id.toString().slice(-8).toUpperCase();

        const notification = {
            id: shortId,
            title: "New order received #" + shortId,
            time: new Date().toISOString(),
            type: "order",
        };

        // Send to all online admins
        io.to("admin-room").emit("new-order", notification);

        // Also send the count of unread orders (if you want to display a badge)
        io.to("admin-room").emit("unread-count", 1); // or calculate the total unread count from DB
        console.log("Sent new order realtime notification");
    } catch (error) {
        console.error("Error sending socket notification:", error);
    }
};

const skNotifyNewUser = (user) => {
    try {
        const io = getIO();

        const shortId = user._id.toString().slice(-8).toUpperCase();

        const notification = {
            id: shortId,
            title: "New user registered #" + shortId,
            time: new Date().toISOString(),
            type: "user",
        };

        // Send to all online admins
        io.to("admin-room").emit("new-order", notification);

        // Also send the count of unread orders (if you want to display a badge)
        io.to("admin-room").emit("unread-count", 1); // or calculate the total unread count from DB
        console.log("Sent new order realtime notification");
    } catch (error) {
        console.error("Error sending socket notification:", error);
    }
};

export { skNotifyNewOrder, skNotifyNewUser };