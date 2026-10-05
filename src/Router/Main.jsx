import { Route, Routes } from "react-router-dom";
import Dashboard from "../Pages/Home/Dashboard";
import Profile from "../Pages/General/Profile";
import LoginActivity from "../Pages/General/LoginActivity";
import ChangePassword from "../Pages/General/ChangePassword";
import PageNotFound from "../Pages/Partials/PageNotFound";

const MainRouter = () => (
    <Routes>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/LoginActivity" element={<LoginActivity />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default MainRouter;
