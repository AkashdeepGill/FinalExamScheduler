import {useState} from "react";

export default function SpecialCasesOverlayInput(props){
    const addSpecialCase = props.addSpecialCase;
    const types = ["common", "crosslisted", "priority", "noExam"];
    const [courseCode, setCourseCode] = useState("");
    const [textEntry, setTextEntry] = useState("");
    const [finalType, setFinalType] = useState('');
    const [errorText, setErrorText] = useState("");

    function handleCourseCodeChange(event) {
        setCourseCode(event.target.value);
    }

    function handleFinalTypeChange(event) {
        setFinalType(event.target.value);
    }

    function handleTextEntryChange(event) {
        setTextEntry(event.target.value);
    }

    function handleRegularAddCourse() {
        if (finalType !== 'crosslisted') {
            const courseCodeRegex = /^[A-Z]{3} {2}\d{4}[A-Z]?$/;
            if (!courseCodeRegex.test(courseCode.trim())) {
                setErrorText("Please enter a valid course code");
                return;
            }
        }
        addSpecialCase({
            courseCode: courseCode.trim(),
            finalType: finalType,
        });
        setCourseCode("");
        setErrorText("");
        setTextEntry("");
    }

    function handleAddCrosslistedCourse() {
        const courseCodeWithSectionRegex = /^[A-Z]{3} {2}\d{4}[A-Z ][0-9]{3}$/;
        if (!courseCodeWithSectionRegex.test(textEntry.trim())) {
            setErrorText("Please enter a valid course code with section number");
            return;
        }
        setErrorText("");
        setCourseCode(`${courseCode && `${courseCode},`}${textEntry.trim()}`)
    }

    return (
        <div className={'overlay-input-container'}>
            <span className={'overlay-input-title'}>Select a Special Case Type and Add the Course(s)</span>
            <select value={finalType} onChange={handleFinalTypeChange}>
                <option value="">Select Type</option>
                {types.map((type) => {
                    return (
                        <option value={type} key={type}>{type}</option>
                    );
                })}
            </select>
            {finalType && finalType !== 'crosslisted' &&
                <div className={'course-input-container'}>
                    <label>Enter a Course Code</label>
                    <input type="text" value={courseCode} onChange={handleCourseCodeChange} placeholder="Course Code" className={'course-text-input'}/>
                </div>
            }
            {finalType === 'crosslisted' &&
                <div className={'course-input-container'}>
                    <label>Enter each Course Code and click Add Section. Once all crosslisted courses are entered, click
                        Add Special Case</label>
                    <input type="text" value={textEntry} onChange={handleTextEntryChange} placeholder="Course Code" className={'course-text-input'}/>
                    <button onClick={handleAddCrosslistedCourse}>Add Section</button>
                    <p>{`Crosslisted Classes: ${courseCode}`}</p>
                </div>
            }
            {errorText.length > 0 &&
                <span className={'error-text'}>{errorText}</span>
            }
            {finalType && courseCode.length > 0 &&
                <button onClick={handleRegularAddCourse}>Add Special Case</button>
            }
        </div>
    )
}