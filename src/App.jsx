//---------------- IMPORTS ----------------//

import "./App.css";
import {
    importAllOnAppStart,
    getRooms,
} from "./FinalExamScheduler.js";

//---------------- COMPONENTS ----------------//
import {Provider, useSelector} from "react-redux";
import ProgressBar from "./ReactComps/ProgressBar/ProgressBar.jsx";
import Header from "./ReactComps/Header/Header.jsx";
import Body from "./ReactComps/Body/Body.jsx";

//---------------- INIT APP ----------------//

export function getMedia(filename){
  return `/media/${filename}`;
}

function App() {
    const progress = useSelector((state) => state.progress.progress);

    if (getRooms() === undefined) {
        importAllOnAppStart();
    }

    return (
        <div className="App">
            <Header></Header>
            <Body></Body>
            {progress >= 0 && <ProgressBar/>}
        </div>
    );
}

export default App;
