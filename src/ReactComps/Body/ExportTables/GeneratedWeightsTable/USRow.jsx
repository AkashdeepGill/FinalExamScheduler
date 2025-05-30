import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import USInstancesTable from "./USInstancesTable.jsx";
import { updateWeightPenalty } from "../../../../Redux/Slices/generatedStatesSlice.js";
import './WeightsTable.css'
export default function USRow({ name }) {
  const [showTable, setShowTable] = useState(false);
  const [hover, setHover] = useState(false);
  const reducer = useSelector((state) => state.generatedWeights[name]);
  const [value, setValue] = useState(reducer.penalty);
  const handleInputChange = (e) => {
    setValue(e.target.value);
  };
  const handleBlur = (e) => {
    if (e.target.value === "") {
      setValue(0);
      dispatch(updateWeightPenalty({ title: name, value: 0 }));
    } else {
      dispatch(updateWeightPenalty({ title: name, value: value }));
    }
  };
  const dispatch = useDispatch();
  return (
    <>
      <tr
        onClick={() =>
          setShowTable(reducer.instances.length > 0 ? !showTable : false)
        }
        className={"USRow"}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <td className={hover ? "underline" : ""}>{reducer.fullName}</td>
        <td>{reducer.instances.length}</td>
        <td>
          <input
            type="number"
            value={value}
            className="weights-input"
            onChange={handleInputChange}
            onBlur={handleBlur}
          ></input>
        </td>
        <td>{reducer.instances.length * reducer.penalty}</td>
      </tr>
      {showTable && (
        <tr>
          <td>
            <USInstancesTable data={reducer.instances} />
          </td>
        </tr>
      )}
    </>
  );
}
