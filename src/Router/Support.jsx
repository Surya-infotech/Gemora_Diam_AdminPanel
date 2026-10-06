import { Route, Routes } from "react-router-dom";
import ContactUs from "../Pages/Support/ContactUs";
import Subscribers from "../Pages/Support/Subscribers";
import FAQ from "../Pages/Support/FAQ";
import AddFAQ from "../Components/Support/FAQ/AddFAQ";
import EditFAQ from "../Components/Support/FAQ/EditFAQ";
import Policy from "../Pages/Support/Policy";
import AddPolicy from "../Components/Support/Policy/AddPolicy";
import EditPolicy from "../Components/Support/Policy/EditPolicy";
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
