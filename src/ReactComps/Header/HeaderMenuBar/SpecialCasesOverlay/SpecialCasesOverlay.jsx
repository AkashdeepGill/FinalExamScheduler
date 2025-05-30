import {useState} from "react";
import SpecialCasesOverlayColumn from "./SpecialCasesOverlayColumn.jsx";
import './SpecialCasesOverlay.css';
import SpecialCasesOverlayInput from "./SpecialCasesOverlayInput.jsx";
import {filterData} from "../../../../FinalExamScheduler.js";

export default function SpecialCasesOverlay(props) {
    const [specialCases, setSpecialCases] = useState(null);

    function handleFileUpload(event) {
        let file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;
            populateSpecialCases(fileContent);
        };
        reader.readAsText(file);
    }

    function createNewSpecialCase() {
        setSpecialCases({
            common: [],
            crosslisted: [],
            priority: [],
            noExam: [],
        });
    }

    function addSpecialCase(payload) {
        const course = {
            courseCode: payload.courseCode,
            finalType: payload.finalType.charAt(0),
            year: '',
            term: '',
        }
        let newSpecialCases = {...specialCases};
        switch (payload.finalType) {
            case "common":
                newSpecialCases.common.push(course);
                break;
            case "crosslisted":
                newSpecialCases.crosslisted.push(course);
                break;
            case "priority":
                newSpecialCases.priority.push(course);
                break;
            case "noExam":
                newSpecialCases.noExam.push(course);
                break;
            default:
                break;
        }
        setSpecialCases(newSpecialCases);
    }

    function populateSpecialCases(data) {
        const tempSpecialCases = {
            common: [],
            crosslisted: [],
            priority: [],
            noExam: [],
        }
        let expectedHeaders = ["crs_cde", "final_type"];
        const optionalHeaders = ["yr_cde", "trm_cde"];
        const filteredRows = filterData(data, expectedHeaders, optionalHeaders);
        if (filteredRows) {
            filteredRows.slice(1).forEach((specialCourse) => {
                const courseCode = specialCourse[0];
                const course = {
                    courseCode: courseCode,
                    finalType: specialCourse[1],
                    year: specialCourse[2],
                    term: specialCourse[3],
                }
                switch (specialCourse[1]) {
                    case "c":
                        tempSpecialCases.common.push(course);
                        break;
                    case "x":
                        tempSpecialCases.crosslisted.push(course);
                        break;
                    case "p":
                        tempSpecialCases.priority.push(course);
                        break;
                    case "n":
                        tempSpecialCases.noExam.push(course);
                        break;
                    default:
                        break;
                }
            });
        }
        setSpecialCases(tempSpecialCases);
    }

    function clearSpecialCases() {
        setSpecialCases(null);
    }

    function removeCourse(course, type) {
        let newSpecialCases = {...specialCases};
        switch (type) {
            case "c":
                newSpecialCases.common = newSpecialCases.common.filter((c) => c !== course);
                break;
            case "x":
                newSpecialCases.crosslisted = newSpecialCases.crosslisted.filter((c) => c !== course);
                break;
            case "p":
                newSpecialCases.priority = newSpecialCases.priority.filter((c) => c !== course);
                break;
            case "n":
                newSpecialCases.noExam = newSpecialCases.noExam.filter((c) => c !== course);
                break;
            default:
                break;
        }
        setSpecialCases(newSpecialCases);
    }

    function exportSpecialCases() {
        let fileContent = "crs_cde\tfinal_type\n";
        specialCases.common.forEach((course) => {
            fileContent += `${course.courseCode}\tc\n`;
        });
        specialCases.crosslisted.forEach((course) => {
            fileContent += `${course.courseCode}\tx\n`;
        });
        specialCases.priority.forEach((course) => {
            fileContent += `${course.courseCode}\tp\n`;
        });
        specialCases.noExam.forEach((course) => {
            fileContent += `${course.courseCode}\tn\n`;
        });
        const element = document.createElement("a");
        const file = new Blob([fileContent], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "New Special Cases File.txt";
        element.click();
    }
    return (
        <div className={'overlay-container'}>
            <div className={'special-cases-overlay-content overlay-content'}>
                <button className={'overlay-close-button'} onClick={props.onClose}>X</button>
                {specialCases === null ? (
                    <div className={'fill-width no-file-uploaded-container'}>
                        <span className={'special-cases-overlay-title'}>Special Cases</span>
                        <span>Upload a Special Cases File or Start a new File</span>
                        <div className={'special-cases-button-container'}>
                            <input type="file" id="specialCases" onChange={handleFileUpload} hidden/>
                            <label className="overlay-input-label" htmlFor="specialCases">Choose File</label>
                            <button className="overlay-input-label" onClick={createNewSpecialCase}>Start New File
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={'fill-width special-cases-overlay-content'}>
                        <span className={'special-cases-overlay-title'}>Special Cases</span>
                        <span>Add and delete Special Cases for courses and export the new special cases file once you're done</span>
                        <SpecialCasesOverlayInput addSpecialCase={addSpecialCase}/>
                        <div className={'special-cases-container'}>
                            <SpecialCasesOverlayColumn key={'Common'} title={'Common'} courses={specialCases.common}
                                                       removeCourse={(course) => removeCourse(course, 'c')}/>
                            <SpecialCasesOverlayColumn key={'Crosslisted'} title={'Crosslisted'}
                                                       courses={specialCases.crosslisted}
                                                       removeCourse={(course) => removeCourse(course, 'x')}/>
                            <SpecialCasesOverlayColumn key={'Priority'} title={'Priority'}
                                                       courses={specialCases.priority}
                                                       removeCourse={(course) => removeCourse(course, 'p')}/>
                            <SpecialCasesOverlayColumn key={'No Exam'} title={'No Exam'} courses={specialCases.noExam}
                                                       removeCourse={(course) => removeCourse(course, 'n')}/>
                        </div>

                    </div>
                )}
                {specialCases !== null &&
                    <div className={'special-cases-button-container'}>
                        <button className="overlay-input-label" onClick={clearSpecialCases}>Clear</button>
                        <button className="overlay-input-label" onClick={exportSpecialCases}>Export</button>
                    </div>
                }
            </div>
        </div>
    );
}