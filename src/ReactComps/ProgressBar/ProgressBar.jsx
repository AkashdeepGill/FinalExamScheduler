import React from "react";
import { useSelector } from "react-redux";
import "./ProgressBar.css";

function ProgressBar() {
  const progress = useSelector((state) => state.progress.progress);

  let statusText;
  if (progress <= 0) {
    statusText = "Processing Schedule...";
  } else if (progress === 100) {
    statusText = "Finalizing Schedule...";
  } else {
    statusText = `Generating Schedule... (${progress.toFixed(1)}%)`;
  }
  return (
    <div className="overlay-container">
      <div className="progress-container">
        <div className="progress-text">{statusText}</div>
        <div className="progress-bar">
          <div className="progressBarFill" style={{ width: `${progress}%` }}>
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
