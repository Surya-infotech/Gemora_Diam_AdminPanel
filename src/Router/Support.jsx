import { Route, Routes } from "react-router-dom";
import ContactUs from "../Pages/System/ContactUs";
import Subscribers from "../Pages/System/Subscribers";
import FAQ from "../Pages/System/FAQ";
import AddFAQ from "../Components/System/FAQ/AddFAQ";
import EditFAQ from "../Components/System/FAQ/EditFAQ";
import Policy from "../Pages/System/Policy";
import AddPolicy from "../Components/System/Policy/AddPolicy";
import EditPolicy from "../Components/System/Policy/EditPolicy";
import PageNotFound from "../Pages/Partials/PageNotFound";

const SupportRouter = () => (
    <Routes>
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/Subscribers" element={<Subscribers />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/AddFAQ" element={<AddFAQ />} />
        <Route path="/EditFAQ/:id" element={<EditFAQ />} />
        <Route path="/Policy" element={<Policy />} />
        <Route path="/AddPolicy" element={<AddPolicy />} />
        <Route path="/EditPolicy/:id" element={<EditPolicy />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default SupportRouter;
