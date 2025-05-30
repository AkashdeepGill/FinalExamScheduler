//---------------- IMPORTS ----------------//

import "./Body.css";
import { generateSchedule } from "../../FinalExamScheduler.js";

import React, { useState } from "react";

//---------------- COMPONENTS ----------------//

import TopMenuBar from "./MenuBar/TopMenuBar.jsx";
import ExportTables from "./ExportTables/ExportTables.js";
import ManualScheduleModal from "./ManualScheduleModal/ManualScheduleModal.jsx";

export default function Body() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  function closeModal() {
    setSelectedCourse(null);
  }

  const onGenScheduleClick = () => {
    generateSchedule();
  };

  return (
    <div id="body">
      <TopMenuBar onGenerateClick={onGenScheduleClick} />
      <ExportTables setSelectedCourse={setSelectedCourse} />
      {selectedCourse && (
        <ManualScheduleModal course={selectedCourse} onClose={closeModal} />
      )}
    </div>
  );
}
