import { Route, Routes } from "react-router-dom";
import Dashboard from "../Pages/Home/Dashboard";
import EmployeeDashboard from "../Pages/Home/EmployeeDashboard";
import Order from "../Pages/Home/Order";
import OrderDetails from "../Pages/Home/OrderDetails";
import AllOrder from "../Pages/Home/AllOrder";
import AddAllOrder from "../Components/Home/AllOrder/AddAllOrder";
import EditAllOrder from "../Components/Home/AllOrder/EditAllOrder";
import Profile from "../Pages/General/Profile";
import LoginActivity from "../Pages/General/LoginActivity";
import ChangePassword from "../Pages/General/ChangePassword";
import PageNotFound from "../Pages/Partials/PageNotFound";
import { usePermissions } from "../Hooks/usePermissions";
import { AdminOnlyGuard, PermissionGuard } from "../Components/PermissionGuard";

const DashboardRoute = () => {
    const { isEmployee } = usePermissions();
    return isEmployee ? <EmployeeDashboard /> : <Dashboard />;
};

const MainRouter = () => (
    <Routes>
        <Route path="/Dashboard" element={<DashboardRoute />} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/Order" element={<AdminOnlyGuard><Order /></AdminOnlyGuard>} />
        <Route path="/OrderDetails/:id" element={<AdminOnlyGuard><OrderDetails /></AdminOnlyGuard>} />
        <Route path="/AllOrder" element={
            <PermissionGuard pageId="allOrder" action="view">
                <AllOrder />
            </PermissionGuard>
        } />
        <Route path="/AddAllOrder" element={
            <PermissionGuard pageId="allOrder" action="add">
                <AddAllOrder />
            </PermissionGuard>
        } />
        <Route path="/EditAllOrder/:id" element={
            <PermissionGuard pageId="allOrder" action="edit">
                <EditAllOrder />
            </PermissionGuard>
        } />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/LoginActivity" element={<LoginActivity />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default MainRouter;
