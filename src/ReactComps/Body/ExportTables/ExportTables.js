import React from "react";
import ScheduledTable from "./SchedulingTables/ScheduledTable.jsx";
import UnscheduledTable from "./SchedulingTables/UnscheduledTable.jsx";
import USTable from "./GeneratedWeightsTable/USTable.jsx";
import './ExportTables.css'
export default function ExportTables(props) {
  return (
    <div id = 'export-tables-container'>
      <USTable />
      <UnscheduledTable setSelectedCourse={props.setSelectedCourse} />
      <ScheduledTable />
    </div>
  );
}
