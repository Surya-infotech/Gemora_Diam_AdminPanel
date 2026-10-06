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
import DiamondColor from "../Pages/Attributes/DiamondColor";
import AddDiamondColor from "../Components/Attributes/DiamondColor/AddDiamondColor";
import EditDiamondColor from "../Components/Attributes/DiamondColor/EditDiamondColor";
import Stone from "../Pages/Attributes/Stone";
import AddStone from "../Components/Attributes/Stone/AddStone";
import EditStone from "../Components/Attributes/Stone/EditStone";
import Style from "../Pages/Attributes/Style";
import AddStyle from "../Components/Attributes/Style/AddStyle";
import EditStyle from "../Components/Attributes/Style/EditStyle";
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
        <Route path="/DiamondColor" element={<DiamondColor />} />
        <Route path="/AddDiamondColor" element={<AddDiamondColor />} />
        <Route path="/EditDiamondColor/:id" element={<EditDiamondColor />} />
        <Route path="/Stone" element={<Stone />} />
        <Route path="/AddStone" element={<AddStone />} />
        <Route path="/EditStone/:id" element={<EditStone />} />
        <Route path="/Style" element={<Style />} />
        <Route path="/AddStyle" element={<AddStyle />} />
        <Route path="/EditStyle/:id" element={<EditStyle />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default AttributesRouter;
