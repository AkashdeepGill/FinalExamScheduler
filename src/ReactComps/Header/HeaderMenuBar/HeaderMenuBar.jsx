import React from "react";
import { newOutputFile } from "../../../WishTheyWereReactComponents/uiFunction";
import SearchStudentsButton from "./SearchStudentsComps/SearchStudentButton";
import GeneratePDFButton from "./GeneratePDFComps/GeneratePDFButton";
import './HeaderMenuBar.css'
import SpecialCasesOverlayButton from "./SpecialCasesOverlay/SpecialCasesOverlayButton.jsx";
import ManualButton from "./Manual/ManualButton.jsx";
export default function HeaderMenuBar(props) {
  return (
    <div className={"Header-MenuBar"}>
      <button onClick={newOutputFile}>Export Exam Schedule</button>
      <SpecialCasesOverlayButton></SpecialCasesOverlayButton>
      <SearchStudentsButton></SearchStudentsButton>
      <GeneratePDFButton></GeneratePDFButton>
      <ManualButton/>
    </div>
  );
}
