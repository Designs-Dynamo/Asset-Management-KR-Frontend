import React from "react";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import Login from "./Pages/Login";
import AssetDetails from "./Pages/assetdetails";
import Requestwizard from "./components/requestwizard";
import AdminDashboard from "./Pages/admindashboard";
import Adminassets from "./admincomponents/Adminassets";
import Reports from "./Pages/Report";
import BranchAssets from "./Pages/Assets";
import BranchDashboard from "./Pages/BranchDashoard";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageAsset from "./Pages/Editasset";
import SuccessPage from "./Pages/success";
import BranchRequests from "./components/Branchrequests";
import CreateAsset from "./admincomponents/createasset";
import CreateUser from "./admincomponents/createuser";
import UserList from "./admincomponents/users";
import ManagerAssets from "./Pages/ManagerAssets";
import ManagerRequests from "./Pages/ManagerRequest";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

function App() {
  return (
    <>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/assetdetails/:id" element={<AssetDetails />} />
            <Route path="/assetdetails/:id/edit" element={<ManageAsset />} />
            <Route path="/requests" element={<Requestwizard />} />
            <Route path="/allassets" element={<Adminassets />} />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/:branchId/branchrequests"
              element={<BranchRequests />}
            />
            <Route path="/success" element={<SuccessPage />} />
            {/* ADMIN ROUTES: Only 'ADMIN' can enter */}
            <Route
              path="/admindashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* BRANCH ROUTES: 'BRANCH_USER' or 'ADMIN' can enter */}
            {/* The ProtectedRoute will internally block User A from accessing User B's URL */}
            <Route
              path="/:branchId/dashboard"
              element={
                <ProtectedRoute allowedRoles={["BRANCH_USER", "ADMIN"]}>
                  <BranchDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/:branchId/assets"
              element={
                <ProtectedRoute allowedRoles={["BRANCH_USER", "ADMIN"]}>
                  <BranchAssets />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-asset"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreateAsset />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-user"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreateUser />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UserList />
                </ProtectedRoute>
              }
            />

            {/* REGION MANAGER ROUTES */}
            <Route
              path="/:regionId/manager/requests"
              element={
                <ProtectedRoute allowedRoles={["REGION_MANAGER"]}>
                  <ManagerRequests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/:regionId/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={["REGION_MANAGER"]}>
                  <ManagerAssets />
                </ProtectedRoute>
              }
            />

                      <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>


        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
