import { Route, Routes } from "react-router-dom";
import Employee from "../Pages/User/Employee";
import AddEmployee from "../Components/User/Employee/AddEmployee";
import EditEmployee from "../Components/User/Employee/EditEmployee";
import PageNotFound from "../Pages/Partials/PageNotFound";

const UserRouter = () => (
    <Routes>
        <Route path="/Employee" element={<Employee />} />
        <Route path="/AddEmployee" element={<AddEmployee />} />
        <Route path="/EditEmployee/:id" element={<EditEmployee />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default UserRouter;
