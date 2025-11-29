// utils/adminNotification.js
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";

// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_APP_ADMIN,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send notification email to all admins about a new order
 */
const mailAdminsNewOrder = async (order) => {
  try {
    // Get list of admin emails
    const admins = await userModel
      .find({ role: "admin", isActive: true })
      .select("email name")
      .lean();

    if (admins.length === 0) {
      console.log("No admins found to send notifications");
      return;
    }

    var adminEmails = admins.map((a) => a.email).join(",");
    const customerName = `${order.address.firstName || ""} ${order.address.lastName || ""}`.trim();
    const orderLink = `${process.env.ADMIN_URL}/orders`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #d32f2f;">New Order!</h2>
        <hr>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Customer:</strong> ${customerName || "Guest"}</p>
        <p><strong>Phone:</strong> ${order.address.phone || "N/A"}</p>
        <p><strong>Email:</strong> ${order.address.email || "N/A"}</p>
        <p><strong>Shipping Address:</strong> ${order.address.street}, ${order.address.city}, ${order.address.state}</p>
        <p><strong>Total Amount:</strong> <span style="font-size: 18px; color: #d32f2f; font-weight: bold;">
          ${order.amount.toLocaleString("vi-VN")}₫
        </span></p>
        <p><strong>Payment Method:</strong> 
          ${order.paymentMethod === "cod" ? "Cash on Delivery (COD)" :
        order.paymentMethod === "stripe" ? "Paid via Stripe" : "PayPal"}
        </p>
        <p><strong>Payment Status:</strong> 
          <span style="color: ${order.paymentStatus === "paid" ? "green" : "orange"}; font-weight: bold;">
            ${order.paymentStatus.toUpperCase()}
          </span>
        </p>
        <p><strong>Order Time:</strong> ${new Date(order.date).toLocaleString("vi-VN")}</p>
        <p><strong>Number of Items:</strong> ${order.items.length} items</p>
        
        <div style="margin: 20px 0;">
          <a href="${orderLink || '#'}" style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            VIEW ORDER DETAILS NOW
          </a>
        </div>
        
        <hr>
        <small>This is an automated email from your store system.</small>
      </div>
    `;

    await transporter.sendMail({
      from: `"Your Store - MuaNhanh" <${process.env.ADMIN_EMAIL}>`,
      to: adminEmails,
      subject: `New Order #${order._id.toString().slice(-8).toUpperCase()} - ${customerName || "Guest"}`,
      html,
    });

    console.log(`Sent new order notification to admins: ${adminEmails}`);
  } catch (error) {
    console.error("Error sending new order notification to admins:", error);
    // Do not throw error to avoid crashing order creation
  }
};

/**
 * Send welcome email to new user upon registration
 */
const mailWelcomeNewUser = async (user) => {
  try {
    if (!user || !user.email) {
      console.log("No user information available to send welcome email");
      return;
    }

    const userName = user.name || user.email.split("@")[0] || "Customer";
    const loginLink = `${process.env.CLIENT_URL || "http://localhost:5174"}/signin`;
    const shopLink = process.env.CLIENT_URL || "http://localhost:5174";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to MuaNhanh!</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
          .body { padding: 40px 30px; color: #333; text-align: center; }
          .greeting { font-size: 22px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .message { font-size: 16px; line-height: 1.6; color: #555; margin: 20px 0; }
          .btn { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 16px;
            margin: 25px 0;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s;
          }
          .btn:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(102, 126, 234, 0.5); }
          .features { margin: 40px 0; text-align: left; background: #f8f9ff; padding: 25px; border-radius: 12px; }
          .feature { margin: 15px 0; display: flex; align-items: flex-start; }
          .feature span { font-size: 20px; margin-right: 15px; }
          .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
          .footer a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MuaNhanh!</h1>
            <p>Thank you for joining our shopping community</p>
          </div>

          <div class="body">
            <div class="greeting">Hello ${userName}!</div>
            <div class="message">
              Your account has been successfully created!<br>
              Now you can start shopping with thousands of quality products, great prices, and fast delivery.
            </div>

            <a href="${shopLink}" class="btn" target="_blank">
              START SHOPPING NOW
            </a>

            <div class="features">
              <div class="feature"><span>New member benefits</span> Get up to $50 off your first order</div>
              <div class="feature"><span>2-hour fast delivery</span> Within Hanoi & Ho Chi Minh City</div>
              <div class="feature"><span>Easy returns</span> Within 30 days if not satisfied</div>
              <div class="feature"><span>24/7 Support</span> Always ready to help you</div>
            </div>

            <p style="color: #7f8c8d; font-size: 14px;">
              You need to log in to manage orders and track personal offers:<br>
              <a href="${loginLink}" style="color: #667eea; text-decoration: underline;">Log in to your account</a>
            </p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MuaNhanh - Fast Shopping</p>
            <p>
              Email: <a href="mailto:support@muaNhanh.com">support@muaNhanh.com</a> | 
              Hotline: 1900 1234
            </p>
            <p>Thank you for choosing MuaNhanh!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"MuaNhanh - Ecomerce Shop" <${process.env.ADMIN_EMAIL}>`,
      to: user.email,
      subject: `Welcome ${userName} to MuaNhanh! 🎉 Special offers await you`,
      html,
    });

    console.log(`Welcome email sent to: ${user.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};

const mailOrderConfirmation = async (order, user) => {
  try {
    if (!order || !user || !user.email) {
      console.log("Missing order or user information to send order confirmation email");
      return;
    }

    // Get user's name or fallback to email prefix
    const userName = user.name || user.email.split("@")[0] || "Khách hàng";
    const fullName = `${order.address.firstName} ${order.address.lastName}`.trim();

    // Format currence (USD)
    const formatPrice = (price) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    };

    // Format order date
    const orderDate = new Date(order.date).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Link details order page
    const orderLink = `${process.env.CLIENT_URL || "http://localhost:5174"}/checkout/${order._id}`;
    const shopLink = process.env.CLIENT_URL || "http://localhost:5174";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MuaNhanh - Placed Order! #${order._id.toString().slice(-6).toUpperCase()}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
          .body { padding: 40px 30px; color: #333; }
          .greeting { font-size: 22px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; text-align: center; }
          .message { font-size: 16px; line-height: 1.6; color: #555; margin: 20px 0; text-align: center; }
          .order-id { font-size: 18px; font-weight: bold; color: #667eea; margin: 20px 0; text-align: center; }
          .btn { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 16px;
            margin: 25px auto;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s;
          }
          .btn:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(102, 126, 234, 0.5); }
          table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f8f9ff; font-weight: 600; color: #2c3e50; }
          .total-row { font-weight: bold; font-size: 18px; color: #2c3e50; }
          .text-right { text-align: right; }
          .address-box { background: #f8f9ff; padding: 20px; border-radius: 12px; margin: 25px 0; }
          .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
          .footer a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for trusting MuaNhanh</p>
          </div>

          <div class="body">
            <div class="greeting">Hello ${fullName || userName}!</div>
            <div class="message">
              We have received your order on <strong>${orderDate}</strong>.<br>
              Your order is being processed and will be delivered to you soon.
            </div>

            <div class="order-id">Order ID: #${order._id.toString().slice(-6).toUpperCase()}</div>

            <div style="text-align: center;">
              <a href="${orderLink}" class="btn" target="_blank">
                VIEW ORDER DETAILS
              </a>
            </div>

            <h3 style="text-align: center; color: #2c3e50; margin-top: 40px;">Thông tin sản phẩm</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th class="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>x${item.quantity}</td>
                    <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td class="text-right"><strong>${formatPrice(order.amount)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="address-box">
              <h4>Delivery Address:</h4>
              <p>
                <strong>${fullName}</strong><br>
                ${order.address.street}, ${order.address.city}, ${order.address.state}<br>
                ${order.address.country} • Postal Code: ${order.address.zipcode}<br>
                Phone: ${order.address.phone}
              </p>
            </div>

            <p style="text-align: center; color: #7f8c8d; font-size: 14px;">
              You can track your order status anytime at:<br>
              <a href="${orderLink}" style="color: #667eea; text-decoration: underline;">My Order Page</a>
            </p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MuaNhanh - Fast Shopping</p>
            <p>
              Email: <a href="mailto:support@muaNhanh.com">support@muaNhanh.com</a> | 
              Hotline: 1900 1234
            </p>
            <p>Thank you for shopping with MuaNhanh!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"MuaNhanh - Ecommerce Shop" <${process.env.ADMIN_EMAIL}>`,
      to: user.email,
      subject: `Order Confirmation #${order._id.toString().slice(-6).toUpperCase()} - MuaNhanh`,
      html,
    });

    console.log(`Order confirmation email sent to: ${user.email} (Order: ${order._id})`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error.message);
  }
};

export { mailAdminsNewOrder, mailWelcomeNewUser, mailOrderConfirmation };