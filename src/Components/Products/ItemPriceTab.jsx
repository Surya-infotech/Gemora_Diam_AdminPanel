import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentsIcon from '@mui/icons-material/Payments';
import DiamondIcon from '@mui/icons-material/Diamond';
import TollIcon from '@mui/icons-material/Toll';
import LayersIcon from '@mui/icons-material/Layers';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAuth } from '../../Middleware/Auth';
import { useLanguage } from '../../Context/LanguageContext';
import CheckToken from '../../utils/CheckToken';
import HandleUnauthorized from '../../utils/HandleUnauthorized';
import LoadingSpinner from '../../Pages/Custom/LoadingSpinner';
import WarningModal from '../../Pages/Custom/WarningModal';
import AlertMessage from '../../Pages/Custom/AlertMessage';
import Dropdown from '../Dropdown/Dropdown';

const ItemPriceTab = ({ itemData, onItemUpdated }) => {
    const navigate = useNavigate();
    const { translations, isRtl } = useLanguage();
    const { logoutUser } = useAuth();
    const adminPanelBackendPath = import.meta.env.VITE_BACKEND_URL;
    const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
    const token = localStorage.getItem(tokenname);

    const [metals, setMetals] = useState([]);
    const [diamondSizes, setDiamondSizes] = useState([]);
    const [stones, setStones] = useState([]);
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [priceType, setPriceType] = useState('metal_wise');

    // 1. Metal wise state
    const [metalWisePrices, setMetalWisePrices] = useState([
        { metalid: '', metalname: '', metaltype: '', price: '' }
    ]);

    // 2. Metal with Diamond Carat state
    const [metalWithDiamondCaratPrices, setMetalWithDiamondCaratPrices] = useState([
        {
            metalid: '',
            metalname: '',
            metaltype: '',
            caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }]
        }
    ]);

    // 3. Metal with Stone state
    const [metalWithStonePrices, setMetalWithStonePrices] = useState([
        {
            metalid: '',
            metalname: '',
            metaltype: '',
            stonePrices: [{ stoneid: '', stonename: '', price: '' }]
        }
    ]);

    // 4. Metal with Stone & Diamond Carat state
    const [metalWithStoneDiamondCaratPrices, setMetalWithStoneDiamondCaratPrices] = useState([
        {
            metalid: '',
            metalname: '',
            metaltype: '',
            stoneid: '',
            stonename: '',
            caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }]
        }
    ]);

    // Fetch active metals, diamond sizes, and stones for dropdown options
    useEffect(() => {
        const fetchMeta = async () => {
            if (!CheckToken(token, logoutUser, navigate)) return;
            try {
                setIsLoadingMeta(true);
                const [metalsRes, diamondRes, stonesRes] = await Promise.all([
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveMetals`, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                    }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveDiamondSizes`, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                    }),
                    fetch(`${adminPanelBackendPath}/Attributes/GetActiveStones`, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                    })
                ]);

                const metalsData = await metalsRes.json();
                const diamondData = await diamondRes.json();
                const stonesData = await stonesRes.json();

                if (metalsRes.ok && Array.isArray(metalsData)) {
                    setMetals(metalsData);
                }
                if (diamondRes.ok && Array.isArray(diamondData)) {
                    setDiamondSizes(diamondData);
                }
                if (stonesRes.ok && Array.isArray(stonesData)) {
                    setStones(stonesData);
                }
            } catch (err) {
                console.error('Fetch price metadata error:', err);
            } finally {
                setIsLoadingMeta(false);
            }
        };

        fetchMeta();
    }, [adminPanelBackendPath, token, logoutUser, navigate]);

    // Load initial data from itemData when available
    useEffect(() => {
        if (!itemData) return;

        const pricing = itemData.pricing;
        if (pricing) {
            const currentType = pricing.priceType || 'metal_wise';
            setPriceType(currentType);

            // Flow 1
            if (currentType === 'metal_wise' && Array.isArray(pricing.metalWisePrices) && pricing.metalWisePrices.length > 0) {
                setMetalWisePrices(
                    pricing.metalWisePrices.map(m => ({
                        metalid: m.metalid ? Number(m.metalid) : '',
                        metalname: m.metalname || '',
                        metaltype: m.metaltype || '',
                        price: m.price !== undefined && m.price !== null ? String(m.price) : ''
                    }))
                );
            } else {
                setMetalWisePrices([{ metalid: '', metalname: '', metaltype: '', price: '' }]);
            }

            // Flow 2
            if (currentType === 'metal_with_diamond_carat' && Array.isArray(pricing.metalWithDiamondCaratPrices) && pricing.metalWithDiamondCaratPrices.length > 0) {
                setMetalWithDiamondCaratPrices(
                    pricing.metalWithDiamondCaratPrices.map(mg => ({
                        metalid: mg.metalid ? Number(mg.metalid) : '',
                        metalname: mg.metalname || '',
                        metaltype: mg.metaltype || '',
                        caratPrices: Array.isArray(mg.caratPrices) && mg.caratPrices.length > 0
                            ? mg.caratPrices.map(cp => ({
                                diamondsizeid: cp.diamondsizeid ? Number(cp.diamondsizeid) : '',
                                diamondsize: cp.diamondsize || '',
                                price: cp.price !== undefined && cp.price !== null ? String(cp.price) : ''
                            }))
                            : [{ diamondsizeid: '', diamondsize: '', price: '' }]
                    }))
                );
            } else {
                setMetalWithDiamondCaratPrices([
                    { metalid: '', metalname: '', metaltype: '', caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }] }
                ]);
            }

            // Flow 3
            if (currentType === 'metal_with_stone' && Array.isArray(pricing.metalWithStonePrices) && pricing.metalWithStonePrices.length > 0) {
                setMetalWithStonePrices(
                    pricing.metalWithStonePrices.map(mg => ({
                        metalid: mg.metalid ? Number(mg.metalid) : '',
                        metalname: mg.metalname || '',
                        metaltype: mg.metaltype || '',
                        stonePrices: Array.isArray(mg.stonePrices) && mg.stonePrices.length > 0
                            ? mg.stonePrices.map(sp => ({
                                stoneid: sp.stoneid ? Number(sp.stoneid) : '',
                                stonename: sp.stonename || '',
                                price: sp.price !== undefined && sp.price !== null ? String(sp.price) : ''
                            }))
                            : [{ stoneid: '', stonename: '', price: '' }]
                    }))
                );
            } else {
                setMetalWithStonePrices([
                    { metalid: '', metalname: '', metaltype: '', stonePrices: [{ stoneid: '', stonename: '', price: '' }] }
                ]);
            }

            // Flow 4
            if (currentType === 'metal_with_stone_diamond_carat' && Array.isArray(pricing.metalWithStoneDiamondCaratPrices) && pricing.metalWithStoneDiamondCaratPrices.length > 0) {
                setMetalWithStoneDiamondCaratPrices(
                    pricing.metalWithStoneDiamondCaratPrices.map(msg => ({
                        metalid: msg.metalid ? Number(msg.metalid) : '',
                        metalname: msg.metalname || '',
                        metaltype: msg.metaltype || '',
                        stoneid: msg.stoneid ? Number(msg.stoneid) : '',
                        stonename: msg.stonename || '',
                        caratPrices: Array.isArray(msg.caratPrices) && msg.caratPrices.length > 0
                            ? msg.caratPrices.map(cp => ({
                                diamondsizeid: cp.diamondsizeid ? Number(cp.diamondsizeid) : '',
                                diamondsize: cp.diamondsize || '',
                                price: cp.price !== undefined && cp.price !== null ? String(cp.price) : ''
                            }))
                            : [{ diamondsizeid: '', diamondsize: '', price: '' }]
                    }))
                );
            } else {
                setMetalWithStoneDiamondCaratPrices([
                    { metalid: '', metalname: '', metaltype: '', stoneid: '', stonename: '', caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }] }
                ]);
            }
        }
    }, [itemData]);

    const formattedMetals = useMemo(() => {
        return metals.map(m => ({
            ...m,
            metalid: Number(m.metalid || m._id),
            displayLabel: m.metaltype ? `${m.metalname} (${m.metaltype})` : m.metalname
        }));
    }, [metals]);

    const formattedDiamondSizes = useMemo(() => {
        return diamondSizes.map(d => ({
            ...d,
            diamondsizeid: Number(d.diamondsizeid || d._id),
            displayLabel: d.diamondsize
        }));
    }, [diamondSizes]);

    // Available stones: uses itemData.stones if assigned, fallback to all active stones
    const availableStones = useMemo(() => {
        if (Array.isArray(itemData?.stones) && itemData.stones.length > 0) {
            return itemData.stones.map(s => ({
                ...s,
                stoneid: Number(s.stoneid || s._id),
                displayLabel: s.stonename || s.name || ''
            }));
        }
        return stones.map(s => ({
            ...s,
            stoneid: Number(s.stoneid || s._id),
            displayLabel: s.stonename || s.name || ''
        }));
    }, [itemData, stones]);

    // ==========================================
    // Flow 1: Metal Wise Handlers
    // ==========================================
    const getMetalOptionsForIndex = (currentIndex) => {
        const currentMetalId = Number(metalWisePrices[currentIndex]?.metalid);
        const otherSelectedIds = metalWisePrices
            .filter((_, idx) => idx !== currentIndex)
            .map(r => Number(r.metalid))
            .filter(Boolean);

        return formattedMetals.filter(m => {
            const id = Number(m.metalid);
            return id === currentMetalId || !otherSelectedIds.includes(id);
        });
    };

    const handleMetalWiseChange = (index, field, value) => {
        setMetalWisePrices(prev => {
            const updated = [...prev];
            const row = { ...updated[index] };

            if (field === 'metalid') {
                const numId = Number(value);
                const found = formattedMetals.find(m => Number(m.metalid) === numId);
                row.metalid = numId || '';
                row.metalname = found ? found.metalname : '';
                row.metaltype = found ? found.metaltype : '';
            } else if (field === 'price') {
                row.price = value;
            }

            updated[index] = row;
            return updated;
        });
    };

    const handleAddMetalWiseRow = () => {
        if (formattedMetals.length > 0 && metalWisePrices.length >= formattedMetals.length) {
            return;
        }

        const usedIds = new Set(metalWisePrices.map(r => Number(r.metalid)).filter(Boolean));
        const nextAvail = formattedMetals.find(m => !usedIds.has(Number(m.metalid)));

        setMetalWisePrices(prev => [
            ...prev,
            {
                metalid: nextAvail ? Number(nextAvail.metalid) : '',
                metalname: nextAvail ? nextAvail.metalname : '',
                metaltype: nextAvail ? nextAvail.metaltype : '',
                price: ''
            }
        ]);
    };

    const handleRemoveMetalWiseRow = (index) => {
        if (metalWisePrices.length <= 1) return;
        setMetalWisePrices(prev => prev.filter((_, idx) => idx !== index));
    };

    // ==========================================
    // Flow 2: Metal with Diamond Carat Handlers
    // ==========================================
    const getMetalGroupOptionsForIndex = (currentGroupIndex) => {
        const currentMetalId = Number(metalWithDiamondCaratPrices[currentGroupIndex]?.metalid);
        const otherSelectedIds = metalWithDiamondCaratPrices
            .filter((_, idx) => idx !== currentGroupIndex)
            .map(g => Number(g.metalid))
            .filter(Boolean);

        return formattedMetals.filter(m => {
            const id = Number(m.metalid);
            return id === currentMetalId || !otherSelectedIds.includes(id);
        });
    };

    const getCaratOptionsForIndex = (groupIndex, caratIndex) => {
        const currentCarats = metalWithDiamondCaratPrices[groupIndex]?.caratPrices || [];
        const currentCaratId = Number(currentCarats[caratIndex]?.diamondsizeid);
        const otherSelectedIds = currentCarats
            .filter((_, idx) => idx !== caratIndex)
            .map(c => Number(c.diamondsizeid))
            .filter(Boolean);

        return formattedDiamondSizes.filter(d => {
            const id = Number(d.diamondsizeid);
            return id === currentCaratId || !otherSelectedIds.includes(id);
        });
    };

    const handleMetalGroupChange = (groupIndex, metalIdVal) => {
        const numId = Number(metalIdVal);
        const found = formattedMetals.find(m => Number(m.metalid) === numId);

        setMetalWithDiamondCaratPrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                return {
                    ...group,
                    metalid: numId || '',
                    metalname: found ? found.metalname : '',
                    metaltype: found ? found.metaltype : ''
                };
            })
        );
    };

    const handleAddMetalGroup = () => {
        if (formattedMetals.length > 0 && metalWithDiamondCaratPrices.length >= formattedMetals.length) {
            return;
        }

        const usedIds = new Set(metalWithDiamondCaratPrices.map(g => Number(g.metalid)).filter(Boolean));
        const nextAvail = formattedMetals.find(m => !usedIds.has(Number(m.metalid)));

        setMetalWithDiamondCaratPrices(prev => [
            ...prev,
            {
                metalid: nextAvail ? Number(nextAvail.metalid) : '',
                metalname: nextAvail ? nextAvail.metalname : '',
                metaltype: nextAvail ? nextAvail.metaltype : '',
                caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }]
            }
        ]);
    };

    const handleRemoveMetalGroup = (groupIndex) => {
        if (metalWithDiamondCaratPrices.length <= 1) return;
        setMetalWithDiamondCaratPrices(prev => prev.filter((_, idx) => idx !== groupIndex));
    };

    const handleCaratChange = (groupIndex, caratIndex, field, value) => {
        setMetalWithDiamondCaratPrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;

                const nextCarats = group.caratPrices.map((cRow, cIdx) => {
                    if (cIdx !== caratIndex) return cRow;
                    const updated = { ...cRow };

                    if (field === 'diamondsizeid') {
                        const numId = Number(value);
                        const found = formattedDiamondSizes.find(d => Number(d.diamondsizeid) === numId);
                        updated.diamondsizeid = numId || '';
                        updated.diamondsize = found ? found.diamondsize : '';
                    } else if (field === 'price') {
                        updated.price = value;
                    }

                    return updated;
                });

                return { ...group, caratPrices: nextCarats };
            })
        );
    };

    const handleAddCaratRow = (groupIndex) => {
        const group = metalWithDiamondCaratPrices[groupIndex];
        const currentCarats = group?.caratPrices || [];

        if (formattedDiamondSizes.length > 0 && currentCarats.length >= formattedDiamondSizes.length) {
            return;
        }

        const usedIds = new Set(currentCarats.map(c => Number(c.diamondsizeid)).filter(Boolean));
        const nextAvail = formattedDiamondSizes.find(d => !usedIds.has(Number(d.diamondsizeid)));

        setMetalWithDiamondCaratPrices(prev =>
            prev.map((g, gIdx) => {
                if (gIdx !== groupIndex) return g;
                return {
                    ...g,
                    caratPrices: [
                        ...g.caratPrices,
                        {
                            diamondsizeid: nextAvail ? Number(nextAvail.diamondsizeid) : '',
                            diamondsize: nextAvail ? nextAvail.diamondsize : '',
                            price: ''
                        }
                    ]
                };
            })
        );
    };

    const handleRemoveCaratRow = (groupIndex, caratIndex) => {
        setMetalWithDiamondCaratPrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                if (group.caratPrices.length <= 1) return group;
                return {
                    ...group,
                    caratPrices: group.caratPrices.filter((_, cIdx) => cIdx !== caratIndex)
                };
            })
        );
    };

    // ==========================================
    // Flow 3: Metal with Stone Handlers
    // ==========================================
    const getMetalWithStoneGroupOptions = (currentGroupIndex) => {
        const currentMetalId = Number(metalWithStonePrices[currentGroupIndex]?.metalid);
        const otherSelectedIds = metalWithStonePrices
            .filter((_, idx) => idx !== currentGroupIndex)
            .map(g => Number(g.metalid))
            .filter(Boolean);

        return formattedMetals.filter(m => {
            const id = Number(m.metalid);
            return id === currentMetalId || !otherSelectedIds.includes(id);
        });
    };

    const getStoneOptionsForIndex = (groupIndex, stoneIndex) => {
        const currentStones = metalWithStonePrices[groupIndex]?.stonePrices || [];
        const currentStoneId = Number(currentStones[stoneIndex]?.stoneid);
        const otherSelectedIds = currentStones
            .filter((_, idx) => idx !== stoneIndex)
            .map(s => Number(s.stoneid))
            .filter(Boolean);

        return availableStones.filter(s => {
            const id = Number(s.stoneid);
            return id === currentStoneId || !otherSelectedIds.includes(id);
        });
    };

    const handleMetalWithStoneGroupChange = (groupIndex, metalIdVal) => {
        const numId = Number(metalIdVal);
        const found = formattedMetals.find(m => Number(m.metalid) === numId);

        setMetalWithStonePrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                return {
                    ...group,
                    metalid: numId || '',
                    metalname: found ? found.metalname : '',
                    metaltype: found ? found.metaltype : ''
                };
            })
        );
    };

    const handleAddMetalWithStoneGroup = () => {
        if (formattedMetals.length > 0 && metalWithStonePrices.length >= formattedMetals.length) {
            return;
        }

        const usedIds = new Set(metalWithStonePrices.map(g => Number(g.metalid)).filter(Boolean));
        const nextAvail = formattedMetals.find(m => !usedIds.has(Number(m.metalid)));

        setMetalWithStonePrices(prev => [
            ...prev,
            {
                metalid: nextAvail ? Number(nextAvail.metalid) : '',
                metalname: nextAvail ? nextAvail.metalname : '',
                metaltype: nextAvail ? nextAvail.metaltype : '',
                stonePrices: [{ stoneid: '', stonename: '', price: '' }]
            }
        ]);
    };

    const handleRemoveMetalWithStoneGroup = (groupIndex) => {
        if (metalWithStonePrices.length <= 1) return;
        setMetalWithStonePrices(prev => prev.filter((_, idx) => idx !== groupIndex));
    };

    const handleStoneChange = (groupIndex, stoneIndex, field, value) => {
        setMetalWithStonePrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;

                const nextStones = group.stonePrices.map((sRow, sIdx) => {
                    if (sIdx !== stoneIndex) return sRow;
                    const updated = { ...sRow };

                    if (field === 'stoneid') {
                        const numId = Number(value);
                        const found = availableStones.find(s => Number(s.stoneid) === numId);
                        updated.stoneid = numId || '';
                        updated.stonename = found ? found.stonename || found.displayLabel : '';
                    } else if (field === 'price') {
                        updated.price = value;
                    }

                    return updated;
                });

                return { ...group, stonePrices: nextStones };
            })
        );
    };

    const handleAddStoneRow = (groupIndex) => {
        const group = metalWithStonePrices[groupIndex];
        const currentStones = group?.stonePrices || [];

        if (availableStones.length > 0 && currentStones.length >= availableStones.length) {
            return;
        }

        const usedIds = new Set(currentStones.map(s => Number(s.stoneid)).filter(Boolean));
        const nextAvail = availableStones.find(s => !usedIds.has(Number(s.stoneid)));

        setMetalWithStonePrices(prev =>
            prev.map((g, gIdx) => {
                if (gIdx !== groupIndex) return g;
                return {
                    ...g,
                    stonePrices: [
                        ...g.stonePrices,
                        {
                            stoneid: nextAvail ? Number(nextAvail.stoneid) : '',
                            stonename: nextAvail ? nextAvail.stonename || nextAvail.displayLabel : '',
                            price: ''
                        }
                    ]
                };
            })
        );
    };

    const handleRemoveStoneRow = (groupIndex, stoneIndex) => {
        setMetalWithStonePrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                if (group.stonePrices.length <= 1) return group;
                return {
                    ...group,
                    stonePrices: group.stonePrices.filter((_, sIdx) => sIdx !== stoneIndex)
                };
            })
        );
    };

    // ==========================================
    // Flow 4: Metal with Stone & Diamond Carat Handlers
    // ==========================================
    const handleMetalWithStoneCaratGroupChange = (groupIndex, field, value) => {
        setMetalWithStoneDiamondCaratPrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                const updated = { ...group };

                if (field === 'metalid') {
                    const numId = Number(value);
                    const found = formattedMetals.find(m => Number(m.metalid) === numId);
                    updated.metalid = numId || '';
                    updated.metalname = found ? found.metalname : '';
                    updated.metaltype = found ? found.metaltype : '';
                } else if (field === 'stoneid') {
                    const numId = Number(value);
                    const found = availableStones.find(s => Number(s.stoneid) === numId);
                    updated.stoneid = numId || '';
                    updated.stonename = found ? found.stonename || found.displayLabel : '';
                }

                return updated;
            })
        );
    };

    const handleAddMetalWithStoneCaratGroup = () => {
        setMetalWithStoneDiamondCaratPrices(prev => [
            ...prev,
            {
                metalid: '',
                metalname: '',
                metaltype: '',
                stoneid: '',
                stonename: '',
                caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }]
            }
        ]);
    };

    const handleRemoveMetalWithStoneCaratGroup = (groupIndex) => {
        if (metalWithStoneDiamondCaratPrices.length <= 1) return;
        setMetalWithStoneDiamondCaratPrices(prev => prev.filter((_, idx) => idx !== groupIndex));
    };

    const getCaratOptionsForMetalStoneIndex = (groupIndex, caratIndex) => {
        const currentCarats = metalWithStoneDiamondCaratPrices[groupIndex]?.caratPrices || [];
        const currentCaratId = Number(currentCarats[caratIndex]?.diamondsizeid);
        const otherSelectedIds = currentCarats
            .filter((_, idx) => idx !== caratIndex)
            .map(c => Number(c.diamondsizeid))
            .filter(Boolean);

        return formattedDiamondSizes.filter(d => {
            const id = Number(d.diamondsizeid);
            return id === currentCaratId || !otherSelectedIds.includes(id);
        });
    };

    const handleCaratChangeForMetalStone = (groupIndex, caratIndex, field, value) => {
        setMetalWithStoneDiamondCaratPrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;

                const nextCarats = group.caratPrices.map((cRow, cIdx) => {
                    if (cIdx !== caratIndex) return cRow;
                    const updated = { ...cRow };

                    if (field === 'diamondsizeid') {
                        const numId = Number(value);
                        const found = formattedDiamondSizes.find(d => Number(d.diamondsizeid) === numId);
                        updated.diamondsizeid = numId || '';
                        updated.diamondsize = found ? found.diamondsize : '';
                    } else if (field === 'price') {
                        updated.price = value;
                    }

                    return updated;
                });

                return { ...group, caratPrices: nextCarats };
            })
        );
    };

    const handleAddCaratRowForMetalStone = (groupIndex) => {
        const group = metalWithStoneDiamondCaratPrices[groupIndex];
        const currentCarats = group?.caratPrices || [];

        if (formattedDiamondSizes.length > 0 && currentCarats.length >= formattedDiamondSizes.length) {
            return;
        }

        const usedIds = new Set(currentCarats.map(c => Number(c.diamondsizeid)).filter(Boolean));
        const nextAvail = formattedDiamondSizes.find(d => !usedIds.has(Number(d.diamondsizeid)));

        setMetalWithStoneDiamondCaratPrices(prev =>
            prev.map((g, gIdx) => {
                if (gIdx !== groupIndex) return g;
                return {
                    ...g,
                    caratPrices: [
                        ...g.caratPrices,
                        {
                            diamondsizeid: nextAvail ? Number(nextAvail.diamondsizeid) : '',
                            diamondsize: nextAvail ? nextAvail.diamondsize : '',
                            price: ''
                        }
                    ]
                };
            })
        );
    };

    const handleRemoveCaratRowForMetalStone = (groupIndex, caratIndex) => {
        setMetalWithStoneDiamondCaratPrices(prev =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                if (group.caratPrices.length <= 1) return group;
                return {
                    ...group,
                    caratPrices: group.caratPrices.filter((_, cIdx) => cIdx !== caratIndex)
                };
            })
        );
    };

    // ==========================================
    // Reset to saved state
    // ==========================================
    const handleReset = () => {
        const pricing = itemData?.pricing;
        if (pricing) {
            const currentType = pricing.priceType || 'metal_wise';
            setPriceType(currentType);

            // Flow 1
            if (currentType === 'metal_wise' && pricing.metalWisePrices?.length) {
                setMetalWisePrices(pricing.metalWisePrices.map(m => ({
                    metalid: m.metalid ? Number(m.metalid) : '',
                    metalname: m.metalname || '',
                    metaltype: m.metaltype || '',
                    price: m.price !== undefined ? String(m.price) : ''
                })));
            } else {
                setMetalWisePrices([{ metalid: '', metalname: '', metaltype: '', price: '' }]);
            }

            // Flow 2
            if (currentType === 'metal_with_diamond_carat' && pricing.metalWithDiamondCaratPrices?.length) {
                setMetalWithDiamondCaratPrices(pricing.metalWithDiamondCaratPrices.map(mg => ({
                    metalid: mg.metalid ? Number(mg.metalid) : '',
                    metalname: mg.metalname || '',
                    metaltype: mg.metaltype || '',
                    caratPrices: mg.caratPrices?.length
                        ? mg.caratPrices.map(cp => ({
                            diamondsizeid: cp.diamondsizeid ? Number(cp.diamondsizeid) : '',
                            diamondsize: cp.diamondsize || '',
                            price: cp.price !== undefined ? String(cp.price) : ''
                        }))
                        : [{ diamondsizeid: '', diamondsize: '', price: '' }]
                })));
            } else {
                setMetalWithDiamondCaratPrices([
                    { metalid: '', metalname: '', metaltype: '', caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }] }
                ]);
            }

            // Flow 3
            if (currentType === 'metal_with_stone' && pricing.metalWithStonePrices?.length) {
                setMetalWithStonePrices(pricing.metalWithStonePrices.map(mg => ({
                    metalid: mg.metalid ? Number(mg.metalid) : '',
                    metalname: mg.metalname || '',
                    metaltype: mg.metaltype || '',
                    stonePrices: mg.stonePrices?.length
                        ? mg.stonePrices.map(sp => ({
                            stoneid: sp.stoneid ? Number(sp.stoneid) : '',
                            stonename: sp.stonename || '',
                            price: sp.price !== undefined ? String(sp.price) : ''
                        }))
                        : [{ stoneid: '', stonename: '', price: '' }]
                })));
            } else {
                setMetalWithStonePrices([
                    { metalid: '', metalname: '', metaltype: '', stonePrices: [{ stoneid: '', stonename: '', price: '' }] }
                ]);
            }

            // Flow 4
            if (currentType === 'metal_with_stone_diamond_carat' && pricing.metalWithStoneDiamondCaratPrices?.length) {
                setMetalWithStoneDiamondCaratPrices(pricing.metalWithStoneDiamondCaratPrices.map(msg => ({
                    metalid: msg.metalid ? Number(msg.metalid) : '',
                    metalname: msg.metalname || '',
                    metaltype: msg.metaltype || '',
                    stoneid: msg.stoneid ? Number(msg.stoneid) : '',
                    stonename: msg.stonename || '',
                    caratPrices: msg.caratPrices?.length
                        ? msg.caratPrices.map(cp => ({
                            diamondsizeid: cp.diamondsizeid ? Number(cp.diamondsizeid) : '',
                            diamondsize: cp.diamondsize || '',
                            price: cp.price !== undefined ? String(cp.price) : ''
                        }))
                        : [{ diamondsizeid: '', diamondsize: '', price: '' }]
                })));
            } else {
                setMetalWithStoneDiamondCaratPrices([
                    { metalid: '', metalname: '', metaltype: '', stoneid: '', stonename: '', caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }] }
                ]);
            }
        } else {
            setPriceType('metal_wise');
            setMetalWisePrices([{ metalid: '', metalname: '', metaltype: '', price: '' }]);
            setMetalWithDiamondCaratPrices([
                { metalid: '', metalname: '', metaltype: '', caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }] }
            ]);
            setMetalWithStonePrices([
                { metalid: '', metalname: '', metaltype: '', stonePrices: [{ stoneid: '', stonename: '', price: '' }] }
            ]);
            setMetalWithStoneDiamondCaratPrices([
                { metalid: '', metalname: '', metaltype: '', stoneid: '', stonename: '', caratPrices: [{ diamondsizeid: '', diamondsize: '', price: '' }] }
            ]);
        }
        setSuccessMessage('');
    };

    // ==========================================
    // Submit / Save form
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!CheckToken(token, logoutUser, navigate)) return;

        const itemId = itemData?.itemid || itemData?._id;
        if (!itemId) {
            setWarningMessage(translations.itemnotfound);
            setShowWarning(true);
            return;
        }

        // 1. Validation for metal_wise
        if (priceType === 'metal_wise') {
            const hasEmptyFields = metalWisePrices.some(
                r => !r.metalid || r.price === '' || isNaN(Number(r.price)) || Number(r.price) < 0
            );
            if (hasEmptyFields) {
                setWarningMessage(translations.selectmetalandvalidprice);
                setShowWarning(true);
                return;
            }

            const selectedIds = metalWisePrices.map(r => Number(r.metalid)).filter(Boolean);
            if (new Set(selectedIds).size !== selectedIds.length) {
                setWarningMessage(translations.duplicatemetalsnotallowed);
                setShowWarning(true);
                return;
            }
        }

        // 2. Validation for metal_with_diamond_carat
        if (priceType === 'metal_with_diamond_carat') {
            const hasEmptyGroupMetal = metalWithDiamondCaratPrices.some(g => !g.metalid);
            if (hasEmptyGroupMetal) {
                setWarningMessage(translations.selectmetalforeachcard);
                setShowWarning(true);
                return;
            }

            const groupMetalIds = metalWithDiamondCaratPrices.map(g => Number(g.metalid)).filter(Boolean);
            if (new Set(groupMetalIds).size !== groupMetalIds.length) {
                setWarningMessage(translations.duplicatemetalsnotallowed);
                setShowWarning(true);
                return;
            }

            for (const group of metalWithDiamondCaratPrices) {
                if (!group.caratPrices || group.caratPrices.length === 0) {
                    setWarningMessage(translations.atleastonecaratrequired);
                    setShowWarning(true);
                    return;
                }

                const hasEmptyCarat = group.caratPrices.some(
                    c => !c.diamondsizeid || c.price === '' || isNaN(Number(c.price)) || Number(c.price) < 0
                );
                if (hasEmptyCarat) {
                    setWarningMessage(translations.selectdiamondcaratandvalidprice);
                    setShowWarning(true);
                    return;
                }

                const caratIds = group.caratPrices.map(c => Number(c.diamondsizeid)).filter(Boolean);
                if (new Set(caratIds).size !== caratIds.length) {
                    setWarningMessage(translations.duplicatecaratsnotallowed);
                    setShowWarning(true);
                    return;
                }
            }
        }

        // 3. Validation for metal_with_stone
        if (priceType === 'metal_with_stone') {
            const hasEmptyGroupMetal = metalWithStonePrices.some(g => !g.metalid);
            if (hasEmptyGroupMetal) {
                setWarningMessage(translations.selectmetalforeachcard);
                setShowWarning(true);
                return;
            }

            const groupMetalIds = metalWithStonePrices.map(g => Number(g.metalid)).filter(Boolean);
            if (new Set(groupMetalIds).size !== groupMetalIds.length) {
                setWarningMessage(translations.duplicatemetalsnotallowed);
                setShowWarning(true);
                return;
            }

            for (const group of metalWithStonePrices) {
                if (!group.stonePrices || group.stonePrices.length === 0) {
                    setWarningMessage(translations.atleastonestonerequired);
                    setShowWarning(true);
                    return;
                }

                const hasEmptyStone = group.stonePrices.some(
                    s => !s.stoneid || s.price === '' || isNaN(Number(s.price)) || Number(s.price) < 0
                );
                if (hasEmptyStone) {
                    setWarningMessage(translations.selectstoneandvalidprice);
                    setShowWarning(true);
                    return;
                }

                const stoneIds = group.stonePrices.map(s => Number(s.stoneid)).filter(Boolean);
                if (new Set(stoneIds).size !== stoneIds.length) {
                    setWarningMessage(translations.duplicatestonesnotallowed);
                    setShowWarning(true);
                    return;
                }
            }
        }

        // 4. Validation for metal_with_stone_diamond_carat
        if (priceType === 'metal_with_stone_diamond_carat') {
            const hasEmptyMetalOrStone = metalWithStoneDiamondCaratPrices.some(g => !g.metalid || !g.stoneid);
            if (hasEmptyMetalOrStone) {
                setWarningMessage(translations.selectmetalandstoneforeachcard);
                setShowWarning(true);
                return;
            }

            // Check for duplicate combination of (metalid + stoneid)
            const comboKeys = metalWithStoneDiamondCaratPrices.map(g => `${g.metalid}_${g.stoneid}`);
            if (new Set(comboKeys).size !== comboKeys.length) {
                setWarningMessage(translations.duplicatemetalstonecombinationnotallowed);
                setShowWarning(true);
                return;
            }

            for (const group of metalWithStoneDiamondCaratPrices) {
                if (!group.caratPrices || group.caratPrices.length === 0) {
                    setWarningMessage(translations.atleastonecaratrequiredforconfiguration);
                    setShowWarning(true);
                    return;
                }

                const hasEmptyCarat = group.caratPrices.some(
                    c => !c.diamondsizeid || c.price === '' || isNaN(Number(c.price)) || Number(c.price) < 0
                );
                if (hasEmptyCarat) {
                    setWarningMessage(translations.selectdiamondcaratandvalidprice);
                    setShowWarning(true);
                    return;
                }

                const caratIds = group.caratPrices.map(c => Number(c.diamondsizeid)).filter(Boolean);
                if (new Set(caratIds).size !== caratIds.length) {
                    setWarningMessage(translations.duplicatecaratsnotallowedforconfiguration);
                    setShowWarning(true);
                    return;
                }
            }
        }

        setIsSaving(true);

        const payload = {
            priceType,
            metalWisePrices: priceType === 'metal_wise'
                ? metalWisePrices.map(r => ({
                    metalid: Number(r.metalid),
                    metalname: r.metalname,
                    metaltype: r.metaltype,
                    price: Number(r.price)
                }))
                : [],
            metalWithDiamondCaratPrices: priceType === 'metal_with_diamond_carat'
                ? metalWithDiamondCaratPrices.map(g => ({
                    metalid: Number(g.metalid),
                    metalname: g.metalname,
                    metaltype: g.metaltype,
                    caratPrices: g.caratPrices.map(c => ({
                        diamondsizeid: Number(c.diamondsizeid),
                        diamondsize: c.diamondsize,
                        price: Number(c.price)
                    }))
                }))
                : [],
            metalWithStonePrices: priceType === 'metal_with_stone'
                ? metalWithStonePrices.map(g => ({
                    metalid: Number(g.metalid),
                    metalname: g.metalname,
                    metaltype: g.metaltype,
                    stonePrices: g.stonePrices.map(s => ({
                        stoneid: Number(s.stoneid),
                        stonename: s.stonename,
                        price: Number(s.price)
                    }))
                }))
                : [],
            metalWithStoneDiamondCaratPrices: priceType === 'metal_with_stone_diamond_carat'
                ? metalWithStoneDiamondCaratPrices.map(g => ({
                    metalid: Number(g.metalid),
                    metalname: g.metalname,
                    metaltype: g.metaltype,
                    stoneid: Number(g.stoneid),
                    stonename: g.stonename,
                    caratPrices: g.caratPrices.map(c => ({
                        diamondsizeid: Number(c.diamondsizeid),
                        diamondsize: c.diamondsize,
                        price: Number(c.price)
                    }))
                }))
                : []
        };

        try {
            const response = await fetch(`${adminPanelBackendPath}/Products/UpdateItemPrice/${itemId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (HandleUnauthorized(data, logoutUser, navigate)) return;

            if (response.ok) {
                setSuccessMessage(translations.priceupdatedsuccessfully);
                if (onItemUpdated && data.item) {
                    onItemUpdated(data.item);
                }
            } else {
                setWarningMessage(data.message || translations.servererror);
                setShowWarning(true);
            }
        } catch (err) {
            console.error('Update item price error:', err);
            setWarningMessage(translations.servererror);
            setShowWarning(true);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingMeta) {
        return (
            <div className="price-tab-loading">
                <LoadingSpinner />
            </div>
        );
    }

    const getPriceTypeLabel = () => {
        switch (priceType) {
            case 'metal_wise':
                return translations.metalwise;
            case 'metal_with_diamond_carat':
                return translations.metalwithdiamondcarat;
            case 'metal_with_stone':
                return translations.metalwithstone;
            case 'metal_with_stone_diamond_carat':
                return translations.metalwithstonediamondcarat;
            default:
                return translations.metalwise;
        }
    };

    return (
        <>
            {showWarning && <WarningModal message={warningMessage} onClose={() => setShowWarning(false)} />}

            <div className={`item-price-tab-container ${isRtl ? 'rtl-pricetab' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                {successMessage && (
                    <div className="price-tab-alert">
                        <AlertMessage message={successMessage} type="success" onClose={() => setSuccessMessage('')} />
                    </div>
                )}

                <div className="price-tab-header-banner">
                    <div className="banner-left">
                        <div className="banner-icon-wrapper">
                            <PaymentsIcon className="banner-icon" />
                        </div>
                        <div className="banner-info">
                            <div className="banner-title-row">
                                <h5 className="banner-title">{translations.priceconfiguration}</h5>
                                <span className="price-type-badge">
                                    {getPriceTypeLabel()}
                                </span>
                            </div>
                            <p className="banner-subtitle">
                                {translations.priceconfigurationsubtitle}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="price-config-form">
                    {/* Price Type Selector */}
                    <div className="price-type-selector-card">
                        <label className="section-label">
                            {translations.pricetype} *
                        </label>
                        <div className="price-type-options-grid">
                            {/* Option 1: Metal wise */}
                            <div
                                className={`price-type-option ${priceType === 'metal_wise' ? 'selected' : ''}`}
                                onClick={() => setPriceType('metal_wise')}
                            >
                                <div className="option-radio-indicator">
                                    <input
                                        type="radio"
                                        id="price_type_metal_wise"
                                        name="priceType"
                                        value="metal_wise"
                                        checked={priceType === 'metal_wise'}
                                        onChange={() => setPriceType('metal_wise')}
                                    />
                                </div>
                                <div className="option-info">
                                    <div className="option-title-row">
                                        <PaymentsIcon className="option-icon" />
                                        <span className="option-title">{translations.metalwise}</span>
                                    </div>
                                    <p className="option-description">
                                        {translations.metalwisedesc}
                                    </p>
                                </div>
                            </div>

                            {/* Option 2: Metal with Diamond Carat */}
                            <div
                                className={`price-type-option ${priceType === 'metal_with_diamond_carat' ? 'selected' : ''}`}
                                onClick={() => setPriceType('metal_with_diamond_carat')}
                            >
                                <div className="option-radio-indicator">
                                    <input
                                        type="radio"
                                        id="price_type_metal_carat"
                                        name="priceType"
                                        value="metal_with_diamond_carat"
                                        checked={priceType === 'metal_with_diamond_carat'}
                                        onChange={() => setPriceType('metal_with_diamond_carat')}
                                    />
                                </div>
                                <div className="option-info">
                                    <div className="option-title-row">
                                        <DiamondIcon className="option-icon" />
                                        <span className="option-title">{translations.metalwithdiamondcarat}</span>
                                    </div>
                                    <p className="option-description">
                                        {translations.metalwithdiamondcaratdesc}
                                    </p>
                                </div>
                            </div>

                            {/* Option 3: Metal with Stone */}
                            <div
                                className={`price-type-option ${priceType === 'metal_with_stone' ? 'selected' : ''}`}
                                onClick={() => setPriceType('metal_with_stone')}
                            >
                                <div className="option-radio-indicator">
                                    <input
                                        type="radio"
                                        id="price_type_metal_stone"
                                        name="priceType"
                                        value="metal_with_stone"
                                        checked={priceType === 'metal_with_stone'}
                                        onChange={() => setPriceType('metal_with_stone')}
                                    />
                                </div>
                                <div className="option-info">
                                    <div className="option-title-row">
                                        <TollIcon className="option-icon" />
                                        <span className="option-title">{translations.metalwithstone}</span>
                                    </div>
                                    <p className="option-description">
                                        {translations.metalwithstonedesc}
                                    </p>
                                </div>
                            </div>

                            {/* Option 4: Metal with Stone & Diamond Carat */}
                            <div
                                className={`price-type-option ${priceType === 'metal_with_stone_diamond_carat' ? 'selected' : ''}`}
                                onClick={() => setPriceType('metal_with_stone_diamond_carat')}
                            >
                                <div className="option-radio-indicator">
                                    <input
                                        type="radio"
                                        id="price_type_metal_stone_carat"
                                        name="priceType"
                                        value="metal_with_stone_diamond_carat"
                                        checked={priceType === 'metal_with_stone_diamond_carat'}
                                        onChange={() => setPriceType('metal_with_stone_diamond_carat')}
                                    />
                                </div>
                                <div className="option-info">
                                    <div className="option-title-row">
                                        <LayersIcon className="option-icon" />
                                        <span className="option-title">{translations.metalwithstonediamondcarat}</span>
                                    </div>
                                    <p className="option-description">
                                        {translations.metalwithstonediamondcaratdesc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* Mode 1: Metal wise */}
                    {/* ========================================================= */}
                    {priceType === 'metal_wise' && (
                        <div className="recipe-items-container">
                            <div className="recipe-items-header-bar">
                                <label className="section-label">
                                    {translations.metalwiseprices} *
                                </label>
                            </div>

                            <div className="recipe-items-table">
                                <div className="table-header">
                                    <div className="col-material">{translations.metal} *</div>
                                    <div className="col-quantity">{translations.price} *</div>
                                    <div className="col-action"></div>
                                </div>

                                {metalWisePrices.map((row, idx) => (
                                    <div key={idx} className="table-row">
                                        <div className="col-material">
                                            <Dropdown
                                                options={getMetalOptionsForIndex(idx)}
                                                selectedValue={row.metalid}
                                                onValueChange={(val) => handleMetalWiseChange(idx, 'metalid', val)}
                                                labelKey="displayLabel"
                                                valueKey="metalid"
                                                placeholder={translations.selectmetal}
                                            />
                                        </div>
                                        <div className="col-quantity">
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="price-input"
                                                placeholder={translations.priceplaceholder}
                                                value={row.price}
                                                onChange={(e) => handleMetalWiseChange(idx, 'price', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-action">
                                            {metalWisePrices.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="delete-row-btn"
                                                    onClick={() => handleRemoveMetalWiseRow(idx)}
                                                    title={translations.delete}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="table-actions-bar">
                                <button
                                    type="button"
                                    className="add-ingredient-inline-btn"
                                    onClick={handleAddMetalWiseRow}
                                    disabled={formattedMetals.length > 0 && metalWisePrices.length >= formattedMetals.length}
                                >
                                    <AddIcon fontSize="small" /> {translations.addmetal}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* Mode 2: Metal with Diamond Carat */}
                    {/* ========================================================= */}
                    {priceType === 'metal_with_diamond_carat' && (
                        <div className="addon-recipes-section">
                            <div className="addon-recipes-header-bar">
                                <label className="section-label">
                                    {translations.metalwithdiamondcaratprices} *
                                </label>
                            </div>

                            {metalWithDiamondCaratPrices.map((metalGroup, mIdx) => (
                                <div key={mIdx} className="addon-recipe-card">
                                    <div className="addon-card-header">
                                        <div className="addon-selector-wrap">
                                            <label className="addon-field-label">
                                                {translations.metal} *
                                            </label>
                                            <Dropdown
                                                options={getMetalGroupOptionsForIndex(mIdx)}
                                                selectedValue={metalGroup.metalid}
                                                onValueChange={(val) => handleMetalGroupChange(mIdx, val)}
                                                labelKey="displayLabel"
                                                valueKey="metalid"
                                                placeholder={translations.selectmetal}
                                            />
                                        </div>
                                        {metalWithDiamondCaratPrices.length > 1 && (
                                            <button
                                                type="button"
                                                className="delete-card-btn"
                                                onClick={() => handleRemoveMetalGroup(mIdx)}
                                                title={translations.delete}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="recipe-items-table">
                                        <div className="table-header">
                                            <div className="col-material">{translations.diamondcarat} *</div>
                                            <div className="col-quantity">{translations.price} *</div>
                                            <div className="col-action"></div>
                                        </div>

                                        {metalGroup.caratPrices.map((cRow, cIdx) => (
                                            <div key={cIdx} className="table-row">
                                                <div className="col-material">
                                                    <Dropdown
                                                        options={getCaratOptionsForIndex(mIdx, cIdx)}
                                                        selectedValue={cRow.diamondsizeid}
                                                        onValueChange={(val) => handleCaratChange(mIdx, cIdx, 'diamondsizeid', val)}
                                                        labelKey="displayLabel"
                                                        valueKey="diamondsizeid"
                                                        placeholder={translations.selectdiamondcarat}
                                                    />
                                                </div>
                                                <div className="col-quantity">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        className="price-input"
                                                        placeholder={translations.priceplaceholder}
                                                        value={cRow.price}
                                                        onChange={(e) => handleCaratChange(mIdx, cIdx, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-action">
                                                    {metalGroup.caratPrices.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="delete-row-btn"
                                                            onClick={() => handleRemoveCaratRow(mIdx, cIdx)}
                                                            title={translations.delete}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="table-actions-bar">
                                        <button
                                            type="button"
                                            className="add-ingredient-inline-btn"
                                            onClick={() => handleAddCaratRow(mIdx)}
                                            disabled={formattedDiamondSizes.length > 0 && metalGroup.caratPrices.length >= formattedDiamondSizes.length}
                                        >
                                            <AddIcon fontSize="small" /> {translations.adddiamondcarat}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="addon-recipes-footer-bar">
                                <button
                                    type="button"
                                    className="addon-btn"
                                    onClick={handleAddMetalGroup}
                                    disabled={formattedMetals.length > 0 && metalWithDiamondCaratPrices.length >= formattedMetals.length}
                                >
                                    <AddIcon fontSize="small" /> {translations.addmetal}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* Mode 3: Metal with Stone */}
                    {/* ========================================================= */}
                    {priceType === 'metal_with_stone' && (
                        <div className="addon-recipes-section">
                            <div className="addon-recipes-header-bar">
                                <label className="section-label">
                                    {translations.metalwithstoneprices} *
                                </label>
                            </div>

                            {metalWithStonePrices.map((metalGroup, mIdx) => (
                                <div key={mIdx} className="addon-recipe-card">
                                    <div className="addon-card-header">
                                        <div className="addon-selector-wrap">
                                            <label className="addon-field-label">
                                                {translations.metal} *
                                            </label>
                                            <Dropdown
                                                options={getMetalWithStoneGroupOptions(mIdx)}
                                                selectedValue={metalGroup.metalid}
                                                onValueChange={(val) => handleMetalWithStoneGroupChange(mIdx, val)}
                                                labelKey="displayLabel"
                                                valueKey="metalid"
                                                placeholder={translations.selectmetal}
                                            />
                                        </div>
                                        {metalWithStonePrices.length > 1 && (
                                            <button
                                                type="button"
                                                className="delete-card-btn"
                                                onClick={() => handleRemoveMetalWithStoneGroup(mIdx)}
                                                title={translations.delete}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="recipe-items-table">
                                        <div className="table-header">
                                            <div className="col-material">{translations.gemstone} *</div>
                                            <div className="col-quantity">{translations.price} *</div>
                                            <div className="col-action"></div>
                                        </div>

                                        {metalGroup.stonePrices.map((sRow, sIdx) => (
                                            <div key={sIdx} className="table-row">
                                                <div className="col-material">
                                                    <Dropdown
                                                        options={getStoneOptionsForIndex(mIdx, sIdx)}
                                                        selectedValue={sRow.stoneid}
                                                        onValueChange={(val) => handleStoneChange(mIdx, sIdx, 'stoneid', val)}
                                                        labelKey="displayLabel"
                                                        valueKey="stoneid"
                                                        placeholder={translations.selectstone}
                                                    />
                                                </div>
                                                <div className="col-quantity">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        className="price-input"
                                                        placeholder={translations.priceplaceholder}
                                                        value={sRow.price}
                                                        onChange={(e) => handleStoneChange(mIdx, sIdx, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-action">
                                                    {metalGroup.stonePrices.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="delete-row-btn"
                                                            onClick={() => handleRemoveStoneRow(mIdx, sIdx)}
                                                            title={translations.delete}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="table-actions-bar">
                                        <button
                                            type="button"
                                            className="add-ingredient-inline-btn"
                                            onClick={() => handleAddStoneRow(mIdx)}
                                            disabled={availableStones.length > 0 && metalGroup.stonePrices.length >= availableStones.length}
                                        >
                                            <AddIcon fontSize="small" /> {translations.addstone}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="addon-recipes-footer-bar">
                                <button
                                    type="button"
                                    className="addon-btn"
                                    onClick={handleAddMetalWithStoneGroup}
                                    disabled={formattedMetals.length > 0 && metalWithStonePrices.length >= formattedMetals.length}
                                >
                                    <AddIcon fontSize="small" /> {translations.addmetal}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* Mode 4: Metal with Stone & Diamond Carat */}
                    {/* ========================================================= */}
                    {priceType === 'metal_with_stone_diamond_carat' && (
                        <div className="addon-recipes-section">
                            <div className="addon-recipes-header-bar">
                                <label className="section-label">
                                    {translations.metalwithstonediamondcaratprices} *
                                </label>
                            </div>

                            {metalWithStoneDiamondCaratPrices.map((group, mIdx) => (
                                <div key={mIdx} className="addon-recipe-card">
                                    <div className="addon-card-header">
                                        <div className="addon-selectors-row">
                                            <div className="addon-selector-wrap">
                                                <label className="addon-field-label">
                                                    {translations.metal} *
                                                </label>
                                                <Dropdown
                                                    options={formattedMetals}
                                                    selectedValue={group.metalid}
                                                    onValueChange={(val) => handleMetalWithStoneCaratGroupChange(mIdx, 'metalid', val)}
                                                    labelKey="displayLabel"
                                                    valueKey="metalid"
                                                    placeholder={translations.selectmetal}
                                                />
                                            </div>
                                            <div className="addon-selector-wrap">
                                                <label className="addon-field-label">
                                                    {translations.gemstone} *
                                                </label>
                                                <Dropdown
                                                    options={availableStones}
                                                    selectedValue={group.stoneid}
                                                    onValueChange={(val) => handleMetalWithStoneCaratGroupChange(mIdx, 'stoneid', val)}
                                                    labelKey="displayLabel"
                                                    valueKey="stoneid"
                                                    placeholder={translations.selectstone}
                                                />
                                            </div>
                                        </div>
                                        {metalWithStoneDiamondCaratPrices.length > 1 && (
                                            <button
                                                type="button"
                                                className="delete-card-btn"
                                                onClick={() => handleRemoveMetalWithStoneCaratGroup(mIdx)}
                                                title={translations.delete}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="recipe-items-table">
                                        <div className="table-header">
                                            <div className="col-material">{translations.diamondcarat} *</div>
                                            <div className="col-quantity">{translations.price} *</div>
                                            <div className="col-action"></div>
                                        </div>

                                        {group.caratPrices.map((cRow, cIdx) => (
                                            <div key={cIdx} className="table-row">
                                                <div className="col-material">
                                                    <Dropdown
                                                        options={getCaratOptionsForMetalStoneIndex(mIdx, cIdx)}
                                                        selectedValue={cRow.diamondsizeid}
                                                        onValueChange={(val) => handleCaratChangeForMetalStone(mIdx, cIdx, 'diamondsizeid', val)}
                                                        labelKey="displayLabel"
                                                        valueKey="diamondsizeid"
                                                        placeholder={translations.selectdiamondcarat}
                                                    />
                                                </div>
                                                <div className="col-quantity">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        className="price-input"
                                                        placeholder={translations.priceplaceholder}
                                                        value={cRow.price}
                                                        onChange={(e) => handleCaratChangeForMetalStone(mIdx, cIdx, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-action">
                                                    {group.caratPrices.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="delete-row-btn"
                                                            onClick={() => handleRemoveCaratRowForMetalStone(mIdx, cIdx)}
                                                            title={translations.delete}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="table-actions-bar">
                                        <button
                                            type="button"
                                            className="add-ingredient-inline-btn"
                                            onClick={() => handleAddCaratRowForMetalStone(mIdx)}
                                            disabled={formattedDiamondSizes.length > 0 && group.caratPrices.length >= formattedDiamondSizes.length}
                                        >
                                            <AddIcon fontSize="small" /> {translations.adddiamondcarat}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="addon-recipes-footer-bar">
                                <button
                                    type="button"
                                    className="addon-btn"
                                    onClick={handleAddMetalWithStoneCaratGroup}
                                >
                                    <AddIcon fontSize="small" /> {translations.addmetalwithstone}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* Form Action Buttons */}
                    {/* ========================================================= */}
                    <div className="price-form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary cancelbtn"
                            onClick={handleReset}
                            disabled={isSaving}
                        >
                            <RestartAltIcon fontSize="small" /> {translations.reset}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={isSaving}
                        >
                            <SaveIcon fontSize="small" /> {isSaving ? translations.saving : translations.saveprice}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ItemPriceTab;