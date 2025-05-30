import React from "react";
import './TableComponents.css'
export default function TableHeaderBar({ setDepFilter, setSearchString, label, optionsBar = true }) {
    return (
      <div className="Table-Header-Bar">
        <div className="Table-Label">
          <label>{label}</label>
        </div>
        {optionsBar && <div className="Table-Options">
          <select
            className="Table-Dropdown"
            id="courseSort"
            onChange={e => setDepFilter(e.target.value)}
          >
            <option value = "">Department</option>
            <option>ACS</option>
            <option>AHT</option>
            <option>AIR</option>
            <option>ANT</option>
            <option>ARE</option>
            <option>ARM</option>
            <option>BIE</option>
            <option>BIO</option>
            <option>BME</option>
            <option>BUS</option>
            <option>CAE</option>
            <option>CHM</option>
            <option>COM</option>
            <option>CON</option>
            <option>CPE</option>
            <option>CSC</option>
            <option>CSE</option>
            <option>CVE</option>
            <option>EAP</option>
            <option>EGR</option>
            <option>ELE</option>
            <option>FNA</option>
            <option>GER</option>
            <option>HON</option>
            <option>HST</option>
            <option>HUM</option>
            <option>IDS</option>
            <option>IND</option>
            <option>LIT</option>
            <option>MEC</option>
            <option>MTH</option>
            <option>NAV</option>
            <option>NUR</option>
            <option>PER</option>
            <option>PHL</option>
            <option>PHY</option>
            <option>PSC</option>
            <option>PSY</option>
            <option>RSC</option>
            <option>SCI</option>
            <option>SOC</option>
            <option>SPN</option>
            <option>SSC</option>
            <option>SWE</option>
            <option>TCM</option>
            <option>UGR</option>
            <option>UXD</option>
          </select>
          <input
            className="Table-Search"
            id="courseSearch"
            type="text"
            placeholder="Search"
            onKeyUp={(e) => setSearchString(e.target.value)}
          />
        </div>}
      </div>
    );
  }