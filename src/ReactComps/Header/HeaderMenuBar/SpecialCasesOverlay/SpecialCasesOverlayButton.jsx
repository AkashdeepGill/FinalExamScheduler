import {useState} from "react";
import SpecialCasesOverlay from "./SpecialCasesOverlay";

export default function SpecialCasesOverlayButton(){
    const [showSpecialCasesOverlay, setShowSpecialCasesOverlay] = useState(false);
    return (
        <div>
            <button onClick={() => setShowSpecialCasesOverlay(!showSpecialCasesOverlay)}>
                Special Cases Editor
            </button>
            {showSpecialCasesOverlay && (
                <SpecialCasesOverlay onClose={() => setShowSpecialCasesOverlay(false)}/>
            )}
        </div>
    );
}