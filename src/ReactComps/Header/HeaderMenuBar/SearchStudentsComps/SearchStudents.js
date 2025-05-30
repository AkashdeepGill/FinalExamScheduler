import React, { useState } from "react";
import "../../../../FinalExamScheduler.js";
import { getSI_Catalog } from "../../../../FinalExamScheduler.js";
import "../../../../CONSTANTS.js";
import ReactModal from "react-modal";
import StudentExamTable from "./StudentExamTable.jsx";
import './SearchStudentsComps.css'
/**
 * This component describes the search bar and button for searching for a specific student
 * final exam schedule.
 * @returns {JSX.Element}
 * @constructor
 */
export default function SearchStudents(props) {
  const studentID = props.studentID;
  const [t1, setT1] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ]);
  const [t2, setT2] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ]);
  const [t3, setT3] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ]);
  const [t4, setT4] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ]);
  const [t5, setT5] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ]);

  const searchStudents = () => {
    let students = getSI_Catalog().getStudentCatalog();
    let student = null;
    if (studentID !== "") {
      student = students.get(studentID);
    }

    if (student !== undefined) {
      sortCourses(student.courses, student.studentID);
    }
  };

  const sortCourses = (courses) => {
    const newT1 = [
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ];
    const newT2 = [
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ];
    const newT3 = [
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ];
    const newT4 = [
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ];
    const newT5 = [
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
    ];
    courses.forEach((values) => {
      if (values.examTime === 0) {
        newT1[values.examDay][0] = values.courseCode;
        newT1[values.examDay][1] = "Location: " + values.examRoom;
      } else if (values.examTime === 1) {
        newT2[values.examDay][0] = values.courseCode;
        newT2[values.examDay][1] = "Location: " + values.examRoom;
      } else if (values.examTime === 2) {
        newT3[values.examDay][0] = values.courseCode;
        newT3[values.examDay][1] = "Location: " + values.examRoom;
      } else if (values.examTime === 3) {
        newT4[values.examDay][0] = values.courseCode;
        newT4[values.examDay][1] = "Location: " + values.examRoom;
      } else if (values.examTime === 4) {
        newT5[values.examDay][0] = values.courseCode;
        newT5[values.examDay][1] = "Location: " + values.examRoom;
      }
    });

    setT1(newT1);
    setT2(newT2);
    setT3(newT3);
    setT4(newT4);
    setT5(newT5);
  };

  const outputStudentSchedule = () => {
    let outputData = "time\tmonday\ttuesday\tthursday\tfriday\tsaturday\n";
    let t1Out = ["08:00 am - 10:00 am", "", "", "", "", "", ""];
    let t1Locations = ["Locations:", "", "", "", "", "", ""];
    let t2Out = ["11:00 am - 01:00 pm", "", "", "", "", "", ""];
    let t2Locations = ["Locations:", "", "", "", "", "", ""];
    let t3Out = ["02:00 pm - 04:00 pm", "", "", "", "", "", ""];
    let t3Locations = ["Locations:", "", "", "", "", "", ""];
    let t4Out = ["05:30 pm - 07:30 pm", "", "", "", "", "", ""];
    let t4Locations = ["Locations:", "", "", "", "", "", ""];
    let t5Out = ["08:00 pm - 10:00 pm", "", "", "", "", "", ""];
    let t5Locations = ["Locations:", "", "", "", "", "", ""];

    t1Out = returnLocationOrTime(t1Out, t1, 0);
    t1Locations = returnLocationOrTime(t1Locations, this.state.t1, 1);

    t2Out = returnLocationOrTime(t2Out, this.state.t2, 0);
    t2Locations = returnLocationOrTime(t2Locations, this.state.t2, 1);

    t3Out = returnLocationOrTime(t3Out, this.state.t3, 0);
    t3Locations = returnLocationOrTime(t3Locations, this.state.t3, 1);

    t4Out = returnLocationOrTime(t4Out, this.state.t4, 0);
    t4Locations = returnLocationOrTime(t4Locations, this.state.t4, 1);

    t5Out = returnLocationOrTime(t5Out, this.state.t5, 0);
    t5Locations = returnLocationOrTime(t5Locations, this.state.t5, 1);

    outputData +=
      t1Out.join("\t") +
      "\n" +
      t1Locations.join("\t") +
      "\n" +
      t2Out.join("\t") +
      "\n" +
      t2Locations.join("\t") +
      "\n" +
      t3Out.join("\t") +
      "\n" +
      t3Locations.join("\t") +
      "\n" +
      t4Out.join("\t") +
      "\n" +
      t4Locations.join("\t") +
      "\n" +
      t5Out.join("\t") +
      "\n" +
      t5Locations.join("\t") +
      "\n";

    let studentSched = document.createElement("a");
    studentSched.href = URL.createObjectURL(
      new Blob([outputData], { type: "text/plain" }),
    );
    studentSched.download = this.state.studentID + "Sched.txt";
    studentSched.click();
  };

  const returnLocationOrTime = (locationsOrTime, state, type) => {
    for (let i = 0; i < locationsOrTime.length - 1; i++) {
      locationsOrTime[i + 1] = state[i][type];
    }
    return locationsOrTime;
  };

  return (
    <div className="Modal-Container">
      <ReactModal
        isOpen={props.isOpen}
        onAfterOpen={searchStudents}
        onRequestClose={props.closeModal}
        ariaHideApp={false}
      >
        <div>
          <StudentExamTable
            id={studentID}
            t1={t1}
            t2={t2}
            t3={t3}
            t4={t4}
            t5={t5}
          />
        </div>
        <div id="Modal-Buttons-Div">
          <button className="cancel-Modal-Button" onClick={props.closeModal}>
            Close
          </button>
          <button
            className="Schedule-Modal-Button"
            onClick={outputStudentSchedule}
          >
            Export
          </button>
        </div>
      </ReactModal>
    </div>
  );
}
