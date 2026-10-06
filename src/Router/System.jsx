import { Route, Routes } from "react-router-dom";
import Setting from "../Pages/System/Setting";
import AddFiscalYear from "../Components/System/Setting/AddFiscalYear";
import EditFiscalYear from "../Components/System/Setting/EditFiscalYear";
import Currency from "../Pages/System/Currency";
import AddCurrency from "../Components/System/Currency/AddCurrency";
import EditCurrency from "../Components/System/Currency/EditCurrency";
import Tax from "../Pages/System/Tax";
import AddTax from "../Components/System/Tax/AddTax";
import EditTax from "../Components/System/Tax/EditTax";
import ContactUs from "../Pages/System/ContactUs";
import Subscribers from "../Pages/System/Subscribers";
import FAQ from "../Pages/System/FAQ";
import AddFAQ from "../Components/System/FAQ/AddFAQ";
import EditFAQ from "../Components/System/FAQ/EditFAQ";
import Policy from "../Pages/System/Policy";
import AddPolicy from "../Components/System/Policy/AddPolicy";
import EditPolicy from "../Components/System/Policy/EditPolicy";
import PageNotFound from "../Pages/Partials/PageNotFound";

const SystemRouter = () => (
    <Routes>
        <Route path="/Setting" element={<Setting />} />
        <Route path="/Setting/AddFiscalYear" element={<AddFiscalYear />} />
        <Route path="/Setting/EditFiscalYear/:id" element={<EditFiscalYear />} />
        <Route path="/Currency" element={<Currency />} />
        <Route path="/AddCurrency" element={<AddCurrency />} />
        <Route path="/EditCurrency/:id" element={<EditCurrency />} />
        <Route path="/Taxes" element={<Tax />} />
        <Route path="/AddTax" element={<AddTax />} />
        <Route path="/EditTax/:id" element={<EditTax />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/AddFAQ" element={<AddFAQ />} />
        <Route path="/EditFAQ/:id" element={<EditFAQ />} />
        <Route path="/Policy" element={<Policy />} />
        <Route path="/AddPolicy" element={<AddPolicy />} />
        <Route path="/EditPolicy/:id" element={<EditPolicy />} />
        <Route path="/Subscribers" element={<Subscribers />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default SystemRouter;
