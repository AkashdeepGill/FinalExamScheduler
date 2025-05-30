import React, { useState } from "react";
import './WeightsTable.css'
export default function USInstancesTable({ data }) {
  const attributes = data.length > 0 ? Object.keys(data[0]) : [];
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = data.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const canDecrease = currentPage > 1;
  const canIncrease = currentPage < totalPages;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const decreasePage = () => {
    if (canDecrease) {
      paginate(currentPage - 1);
    }
  };

  const increasePage = () => {
    if (canIncrease) {
      paginate(currentPage + 1);
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      attributes.join(","), // CSV header row
      ...data.map((item) => attributes.map((attr) => item[attr]).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instances.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            {attributes.map((attribute, index) => (
              <th key={index}>{attribute.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr key={index}>
              {attributes.map((attribute, index) => (
                <td key={index}>{item[attribute]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {canDecrease && <button onClick={decreasePage}>{"<"}</button>}
        {canIncrease && <button onClick={increasePage}>{">"}</button>}
      </div>
      <button onClick={downloadCSV} className={"download-instance-csv-button"}>
        Download CSV
      </button>
    </div>
  );
}
