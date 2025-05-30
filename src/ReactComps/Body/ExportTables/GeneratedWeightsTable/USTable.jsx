import React, { useEffect, useState } from "react";
import USRow from "./USRow.jsx";
import { useSelector } from "react-redux";
import TableHeaderBar from "../TableComponents/TableHeaderBar.jsx";
import './WeightsTable.css'
/* The US Table component will contain information about undesirable scenarios for the generated
 *  final exam schedule
 */
export default function USTable() {
  const [reducerNames] = useState([
    "roomDoubleBooked",
    "roomTooSmall",
    "instructorDoubleBooked",
    "studentDoubleBooked",
    "threeSameDayExams",
    "sameDayPriorityExams",
    "lateCommonFinal",
    "fridayCommonFinal",
    "nonCommonFinal",
  ]);
  const reducer = useSelector((state) => state.generatedWeights);
  const [totalWeight, setTotalWeight] = useState(0);
  function calculateTotalWeight() {
    let total = 0;
    for (const key in reducer) {
      if (reducer.hasOwnProperty(key)) {
        const subReducer = reducer[key];
        total += subReducer.penalty * subReducer.instances.length;
      }
    }
    setTotalWeight(total);
  }

  useEffect(() => {
    calculateTotalWeight();
  }, [reducer]);

  return (
    <div id="Weight-Div">
      <TableHeaderBar label={`Generated Weight: ${totalWeight}`} optionsBar={false}></TableHeaderBar>
      <div>
        <table>
          <thead>
            <tr>
              <th id="Name-Header">Name</th>
              <th>Num Instances</th>
              <th>Weight per Instance</th>
              <th>Total Weight</th>
            </tr>
          </thead>
          <tbody id="weightTable">
            {reducerNames.map((name, index) => {
              return <USRow name={name} key={`${name}-${index}`} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
