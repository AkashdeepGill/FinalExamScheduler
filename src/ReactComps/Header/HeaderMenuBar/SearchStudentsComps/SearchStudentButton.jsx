import React from "react";
import { useState } from "react";
import OverlayInput from "../OverlayInput";
import SearchStudents from "./SearchStudents";
export default function SearchStudentsButton() {
  const [studentID, setStudentID] = useState("");
  const [showStudentOverlayInput, setShowStudentOverlayInput] = useState(false);
  const [studentSearchModalIsOpen, setStudentSearchOpen] = useState(false);

  function openStudentSearch() {
    setStudentSearchOpen(true);
  }

  function closeStudentSearch() {
    setStudentSearchOpen(false);
  }

  function displayStudent(studentID) {
    setShowStudentOverlayInput(false);
    setStudentID(studentID);
    openStudentSearch();
  }

  return (
    <div>
      {showStudentOverlayInput && (
        <OverlayInput
          onEnter={displayStudent}
          onClose={() => setShowStudentOverlayInput(false)}
          title={"Student Exam Lookup by Student ID"}
          description={"A Student ID"}
          forceNumber={true}
        />
      )}
      <button
        className="Search-Student"
        onClick={() => setShowStudentOverlayInput(true)}
      >
        Search a Student
      </button>

      <SearchStudents
        closeModal={closeStudentSearch}
        isOpen={studentSearchModalIsOpen}
        openStudentScheduleModal={openStudentSearch}
        studentID={studentID}
      />
    </div>
  );
}
