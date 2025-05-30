import {useState} from "react";
import ManualOverlay from "./ManualOverlay.jsx";

export default function ManualButton() {
    const [showManual, setShowManual] = useState(false)
    return (
        <div>
            <button onClick={() => setShowManual(!showManual)}>
                How to Use
            </button>
            {showManual && (
                <ManualOverlay onClose={() => setShowManual(false)}/>
            )}
        </div>
    );
}