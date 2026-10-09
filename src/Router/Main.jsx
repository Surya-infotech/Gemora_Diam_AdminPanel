import { Route, Routes } from "react-router-dom";
import Dashboard from "../Pages/Home/Dashboard";
import EmployeeDashboard from "../Pages/Home/EmployeeDashboard";
import Order from "../Pages/Home/Order";
import OrderDetails from "../Pages/Home/OrderDetails";
import Profile from "../Pages/General/Profile";
import LoginActivity from "../Pages/General/LoginActivity";
import ChangePassword from "../Pages/General/ChangePassword";
import PageNotFound from "../Pages/Partials/PageNotFound";
import { usePermissions } from "../Hooks/usePermissions";

const DashboardRoute = () => {
    const { isEmployee } = usePermissions();
    return isEmployee ? <EmployeeDashboard /> : <Dashboard />;
};

const MainRouter = () => (
    <Routes>
        <Route path="/Dashboard" element={<DashboardRoute />} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/Order" element={<Order />} />
        <Route path="/OrderDetails/:id" element={<OrderDetails />} />
        <Route path="/OrderOverview/:id" element={<OrderDetails />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/LoginActivity" element={<LoginActivity />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default MainRouter;
