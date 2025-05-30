import {
  importCourses,
  userImportRooms,
  userImportSICatalog,
  userImportSpecialCases,
} from "../../../FinalExamScheduler.js";
import React from "react";
import ImportButton from "./ImportButton.jsx";
import "./TopMenuBar.css"
const handleReadImportCourses = (event) => {
  const data = event.target.result;
  importCourses(data);
};

const handleReadImportCatalog = (event) => {
  const data = event.target.result;
  userImportSICatalog(data);
};

const handleReadImportRooms = (event) => {
  const data = event.target.result;
  userImportRooms(data);
};

const handleReadSpecialCases = (event) => {
  const data = event.target.result;
  userImportSpecialCases(data);
};

export default function TopMenuBar(props) {
  function onGenerateClick() {
    props.onGenerateClick();
  }
  return (
      <div className="Menu-Bar">
        <div className="Left-Menu-Bar">
          <ImportButton id={"courseSchedule"} importFunction={handleReadImportCourses}>Course Schedule</ImportButton>
          <ImportButton id={"classList"} importFunction={handleReadImportCatalog}>Class List</ImportButton>
          <ImportButton id={"roomList"} importFunction={handleReadImportRooms}>Rooms list</ImportButton>
          <ImportButton id={"specialCases"} importFunction={handleReadSpecialCases}>Special Cases list</ImportButton>
          <div className="Generate-Div">
            <button
              id="generateScheduleButton"
              data-testid={"generateScheduleButton"}
              onClick={onGenerateClick}
            >
              Generate Schedule
            </button>
          </div>
        </div>
      </div>
  );
}
