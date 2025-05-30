import React from "react";
import './ModalComponents.css'
export default function ClassDescriptionTable(props) {
  const course = props.course;
  return (
    <div id="Selected-Course">
      <div className="Table-Header-Bar">
        <div className="Table-Label">
          <label>Selected Course</label>
        </div>
        <button onClick={props.closeModal}>X</button>
      </div>
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
          <tbody id="selectedCourseTable">
            <tr>
              <td>
                {course.courseCode.substring(0, course.courseCode.length - 3)}
              </td>
              <td>
                {course.courseCode.substring(course.courseCode.length - 3)}
              </td>
              <td>{course.numOfStudents}</td>
              <td>{course.teacherID}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
