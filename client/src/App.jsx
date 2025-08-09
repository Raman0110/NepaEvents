import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { Signup } from "./Components/Users/Signup";
import { HomePage } from "./Components/Users/HomePage";
import { NavBar } from "./Components/Users/NavBar";
import { Footer } from "./Components/Users/Footer";
import { Event } from "./Components/Users/Event";
import { AboutUs } from "./Components/Users/AboutUs";
import { ContactUs } from "./Components/Users/ContactUs";
import { BookVenue } from "./Components/Users/BookVenue";
import MyBooking from "./Components/Users/MyBooking";
import MyTickets from "./Components/Users/MyTickets";
import MyPayments from "./Components/Users/MyPayments";
import EventDetail from "./Components/Users/EventDetail";
import VenueDetail from "./Components/Users/VenueDetail";
import { Login } from "./Components/Users/Login";
import PaymentSuccess from "./Components/Users/PaymentSuccess";
import PaymentFailure from "./Components/Users/PaymentFailure";
import Favourites from "./Components/Users/Favourites";
import Notifications from "./Components/Users/Notifications";
import EditProfile from "./Components/Users/EditProfile";

import { AdminEventPage } from "./Components/Admin/AdminEventPage";
import { AdminHome } from "./Components/Admin/AdminHome";
import { AdminSidebar } from "./Components/Admin/AdminSidebar";
import { AdminVenuePage } from "./Components/Admin/AdminVenuePage";
import { AuthProvider } from "./Context/AuthContext";
import { ProtectedRoute } from "./Middleware/ProtectedRoutes"; // Import ProtectedRoute
import AdminCategory from "./Components/Admin/AdminCategory";
import Userlist from "./Components/Admin/Userlist";
import { AdminPayment } from "./Components/Admin/AdminPayment";
import EventPaymentSuccess from "./Components/Users/EventPaymentSuccess";
import EventPaymentFailure from "./Components/Users/EventPaymentFailure";
import EventRevenue from "./Components/Users/EventRevenue";


// Layout for Users
const UserLayout = ({ children }) => (
  <>
    <NavBar />
    {children}
    <Footer />
  </>
);

// Layout for Admin
const AdminLayout = ({ children }) => (
  <div className="flex">
    <AdminSidebar />
    <div className="ml-64 p-8 w-full">{children}</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<UserLayout><Signup /></UserLayout>} />
          <Route element={<ProtectedRoute adminOnly={false} />}>
            <Route path="/" element={<UserLayout><HomePage /></UserLayout>} />
            <Route path="/event" element={<UserLayout><Event /></UserLayout>} />
            <Route path="/aboutus" element={<UserLayout><AboutUs /></UserLayout>} />
            <Route path="/contactus" element={<UserLayout><ContactUs /></UserLayout>} />
            <Route path="/mybookings" element={<UserLayout><MyBooking /></UserLayout>} />
            <Route path="/mytickets" element={<UserLayout><MyTickets /></UserLayout>} />
            <Route path="/mypayments" element={<UserLayout><MyPayments /></UserLayout>} />
            <Route path="/event/:id" element={<UserLayout><EventDetail /></UserLayout>} />
            <Route path="/venue/:id" element={<UserLayout><VenueDetail /></UserLayout>} />
            <Route path="/bookvenue" element={<UserLayout><BookVenue /></UserLayout>} />
            <Route path="/favourites" element={<UserLayout><Favourites /></UserLayout>} />
            <Route path="/editprofile" element={<UserLayout><EditProfile /></UserLayout>} />
            <Route path="/notifications" element={<UserLayout><Notifications /></UserLayout>} />
            <Route path="/eventRevenue/:title" element={<UserLayout><EventRevenue /></UserLayout>} />
            <Route path="/payment-success" element={<UserLayout><PaymentSuccess /></UserLayout>} />
            <Route path="/payment-failure" element={<UserLayout><PaymentFailure /></UserLayout>} />
            <Route path="/event-payment-success" element={<UserLayout><EventPaymentSuccess /></UserLayout>} />
            <Route path="/event-payment-failure" element={<UserLayout><EventPaymentFailure /></UserLayout>} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin/userlist" element={<AdminLayout><Userlist /></AdminLayout>} />
            <Route path="/admin/home" element={<AdminLayout><AdminHome /></AdminLayout>} />
            <Route path="/admin/events" element={<AdminLayout><AdminEventPage /></AdminLayout>} />
            <Route path="/admin/venues" element={<AdminLayout><AdminVenuePage /></AdminLayout>} />
            <Route path="/admin/category" element={<AdminLayout><AdminCategory /></AdminLayout>} />
            <Route path="/admin/payment" element={<AdminLayout><AdminPayment /></AdminLayout>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;