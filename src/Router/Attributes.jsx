import { Route, Routes } from "react-router-dom";
import Metal from "../Pages/Attributes/Metal";
import AddMetal from "../Components/Attributes/Metal/AddMetal";
import EditMetal from "../Components/Attributes/Metal/EditMetal";
import DiamondSize from "../Pages/Attributes/DiamondSize";
import AddDiamondSize from "../Components/Attributes/DiamondSize/AddDiamondSize";
import EditDiamondSize from "../Components/Attributes/DiamondSize/EditDiamondSize";
import PageNotFound from "../Pages/Partials/PageNotFound";

const AttributesRouter = () => (
    <Routes>
        <Route path="/Metal" element={<Metal />} />
        <Route path="/AddMetal" element={<AddMetal />} />
        <Route path="/EditMetal/:id" element={<EditMetal />} />
        <Route path="/DiamondSize" element={<DiamondSize />} />
        <Route path="/AddDiamondSize" element={<AddDiamondSize />} />
        <Route path="/EditDiamondSize/:id" element={<EditDiamondSize />} />
        <Route path="*" element={<PageNotFound />} />
    </Routes>
);

export default AttributesRouter;
