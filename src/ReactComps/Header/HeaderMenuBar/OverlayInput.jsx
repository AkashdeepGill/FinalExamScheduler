import { useState } from "react";

export default function OverlayInput(props) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    if (props.forceNumber) {
      // If forceNumber is true, only allow numeric input
      setInputValue(e.target.value.replace(/[^0-9]/g, ""));
    } else {
      setInputValue(e.target.value);
    }
  };

  function onSubmit() {
    props.onEnter(inputValue);
  }

  return (
    <div className="title-input-overlay-container">
      <div className="title-input-overlay">
        <div>
        <span>{props.title}</span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`Enter ${props.description}`}
        />
        </div>
        <div>
        <button onClick={onSubmit} className={"overlay-submit-button"}>
          Submit
        </button>
        <button onClick={props.onClose}>Close</button>
        </div>
        
      </div>
    </div>
  );
}
