import { Route, Routes } from "react-router-dom";
import Item from "../Pages/Products/Item";
import AddItem from "../Components/Products/AddItem";
import EditItem from "../Components/Products/EditItem";
import PageNotFound from "../Pages/Partials/PageNotFound";

const ProductsRouter = () => (
    <Routes>
        <Route path="/Item" element={<Item />} />
        <Route path="/AddItem" element={<AddItem />} />
        <Route path="/EditItem/:id" element={<EditItem />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default ProductsRouter;
