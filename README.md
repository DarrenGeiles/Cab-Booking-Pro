## 🚗 Cab Booking Portal for Corporate Offices

A full-stack web application designed to manage corporate cab bookings efficiently.
Built with **Next.js**, **Node.js/Express**, **PostgreSQL (Supabase)**, **RabbitMQ**, **Google Maps**, and **JWT-based authentication**.

---

## 📌 **Project Overview**

The Cab Booking Portal enables corporate offices to book cabs for employees safely and efficiently.
It includes company/vendor logins, real-time booking updates, manual bookings, open market fallback logic, driver/vehicle management, invoice management, and more.

The goal of this system is to unify transportation management, reduce booking delays, and automate vendor coordination.

---

## 🛠️ **Suggested Tech Stack**

### **Frontend**

* **Next.js** with TypeScript
* **Shadcn UI components**
* **Plain CSS (globals.css)** — no Tailwind (as per project requirement)

### **Backend**

* **Node.js + Express.js**
* **RabbitMQ** — real-time communication between company & vendor
* **PostgreSQL / Supabase**
* **Prisma ORM** (optional)
* **Google Maps API / Mapbox** for map integration
* **JWT Authentication** (Role-Based: Company & Vendor)

### **Deployment**

* Vercel, Netlify, or Railway
* Docker (optional)

---

## 🧩 **Workflow Summary**

### **1. Company Login & Booking**

* Company creates booking by filling out:

  * Guest name & phone
  * Pickup & Drop location
  * Guest email
  * Trip details
  * Vehicle type
  * Additional notes

* Once submitted:

  1. Booking is added to **“Upcoming Bookings”** for both company and vendor.
  2. Vendors receive real-time updates through RabbitMQ.

---

### **2. Vendor Acceptance**

After receiving a booking:

* **Vendor Accepts**: Status becomes **"Accepted"**
* **Vendor Rejects**: Status becomes **"Cancelled"**
* **Vendor is Unreachable**:

  * Goes into **"Open Market" mode**
  * All vendors are notified, and the first one to accept is assigned

---

### **3. Trip Lifecycle**

* After the vendor assigns a driver and vehicle:

  * Status becomes **"Starting"**
* Driver picks up guest → **"Started"**
* Trip completed → **"Completed"**
* All updates are reflected in the company dashboard.

---

## 🚘 **Vendor Dashboard Features**

### **Vendor Booking Requests**

Vendors can:

* See new booking requests
* Accept/Reject requests
* View booking history
* Manage trip statuses

A real-time table includes:

* Guest name
* Employee name
* Pickup/Drop location
* Booking time
* Trip type
* Vehicle category
* Driver name
* Contact details
* Payment status

---

## 🧑‍✈️ **Driver Management**

Vendors can:

* View/Add/Edit/Remove driver information
* Manage driver details such as:

  * Name
  * License Number
  * Phone
  * Address
  * Joining Date
  * Salary info
  * Aadhar/PAN
  * Emergency contact
  * Experience details

---

## 🚗 **Vehicle Management**

Vendors can:

* Add/Edit/Delete vehicles
* Track:

  * Vehicle type
  * Model
  * Number plate
  * Make
  * RC details
  * Fitness check
  * Insurance dates

---

## 💸 **Invoice & Billing**

* View payments
* Download reports
* Track completed/pending/approved trips
* Generate invoices

---

## 📝 **Manual Booking (For Vendors)**

Vendors can create manual bookings for:

* Guest walk-ins
* Offline requests
* Bookings from non-digital channels

All manually created bookings appear in **“Upcoming Bookings”** with full control.

---

## 🌐 **Vendor Open Market Feature**

If the assigned vendor is unavailable:

1. Booking goes into the **Open Market Pool**
2. All vendors receive a real-time "open request"
3. First vendor to accept gets the booking
4. Status flows back to the company dashboard

This system ensures 100% booking reliability.

---

## 🔔 **Notification System**

Notifications are triggered when:

* Vendors accept/cancel bookings
* Trips start/complete
* Driver/vehicle is assigned
* Open market request is accepted

---

## 🔐 **Role-Based Access**

Two roles:

### **Company**

* Create bookings
* View assigned vendor
* Track trip status
* View invoices

### **Vendor**

* Accept bookings
* Assign drivers & vehicles
* Manage drivers & vehicles
* Update trip lifecycle
* Access invoices

---

## 📦 **Project Deliverables**

The final system includes:

### ✔ Company Dashboard

### ✔ Vendor Dashboard

### ✔ JWT Auth

### ✔ Real-time Messaging (RabbitMQ)

### ✔ Google Maps API Integration

### ✔ Open Market Logic

### ✔ Manual Bookings

### ✔ Driver & Vehicle Management

### ✔ Invoice Module

### ✔ Deployment on Vercel/Railway

---

## 🚀 **How to Run the Project**

### **Frontend (Next.js)**

```bash
cd frontend
npm install
npm run dev
```

### **Backend (Node.js + Express + RabbitMQ)**

```bash
cd backend
npm install
npm start
```

### **Environment Variables**

Create `.env` file with:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_MAPS_API_KEY=
JWT_SECRET=
RABBITMQ_URL=
DATABASE_URL=
```

---

## 🤝 Contributing

Contributions are welcome!
Fork the repo → Create a branch → Commit changes → Create a pull request.

---

## 📄 License

This project is for **educational and capstone purposes**.

---

