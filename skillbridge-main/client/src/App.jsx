import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";

import Professionals from "./pages/Professionals";
import ProfessionalProfile from "./pages/ProfessionalProfile";

import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerRequests from "./pages/CustomerRequests";
import CustomerRequestDetails from "./pages/CustomerRequestDetails";
import CustomerProfile from "./pages/CustomerProfile";

import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderServices from "./pages/ProviderServices";
import ProviderRequests from "./pages/ProviderRequests";
import ProviderProfile from "./pages/ProviderProfile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProviders from "./pages/AdminProviders";
import AdminServices from "./pages/AdminServices";
import AdminRequests from "./pages/AdminRequests";
import AdminMessages from "./pages/AdminMessages";

import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

import PublicLayout from "./components/layouts/PublicLayout";
import CustomerLayout from "./components/layouts/CustomerLayout";
import ProviderLayout from "./components/layouts/ProviderLayout";
import AdminLayout from "./components/layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}
        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/services/:id"
            element={<ServiceDetails />}
          />

          <Route
            path="/professionals"
            element={<Professionals />}
          />

          <Route
            path="/professionals/:id"
            element={<ProfessionalProfile />}
          />

        </Route>


        {/* =========================
            CUSTOMER ROUTES
        ========================= */}
        <Route
          element={
            <ProtectedRoute allowedRole="customer" />
          }
        >
          <Route element={<CustomerLayout />}>

            <Route
              path="/customer/dashboard"
              element={<CustomerDashboard />}
            />

            <Route
              path="/customer/requests"
              element={<CustomerRequests />}
            />

            <Route
              path="/customer/requests/:id"
              element={<CustomerRequestDetails />}
            />

            <Route
              path="/customer/profile"
              element={<CustomerProfile />}
            />

          </Route>
        </Route>


        {/* =========================
            PROVIDER ROUTES
        ========================= */}
        <Route
          element={
            <ProtectedRoute allowedRole="provider" />
          }
        >
          <Route element={<ProviderLayout />}>

            <Route
              path="/provider/dashboard"
              element={<ProviderDashboard />}
            />

            <Route
              path="/provider/services"
              element={<ProviderServices />}
            />

            <Route
              path="/provider/requests"
              element={<ProviderRequests />}
            />

            <Route
              path="/provider/profile"
              element={<ProviderProfile />}
            />

          </Route>
        </Route>


        {/* =========================
            CUSTOMER + PROVIDER
            NOTIFICATIONS
        ========================= */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["customer", "provider"]}
            />
          }
        >
          <Route
            path="/notifications"
            element={<Notifications />}
          />
        </Route>


        {/* =========================
            ADMIN ROUTES
        ========================= */}
        <Route
          element={
            <ProtectedRoute allowedRole="admin" />
          }
        >
          <Route element={<AdminLayout />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin/providers"
              element={<AdminProviders />}
            />

            <Route
              path="/admin/services"
              element={<AdminServices />}
            />

            <Route
              path="/admin/requests"
              element={<AdminRequests />}
            />

            <Route
              path="/admin/messages"
              element={<AdminMessages />}
            />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;