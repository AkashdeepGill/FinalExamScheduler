import React from "react";
import { useSelector } from "react-redux";
import { useMemo, useEffect, useState } from "react";
import TableHeaderBar from "../TableComponents/TableHeaderBar.jsx";

function UnscheduleBody({ courses, setSelectedCourse }) {
  return (
    <tbody id="unscheduledClasses" className="unscheduleBody">
      {courses.map((course) => (
        <tr
          key={course.courseCode}
          uclassrow={course.courseCode}
          className={"unscheduled-course"}
          onClick={() => {
            setSelectedCourse(course);
          }}
        >
          <td>{course.courseCode.substring(0, 10)}</td>
          <td>{course.courseCode.substring(10)}</td>
          <td>{course.numOfStudents}</td>
          <td>{course.teacherID}</td>
        </tr>
      ))}
    </tbody>
  );
}

export default function UnscheduledTable(props) {
  const reducer = useSelector((state) => state.courses);
  const [rows, setRows] = useState(Object.values(reducer.unscheduledCourses));
  const [searchString, setSearchString] = useState("");
  const [depFilter, setDepFilter] = useState("");

  const numUS = useMemo(() => {
    // Convert the object values to an array and memoize it
    return Object.keys(reducer.unscheduledCourses).length;
  }, [reducer.unscheduledCourses]);

  function filterDepartment(courses, department) {
    return courses.filter((course) => {
      // Check if course.courseCode is defined and is a string
      if (course.courseCode && typeof course.courseCode === 'string') {
        // Use .includes() only if course.courseCode is valid
        return course.courseCode.includes(department);
      }
      // If course.courseCode is undefined or not a string, filter it out
      return false;
    });
  }


  function search(courses) {
    return courses.filter(
      (course) =>
        course.courseCode.includes(searchString) ||
        course.teacherID.includes(searchString) ||
        course.numOfStudents.toString().includes(searchString)
    );
  }

  useEffect(() => {
    setRows(
      search(filterDepartment(Object.values(reducer.unscheduledCourses), depFilter), searchString)
    );
  }, [reducer.unscheduledCourses, searchString, depFilter]);

  return (
    <div id="Unscheduled-Div">
      <TableHeaderBar
        setDepFilter={(filter) => setDepFilter(filter)}
        setSearchString={(string) => setSearchString(string.toUpperCase())}
        label={`Unscheduled Courses (${numUS})`}
      ></TableHeaderBar>
      <div>
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Section</th>
              <th># of Students</th>
              <th>Instructor ID</th>
            </tr>
          </thead>
          <UnscheduleBody
            courses={rows}
            setSelectedCourse={props.setSelectedCourse}
          />
        </table>
      </div>
    </div>
  );
}
