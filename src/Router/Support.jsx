import { Route, Routes } from "react-router-dom";
import ContactUs from "../Pages/Support/ContactUs";
import Subscribers from "../Pages/Support/Subscribers";
import FAQ from "../Pages/Support/FAQ";
import AddFAQ from "../Components/Support/FAQ/AddFAQ";
import EditFAQ from "../Components/Support/FAQ/EditFAQ";
import Policy from "../Pages/Support/Policy";
import AddPolicy from "../Components/Support/Policy/AddPolicy";
import EditPolicy from "../Components/Support/Policy/EditPolicy";
import Banner from "../Pages/Support/Banner";
import AddBanner from "../Components/Support/Banner/AddBanner";
import EditBanner from "../Components/Support/Banner/EditBanner";
import CollectionBanner from "../Pages/Support/CollectionBanner";
import AddCollectionBanner from "../Components/Support/CollectionBanner/AddCollectionBanner";
import EditCollectionBanner from "../Components/Support/CollectionBanner/EditCollectionBanner";
import AboutUs from "../Pages/Support/AboutUs";
import Menu from "../Pages/Support/Menu";
import AddMenu from "../Components/Support/Menu/AddMenu";
import EditMenu from "../Components/Support/Menu/EditMenu";
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
        <Route path="/Banner" element={<Banner />} />
        <Route path="/AddBanner" element={<AddBanner />} />
        <Route path="/EditBanner/:id" element={<EditBanner />} />
        <Route path="/CollectionBanner" element={<CollectionBanner />} />
        <Route path="/AddCollectionBanner" element={<AddCollectionBanner />} />
        <Route path="/EditCollectionBanner/:id" element={<EditCollectionBanner />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/AddMenu" element={<AddMenu />} />
        <Route path="/EditMenu/:id" element={<EditMenu />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default SupportRouter;
