import { Route, Routes } from "react-router-dom";
import Item from "../Pages/Products/Item";
import AddItem from "../Components/Products/AddItem";
import EditItem from "../Components/Products/EditItem";
import ItemOverview from "../Components/Products/ItemOverview";
import PageNotFound from "../Pages/Partials/PageNotFound";
import { PermissionGuard } from "../Components/PermissionGuard";

const ProductsRouter = () => (
    <Routes>
        <Route path="/Item" element={
            <PermissionGuard pageId="item" action="view">
                <Item />
            </PermissionGuard>
        } />
        <Route path="/AddItem" element={
            <PermissionGuard pageId="item" action="add">
                <AddItem />
            </PermissionGuard>
        } />
        <Route path="/EditItem/:id" element={
            <PermissionGuard pageId="item" action="edit">
                <EditItem />
            </PermissionGuard>
        } />
        <Route path="/ItemOverview/:id" element={
            <PermissionGuard pageId="item" action="view">
                <ItemOverview />
            </PermissionGuard>
        } />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default ProductsRouter;
