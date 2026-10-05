import { Route, Routes } from "react-router-dom";
import Dashboard from "../Pages/Home/Dashboard";
import LoginActivity from "../Pages/General/LoginActivity";
import PageNotFound from "../Pages/Partials/PageNotFound";

const MainRouter = () => (
    <Routes>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/LoginActivity" element={<LoginActivity />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default MainRouter;
