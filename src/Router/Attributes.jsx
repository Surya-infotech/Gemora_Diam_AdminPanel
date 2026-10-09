import { Route, Routes } from "react-router-dom";
import Metal from "../Pages/Attributes/Metal";
import AddMetal from "../Components/Attributes/Metal/AddMetal";
import EditMetal from "../Components/Attributes/Metal/EditMetal";
import DiamondSize from "../Pages/Attributes/DiamondSize";
import AddDiamondSize from "../Components/Attributes/DiamondSize/AddDiamondSize";
import EditDiamondSize from "../Components/Attributes/DiamondSize/EditDiamondSize";
import Shape from "../Pages/Attributes/Shape";
import AddShape from "../Components/Attributes/Shape/AddShape";
import EditShape from "../Components/Attributes/Shape/EditShape";
import Clarity from "../Pages/Attributes/Clarity";
import AddClarity from "../Components/Attributes/Clarity/AddClarity";
import EditClarity from "../Components/Attributes/Clarity/EditClarity";
import Color from "../Pages/Attributes/Color";
import AddColor from "../Components/Attributes/Color/AddColor";
import EditColor from "../Components/Attributes/Color/EditColor";
import Stone from "../Pages/Attributes/Stone";
import AddStone from "../Components/Attributes/Stone/AddStone";
import EditStone from "../Components/Attributes/Stone/EditStone";
import Style from "../Pages/Attributes/Style";
import AddStyle from "../Components/Attributes/Style/AddStyle";
import EditStyle from "../Components/Attributes/Style/EditStyle";
import Category from "../Pages/Attributes/Category";
import AddCategory from "../Components/Attributes/Category/AddCategory";
import EditCategory from "../Components/Attributes/Category/EditCategory";
import SubCategory from "../Pages/Attributes/SubCategory";
import AddSubCategory from "../Components/Attributes/SubCategory/AddSubCategory";
import EditSubCategory from "../Components/Attributes/SubCategory/EditSubCategory";
import PageNotFound from "../Pages/Partials/PageNotFound";
import { PermissionGuard } from "../Components/PermissionGuard";

const AttributesRouter = () => (
    <Routes>
        <Route path="/Metal" element={<PermissionGuard pageId="metal" action="view"><Metal /></PermissionGuard>} />
        <Route path="/AddMetal" element={<PermissionGuard pageId="metal" action="add"><AddMetal /></PermissionGuard>} />
        <Route path="/EditMetal/:id" element={<PermissionGuard pageId="metal" action="edit"><EditMetal /></PermissionGuard>} />

        <Route path="/DiamondSize" element={<PermissionGuard pageId="diamondSize" action="view"><DiamondSize /></PermissionGuard>} />
        <Route path="/AddDiamondSize" element={<PermissionGuard pageId="diamondSize" action="add"><AddDiamondSize /></PermissionGuard>} />
        <Route path="/EditDiamondSize/:id" element={<PermissionGuard pageId="diamondSize" action="edit"><EditDiamondSize /></PermissionGuard>} />

        <Route path="/Shape" element={<PermissionGuard pageId="shape" action="view"><Shape /></PermissionGuard>} />
        <Route path="/AddShape" element={<PermissionGuard pageId="shape" action="add"><AddShape /></PermissionGuard>} />
        <Route path="/EditShape/:id" element={<PermissionGuard pageId="shape" action="edit"><EditShape /></PermissionGuard>} />

        <Route path="/Clarity" element={<PermissionGuard pageId="clarity" action="view"><Clarity /></PermissionGuard>} />
        <Route path="/AddClarity" element={<PermissionGuard pageId="clarity" action="add"><AddClarity /></PermissionGuard>} />
        <Route path="/EditClarity/:id" element={<PermissionGuard pageId="clarity" action="edit"><EditClarity /></PermissionGuard>} />

        <Route path="/Color" element={<PermissionGuard pageId="color" action="view"><Color /></PermissionGuard>} />
        <Route path="/AddColor" element={<PermissionGuard pageId="color" action="add"><AddColor /></PermissionGuard>} />
        <Route path="/EditColor/:id" element={<PermissionGuard pageId="color" action="edit"><EditColor /></PermissionGuard>} />

        <Route path="/Stone" element={<PermissionGuard pageId="stone" action="view"><Stone /></PermissionGuard>} />
        <Route path="/AddStone" element={<PermissionGuard pageId="stone" action="add"><AddStone /></PermissionGuard>} />
        <Route path="/EditStone/:id" element={<PermissionGuard pageId="stone" action="edit"><EditStone /></PermissionGuard>} />

        <Route path="/Style" element={<PermissionGuard pageId="style" action="view"><Style /></PermissionGuard>} />
        <Route path="/AddStyle" element={<PermissionGuard pageId="style" action="add"><AddStyle /></PermissionGuard>} />
        <Route path="/EditStyle/:id" element={<PermissionGuard pageId="style" action="edit"><EditStyle /></PermissionGuard>} />

        <Route path="/Category" element={<PermissionGuard pageId="category" action="view"><Category /></PermissionGuard>} />
        <Route path="/AddCategory" element={<PermissionGuard pageId="category" action="add"><AddCategory /></PermissionGuard>} />
        <Route path="/EditCategory/:id" element={<PermissionGuard pageId="category" action="edit"><EditCategory /></PermissionGuard>} />

        <Route path="/SubCategory" element={<PermissionGuard pageId="subCategory" action="view"><SubCategory /></PermissionGuard>} />
        <Route path="/AddSubCategory" element={<PermissionGuard pageId="subCategory" action="add"><AddSubCategory /></PermissionGuard>} />
        <Route path="/EditSubCategory/:id" element={<PermissionGuard pageId="subCategory" action="edit"><EditSubCategory /></PermissionGuard>} />

        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default AttributesRouter;