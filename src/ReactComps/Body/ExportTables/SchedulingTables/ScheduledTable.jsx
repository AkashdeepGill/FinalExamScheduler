import React, { useState, useMemo, useEffect } from "react";
import { getRoom, unscheduleExam } from "../../../../FinalExamScheduler.js";
import { indexToDay, indexToTime } from "../../../../Import/FileIO.js";
import { useDispatch, useSelector } from "react-redux";
import { unscheduleCourse } from "../../../../Redux/Slices/courseSlice.js";
import ReturnToTopButton from "../TableComponents/ReturnToTopButton.jsx";
import TableHeaderBar from "../TableComponents/TableHeaderBar.jsx";

function ScheduleBody({courses}) {
  const dispatch = useDispatch();
  return (
    <tbody id="schedule">
      {courses.map((course) => {
        return (
          <tr key={course.courseCode}>
            <td>{course.courseCode.substring(0, 10)}</td>
            <td>{course.courseCode.substring(10)}</td>
            <td>{course.examRoom}</td>
            <td>
              {course.numOfStudents +
                "/" +
                (course.examRoom ? getRoom(course.examRoom).capacity : 0)}
            </td>
            <td>{indexToTime(course.examTime)}</td>
            <td>{indexToDay(course.examDay)}</td>
            <td
              className={"unschedule-exam"}
              onClick={() => {
                unscheduleExam(course.courseCode);
                dispatch(unscheduleCourse({ courseId: course.courseCode }));
              }}
            >
              {"X"}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

export default function ScheduledTable(props) {
  const [returnVisible, setReturnVisible] = useState(true);
  const reducer = useSelector((state) => state.courses);
  const [rows, setRows] = useState(Object.values(reducer.scheduledCourses));
  const [searchString, setSearchString] = useState("");
  const [depFilter, setDepFilter] = useState("");
  useEffect(() => {
    window.addEventListener("scroll", listenToScroll);
    return () => window.removeEventListener("scroll", listenToScroll);
  }, []);

  const listenToScroll = () => {
    const heightToHideFrom = getOffset(
      document.getElementById("Scheduled-Courses"),
    );
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    if (winScroll > heightToHideFrom) {
      returnVisible && setReturnVisible(true);
    } else {
      setReturnVisible(false);
    }
  };

  function filterDepartment(courses, department) {
    return courses.filter((course) => course.courseCode.includes(department));
  }

  function search(courses, searchString) {
    const lowercase = searchString.toLowerCase();
    return courses.filter(
      (course) =>
        course.courseCode.toLowerCase().includes(lowercase) ||
        course.numOfStudents.toString().includes(lowercase) ||
        indexToDay(course.examDay).toString().toLowerCase().includes(lowercase) ||
        course.examRoom.toLowerCase().includes(lowercase) 
    );
  }

  useEffect(() => {
    setRows(
      search(filterDepartment(Object.values(reducer.scheduledCourses), depFilter), searchString)
    );
  }, [reducer.scheduledCourses, searchString, depFilter]);

  const getOffset = (element) => {
    const rect = element?.getBoundingClientRect();
    let scrollTop = window.scrollY || document.documentElement.scrollTop;

    return rect.top + scrollTop;
  };
  return (
    <div id="Scheduled-Div">
      <TableHeaderBar
        setDepFilter={(filter) => setDepFilter(filter)}
        setSearchString={(string) => setSearchString(string.toUpperCase())}
        label={`ScheduledCourses`}
      ></TableHeaderBar>
      <div>
        <table id={"Scheduled-Courses"}>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Section</th>
              <th>Room Number</th>
              <th>Capacity</th>
              <th>Exam Time</th>
              <th>Exam Day</th>
              <th></th>
            </tr>
          </thead>
          <ScheduleBody courses = {rows}/>
        </table>
      </div>
      {returnVisible && <ReturnToTopButton />}
    </div>
  );
}
