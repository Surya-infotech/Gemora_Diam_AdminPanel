import { Route, Routes } from "react-router-dom";
import Metal from "../Pages/Attributes/Metal";
import AddMetal from "../Components/Attributes/Metal/AddMetal";
import EditMetal from "../Components/Attributes/Metal/EditMetal";
import DiamondSize from "../Pages/Attributes/DiamondSize";
import AddDiamondSize from "../Components/Attributes/DiamondSize/AddDiamondSize";
import EditDiamondSize from "../Components/Attributes/DiamondSize/EditDiamondSize";
import RingSize from "../Pages/Attributes/RingSize";
import AddRingSize from "../Components/Attributes/RingSize/AddRingSize";
import EditRingSize from "../Components/Attributes/RingSize/EditRingSize";
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

const AttributesRouter = () => (
    <Routes>
        <Route path="/Metal" element={<Metal />} />
        <Route path="/AddMetal" element={<AddMetal />} />
        <Route path="/EditMetal/:id" element={<EditMetal />} />
        <Route path="/DiamondSize" element={<DiamondSize />} />
        <Route path="/AddDiamondSize" element={<AddDiamondSize />} />
        <Route path="/EditDiamondSize/:id" element={<EditDiamondSize />} />
        <Route path="/RingSize" element={<RingSize />} />
        <Route path="/AddRingSize" element={<AddRingSize />} />
        <Route path="/EditRingSize/:id" element={<EditRingSize />} />
        <Route path="/Shape" element={<Shape />} />
        <Route path="/AddShape" element={<AddShape />} />
        <Route path="/EditShape/:id" element={<EditShape />} />
        <Route path="/Clarity" element={<Clarity />} />
        <Route path="/AddClarity" element={<AddClarity />} />
        <Route path="/EditClarity/:id" element={<EditClarity />} />
        <Route path="/Color" element={<Color />} />
        <Route path="/AddColor" element={<AddColor />} />
        <Route path="/EditColor/:id" element={<EditColor />} />
        <Route path="/Stone" element={<Stone />} />
        <Route path="/AddStone" element={<AddStone />} />
        <Route path="/EditStone/:id" element={<EditStone />} />
        <Route path="/Style" element={<Style />} />
        <Route path="/AddStyle" element={<AddStyle />} />
        <Route path="/EditStyle/:id" element={<EditStyle />} />
        <Route path="/Category" element={<Category />} />
        <Route path="/AddCategory" element={<AddCategory />} />
        <Route path="/EditCategory/:id" element={<EditCategory />} />
        <Route path="/SubCategory" element={<SubCategory />} />
        <Route path="/AddSubCategory" element={<AddSubCategory />} />
        <Route path="/EditSubCategory/:id" element={<EditSubCategory />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default AttributesRouter;
