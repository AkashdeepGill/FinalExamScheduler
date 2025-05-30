import React from "react";
import { useState } from "react";

export default function ImportButton({ children, id, importFunction }) {
  const [fileName, setFileName] = useState("No file chosen");

  const handleImport = (event) => {
    let file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = importFunction;
    reader.readAsText(file);
    setFileName(file.name);
  };

  return (
    <div className="import-button">
      <p className="Upload-Button-Title">{children}</p>
      <div className="Upload-File">
        <input type="file" id={id} onChange={handleImport} hidden />
        <label className="importLabel" htmlFor={id}>
          Choose File
        </label>
        <span className="fileName" id="courseScheduleName">
          {fileName}
        </span>
      </div>
    </div>
  );
}
