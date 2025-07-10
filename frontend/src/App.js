import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Import all your page components
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PeoplePage from "./pages/PeoplePage";
import LocationPage from "./pages/LocationPage";
import SchedulePage from "./pages/SchedulePage";
import NewsFeedPage from "./pages/NewsFeedPage";
import MePage from "./pages/MePage";
import AcceptInvitePage from './pages/AcceptInvitePage';
import ReportPage from './pages/ReportPage';
import ProfilePage from "../src/pages/ProfilePage";
import AdminProfilePage from "../src/pages/AdminProfilePage ";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OpenSchedulePage from "./pages/OpenSchedulePage";
import PricingComponent from "./pages/PricingComponent";
import Solutions from './pages/Solutions';
import Contactpage from './pages/Contactpage';
import TermsandConditions from './pages/TermsandConditions';
import Privacypolicy from './pages/Privacypolicy';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BusinessProfile from "./pages/BusinessProfile";
import SuperAdminPage from "./pages/SuperAdminPage";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null; // You could also show a loading spinner here
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
const RoleBasedProfile = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminProfilePage /> : <ProfilePage />;
};


function App() {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/invite/:token" element={<AcceptInvitePage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
          <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={<PricingComponent />} />
          <Route path="/solutions" element={<Solutions/>}/>
          <Route path="/contact" element={<Contactpage/>}/>
          <Route path="/tandc" element={<TermsandConditions/>}/>
          <Route path="/privacypolicy" element={<Privacypolicy/>}/>


          <Route
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage /> 
              </ProtectedRoute>
            }
          >
            {/* Nested protected routes that appear within the DashboardPage layout */}
            <Route path="me" element={<MePage />} />
            <Route path="people" element={<PeoplePage />} />
             <Route path="profile" element={ <ProtectedRoute> <RoleBasedProfile /> </ProtectedRoute> } />
            <Route path="locations" element={<LocationPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="openschedules" element={<OpenSchedulePage/>}/>
            <Route path="newsfeed" element={<NewsFeedPage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="businessprofile" element={<BusinessProfile/>}/>
            <Route path="/superadmin" element={<SuperAdminPage/>}/>
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
          <Route path='LandingPage' element></Route>
        </Routes>
      </AuthProvider>
    </Router>
    </>
  );
}

export default App;