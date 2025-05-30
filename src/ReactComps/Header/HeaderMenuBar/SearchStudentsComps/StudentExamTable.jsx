import React from "react";
import StudentExamRow from "./StudentExamRow.jsx";

export default function StudentExamTable(props) {
  return (
    <>
      <h1>Final Exam Schedule for {props.id}</h1>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
          </tr>
          <tr>
            <td>8:00 am - 10:00 am</td>
            <StudentExamRow data={props.t1} />
          </tr>
          <tr>
            <td>11:00 am - 1:00 pm</td>
            <StudentExamRow data={props.t2} />
          </tr>
          <tr>
            <td>2:00 pm - 4:00 pm</td>
            <StudentExamRow data={props.t3} />
          </tr>
          <tr>
            <td>5:30 pm - 7:30 pm</td>
            <StudentExamRow data={props.t4} />
          </tr>
          <tr>
            <td>8:00 pm - 10:00 pm</td>
            <StudentExamRow data={props.t5} />
          </tr>
        </tbody>
      </table>
    </>
  );
}
