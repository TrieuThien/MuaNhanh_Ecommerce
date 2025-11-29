// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { useState, useRef, useEffect } from "react";
// import { logo } from "../assets/images";
// import { FaUser, FaCog, FaChevronDown, FaUserShield } from "react-icons/fa";
// import { MdNotifications, MdDashboard } from "react-icons/md";
// import { serverUrl } from "../../config";
// import io from "socket.io-client";

// let socket;

// const Navbar = () => {
//   const { user } = useSelector((state) => state.auth);
//   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const userMenuRef = useRef(null);
//   const notificationRef = useRef(null);
//   const [avatar, setAvatar] = useState(user?.avatar);

//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   // Get realtime notifications
//   useEffect(() => {
//     // Connect to socket (only once)
//     socket = io(serverUrl);

//     // Join admin room
//     socket.emit("join-admin-room", {
//       role: "admin",
//       name: "Admin",
//     });

//     // Receive new order notifications
//     socket.on("new-order", (notif) => {
//       setNotifications((prev) => [notif, ...prev]);
//       setUnreadCount((c) => c + 1);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         setIsUserMenuOpen(false);
//       }
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(event.target)
//       ) {
//         setIsNotificationOpen(false);
//       }
//     };

//     if (user) {
//       fetch(`${serverUrl}/api/user/${user.id}/avatar`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           setAvatar(data.avatarUrl);
//         });
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [user]);
//   const getUserInitials = (name) => {
//     if (!name) return "A";
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Mock data
//   // const notifications = [
//   //   // { id: 1, title: "New order received", time: "2 min ago", type: "order" },
//   //   // { id: 2, title: "Low stock alert", time: "1 hour ago", type: "warning" },
//   //   // { id: 3, title: "User registration", time: "3 hours ago", type: "user" },
//   // ];

//   const userMenuItems = [
//     { icon: FaUser, label: "Profile", path: "/users" },
//     { icon: MdDashboard, label: "Dashboard", path: "/" },
//     { icon: FaCog, label: "Settings", path: "/settings" },
//   ];

//   return (
//     <header className="border-b border-gray-200 w-full sticky top-0 left-0 z-40 bg-white shadow-sm">
//       <div className="py-2.5 flex items-center justify-between px-4">
//         {/* Logo Section */}
//         <Link to={"/"} className="flex items-center gap-3 group">
//           <img
//             src={logo}
//             alt="logo"
//             className="w-20 sm:w-24 transition-transform duration-200 group-hover:scale-105"
//           />
//           <div className="hidden sm:block">
//             <p className="text-xs uppercase font-bold tracking-wide text-blue-600">
//               Admin Panel
//             </p>
//             <p className="text-xs text-gray-500">Dashboard v1.0</p>
//           </div>
//         </Link>

//         {/* Right Section */}
//         <div className="flex items-center gap-3 sm:gap-6">
//           {/* Admin Badge */}
//           <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
//             <FaUserShield className="text-blue-600 text-sm" />
//             <span className="text-sm font-medium text-blue-700">Admin</span>
//           </div>

//           {/* Notifications */}
//           <div className="relative" ref={notificationRef}>
//             <button
//               onClick={() => setIsNotificationOpen(!isNotificationOpen)}
//               className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
//             >
//               <MdNotifications className="text-xl" />
//               <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
//                 {notifications.length}
//               </span>
//             </button>

//             {/* Notifications Dropdown */}
//             {isNotificationOpen && (
//               <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
//                 <div className="px-4 py-3 border-b border-gray-100">
//                   <h3 className="font-semibold text-gray-900">Notifications</h3>
//                   <p className="text-sm text-gray-500">
//                     {notifications.length} new notifications
//                   </p>
//                 </div>
//                 <div className="max-h-64 overflow-y-auto">
//                   {notifications.map((notification) => (
//                     <div
//                       key={notification.id}
//                       className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-b-0"
//                     >
//                       <p className="text-sm font-medium text-gray-900">
//                         {notification.title}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {notification.time}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="px-4 py-2 border-t border-gray-100">
//                   <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
//                     View all notifications
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* User Menu */}
//           {user && (
//             <div className="relative" ref={userMenuRef}>
//               {/* User Info - Desktop */}
//               <div className="flex items-center gap-2">
//                 <div className="hidden lg:flex items-center gap-3 text-sm text-gray-600 mr-4">
//                   <div className="text-right">
//                     <p className="font-semibold text-gray-900">
//                       {user.name || user.email}
//                     </p>
//                     <p className="text-xs text-gray-500">Administrator</p>
//                   </div>
//                 </div>

//                 {/* User Avatar & Dropdown */}
//                 <button
//                   onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
//                   className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   {avatar ? (
//                     <img
//                       src={avatar}
//                       alt={user.name}
//                       className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                     />
//                   ) : (
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-semibold text-sm">
//                       {getUserInitials(user?.name || user?.email)}
//                     </div>
//                   )}
//                   <FaChevronDown
//                     className={`text-gray-600 text-sm transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""
//                       }`}
//                   />
//                 </button>
//               </div>

//               {/* User Dropdown Menu */}
//               {isUserMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
//                   {/* User Info in Dropdown */}
//                   <div className="px-4 py-3 border-b border-gray-100">
//                     <p className="font-semibold text-gray-900 truncate">
//                       {user.name || user.email}
//                     </p>
//                     <p className="text-sm text-gray-500 truncate">
//                       {user.email}
//                     </p>
//                     <div className="flex items-center gap-1 mt-2">
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
//                         Online
//                       </span>
//                     </div>
//                   </div>

//                   {/* Menu Items */}
//                   <div className="py-1">
//                     {userMenuItems.map((item, index) => (
//                       <Link
//                         key={index}
//                         to={item.path}
//                         onClick={() => setIsUserMenuOpen(false)}
//                         className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
//                       >
//                         <item.icon className="text-gray-400" />
//                         {item.label}
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { logo } from "../assets/images";
import { FaUser, FaCog, FaChevronDown, FaUserShield } from "react-icons/fa";
import { MdNotifications, MdDashboard } from "react-icons/md";
import { serverUrl } from "../../config";
import io from "socket.io-client";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar);

  const socket = useRef(null);

  // Notification state - only stored in memory
  const [notifications, setNotifications] = useState([]); // includes both read and unread
  const unreadCount = notifications.filter(n => !n.read).length;

  // Connect to Socket.io + receive realtime notifications
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    // Create socket once
    socket.current = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.current.emit("join-admin-room", { role: "admin" });

    // Debugging connection
    // socket.current.on("connect", () => {
    //   console.log("Socket connected:", socket.current.id);
    // });

    socket.current.on("new-order", (notif) => {
      console.log("New order:", notif);
      setNotifications(prev => [{
        ...notif,
        id: notif.id || Date.now(),
        read: false,
        time: new Date().toLocaleString("vi-VN")
      }, ...prev]);
    });

    socket.current.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    // Cleanup when component unmount
    return () => {
      socket.current?.disconnect();
    };
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user avatar
  useEffect(() => {
    if (user) {
      fetch(`${serverUrl}/api/user/${user.id}/avatar`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setAvatar(data.avatarUrl);
        });
    }
  }, [user]);

  // Mark as read one notification
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Delete all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUserInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const userMenuItems = [
    { icon: FaUser, label: "Profile", path: "/users" },
    { icon: MdDashboard, label: "Dashboard", path: "/" },
    { icon: FaCog, label: "Settings", path: "/settings" },
  ];

  return (
    <header className="border-b border-gray-200 w-full sticky top-0 left-0 z-40 bg-white shadow-sm">
      <div className="py-2.5 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to={"/"} className="flex items-center gap-3 group">
          <img src={logo} alt="logo" className="w-20 sm:w-24 transition-transform duration-200 group-hover:scale-105" />
          <div className="hidden sm:block">
            <p className="text-xs uppercase font-bold tracking-wide text-blue-600">Admin Panel</p>
            <p className="text-xs text-gray-500">Dashboard v1.0</p>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <FaUserShield className="text-blue-600 text-sm" />
            <span className="text-sm font-medium text-blue-700">Admin</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
            >
              <MdNotifications className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-medium">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown thông báo */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                <div className="px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearAllNotifications} className="text-xs text-red-600 hover:underline">
                      Delete all
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={"/orders"}
                        onClick={() => {
                          markAsRead(n.id);          
                          setIsNotificationOpen(false); // closed dropdown
                        }}
                        className={`block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-start transition-colors ${!n.read ? "bg-blue-50" : "bg-white"
                          }`}
                      >
                        <div className="flex-1">
                          <p className={`font-medium ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                            {n.title || "Đơn hàng mới!"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-3 text-sm text-gray-600 mr-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
                >
                  {avatar ? (
                    <img src={avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                      {getUserInitials(user?.name || user?.email)}
                    </div>
                  )}
                  <FaChevronDown className={`text-gray-600 text-sm transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 truncate">{user.name || user.email}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {userMenuItems.map((item, index) => (
                      <Link key={index} to={item.path} onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                        <item.icon className="text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;