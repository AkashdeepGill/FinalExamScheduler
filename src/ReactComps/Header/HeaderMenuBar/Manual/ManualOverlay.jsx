import React from 'react';
import './Manual.css';

import addSpecialCase from "../../../../assets/addSpecialCase.png"
import exportPDF from "../../../../assets/exportPDF.png"
import exportTsv from "../../../../assets/exportTsv.png"
import findAStudent from "../../../../assets/findAStudent.png"
import fileSelectors from "../../../../assets/fileSelectors.png"
import removeSpecialCase from "../../../../assets/removeSpecialCase.png"
import scheduleExam from "../../../../assets/scheduleExam.png"
import scheduleExam2 from "../../../../assets/schedulExam2.png"
import specialCasesButton from "../../../../assets/specialCasesButton.png"
import specialCasesStart from "../../../../assets/specialCasesStart.png"
import unscheduleExam from "../../../../assets/unscheduleExam.png"
import undesirableAspects from "../../../../assets/undesirableAspects.png"
import exportSpecialCase from "../../../../assets/exportSpecialCase.png"

export default function ManualOverlay(props) {
    return (
        <div className={'overlay-container'}>
            <div className={'manual-overlay-content overlay-content'}>
                <button className={'overlay-close-button'} onClick={props.onClose}>X</button>
                <h1 id="how-to-use-the-application-guide">How To Use FEST</h1>
                <p>This Application is intended to provide a software tool to the Registrar&#39;s Office to help them
                    create final exam schedules.</p>
                <h2 id="loading-in-the-files">Loading in the Files</h2>
                <p>In order for FEST to generate a schedule, FEST needs two files: a Course Schedule
                    file and Class List file.
                    The Application also has the option to upload two other files: a Room List and Special Cases File. If
                    these files are not uploaded, then the application uses predefined rooms and special cases.</p>
                <h2 id="how-to-load-a-file">How to Load a File</h2>
                <p>Select the choose file option and select the text file.</p>
                <ul>
                    <li>The files columns can be in any order but the files will need the required headers for each
                        file.
                    </li>
                </ul>
                <p><img className={'manual-image'} src={fileSelectors} alt="choose file"/></p>
                <ul>
                    <li>All files are intended to be exported directly from Jenzebar except for those mentioned below
                    </li>
                    <li>The columns scan be organized in any order but the required columns need to be present in the
                        file.
                    </li>
                </ul>
                <h2 id="how-to-generate-a-schedule">How to Generate a Schedule</h2>
                <p>After the Files are successfully loaded, click Generate Schedule.</p>
                <p><img className={'manual-image'} src={addSpecialCase}
                        alt="Generate Schedule Button"/></p>
                <h2 id="how-to-export-a-schedule">How to Export a Schedule</h2>
                <h3>Export as Tab Separated Values</h3>
                <p>After creating a schedule, click Export Exam Schedule to download
                    a tab separated file with the all the information about the exams in it. This file can be reuploaded
                    as the Course Schedule to restore progress</p>
                <p><img className={'manual-image'} src={exportTsv} alt="Export TSV Button"/></p>
                <h3>Export as PDF (Experimental)</h3>
                <p>After creating a schedule, click Generate Schedule PDF. This will prompt you for a title for the PDF,
                    and then export the schedule as a PDF</p>
                <p><img className={'manual-image'} src={exportPDF} alt="Export PDF Button"/></p>
                <h2>Viewing a Student's Schedule</h2>
                <p>After creating a schedule, click Search a Student. This will prompt you for a Student ID. After
                    entering the Student ID, the student's exam schedule will be displayed. Note: If a student is
                    scheduled to take more than one exam at the same time, only the first exam will be displayed</p>
                <p><img className={'manual-image'} src={findAStudent} alt="Find a Student Button"/>
                </p>
                <h2>Adding/Removing Special Cases</h2>
                <p>Special Cases for an exam (crosslisted, common, etc.) can easily be viewed/added/removed from the
                    Special Cases Editor. The Editor uses input validation to ensure course code spacing and formats are correct. To use the Editor, click Special Cases Editor</p>
                <p><img className={'manual-image'} src={specialCasesButton}
                        alt="Special Cases Button"/>
                </p>
                <p>After clicking on Special Cases Editor, you can upload an existing Special Cases File or start from
                    scratch.</p>
                <p><img className={'manual-image'} src={specialCasesStart}
                        alt="Special Cases Button"/>
                </p>
                <p>From here, you can view, add, and remove special cases. To add a special case, select a special case
                    type, enter a course code, and click </p>
                <p><img className={'manual-image'} src={addSpecialCase}
                        alt="Special Cases Add Button"/>
                </p>
                <p>After adding a special case, you can remove it by clicking the 🗑️</p>
                <p><img className={'manual-image'} src={removeSpecialCase}
                        alt="Special Cases Remove Button"/>
                </p>
                <p>After all special cases have been added, you can export the special cases file to use in FEST by clicking Export</p>
                <p><img className={'manual-image'} src={exportSpecialCase}
                        alt="Special Cases Export Button"/>
                </p>
                <h1 id="how-to-edit-the-generated-schedule">How to Edit the Generated Schedule</h1>
                <ul>
                    <li><p>To schedule a class that has not been scheduled, click the exam you would like to
                        schedule.
                        Next, a new window will appear to select a room, day, and time.
                        Select the room that according to your choice.</p>
                    </li>
                    <li><p>From the Scheduled Courses Table, click the X next to the section of the exam you'd like
                        to
                        unschedule
                        <img className={'manual-image'} src={unscheduleExam}
                             alt="Unschedule Exam"/>
                    </p>
                    </li>
                    <li><p>From the Unscheduled Courses table, click on a section to schedule its final exam.
                        <img className={'manual-image'} src={scheduleExam} alt="Schedule Exam"/>
                    </p>
                    </li>
                    <li><p>The picture below shows all available rooms. Click on a room/day/time combination to
                        schedule
                        the exam at that day/time in that room.
                        <img className={'manual-image'} src={scheduleExam2}
                             alt="Schedule Exam Overlay"/></p>
                    </li>
                    <li>The &quot;Undesirable Aspects&quot; column shows all undesirable aspects of scheduling the
                        exam
                        at that day/time in that room.
                        <img className={'manual-image'} src={undesirableAspects}
                             alt="Undesirable Aspects"/></li>
                </ul>
                <h1 id="manual-file-configuration">Manual File Configuration</h1>
                <h2 id="course-schedule-file">Class List File</h2>
                <p>This file is exported directly from Jenzebar and should not be modified</p>
                <h2 id="special-cases-file">Special Cases File</h2>
                <table>
                    <thead>
                    <tr>
                        <th>crs_code</th>
                        <th>final_type</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><em>For Crosslisted
                            Exams:</em><br/>DepartmentCode<code>{`{two spaces}`}</code>CourseNumber<code>{`{one space}`}</code>Section
                            Number,<code>[repeat]</code><br/>Examples: <code>SE 4980 001,SE 5980 001</code>, <code>SE
                                3010 001,SE 3020 011, SE 3030 011</code><br/><br/><em>For All Other Exam
                                Types:</em><br/>DepartmentCode<code>{`{two spaces}`}</code>CourseNumber<br/>Examples: <code>CS
                                1011</code>, <code>CS 4999</code></td>
                        <td><code>c</code> for common exam<br/><code>x</code> for crosslisted
                            exam<br/><code>p</code> for priority exam<br/><code>n</code> for no final exam
                        </td>
                    </tr>
                    </tbody>
                </table>
                <h2 id="course-schedule-file">Course Schedule File</h2>
                <table className={'course-schedule-table-manual'}>
                    <thead>
                    <tr>
                        <th>yr_cde</th>
                        <th>trm_cde</th>
                        <th>room_cde</th>
                        <th>crs_cde</th>
                        <th>monday_cde</th>
                        <th>tuesday_cde</th>
                        <th>wednesday_cde</th>
                        <th>thursday_cde</th>
                        <th>friday_cde</th>
                        <th>saturday_cde</th>
                        <th>sunday_cde</th>
                        <th>begin_tim</th>
                        <th>end_tim</th>
                        <th>examDay</th>
                        <th>examTime</th>
                        <th>examRoom</th>
                        <th>force_time</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Format: <code>YYYY</code><br/>Example: <code>2024</code></td>
                        <td>Format: <code>Sx</code><br/>Example: <code>S1</code> for Semester 1<br/></td>
                        <td>Room Number exactly as specified in <code>room_nm</code> column of Rooms file. This is the room the course meets in on the specified days.</td>
                        <td>Format: DepartmentCode<code>{`{two spaces}`}</code>CourseNumber<br/>Example: <code>CSC  1110</code></td>
                        <td>Format: <code>M</code> if the class meets on Monday or <code>Empty</code> if the class does not meet on Monday</td>
                        <td>Format: <code>T</code> if the class meets on Tuesday or <code>Empty</code> if the class does not meet on Tuesday</td>
                        <td>Format: <code>W</code> if the class meets on Wednesday or <code>Empty</code> if the class does not meet on Wednesday</td>
                        <td>Format: <code>R</code> if the class meets on Thursday or <code>Empty</code> if the class does not meet on Thursday</td>
                        <td>Format: <code>F</code> if the class meets on Friday or <code>Empty</code> if the class does not meet on Friday</td>
                        <td>Format: <code>S</code> if the class meets on Saturday or <code>Empty</code> if the class does not meet on Saturday</td>
                        <td>Format: <code>U</code> if the class meets on Sunday or <code>Empty</code> if the class does not meet on Sunday</td>
                        <td>Format: <code>1/1/00 HH:MM</code> where HH is the hour (in 24 hour format) and MM is the minute for when the class starts on the specified days<br/>Example: <code>1/1/00 13:00</code> for 1:00pm</td>
                        <td>Format: <code>1/1/00 HH:MM</code> where HH is the hour (in 24 hour format) and MM is the minute for when the class ends on the specified days<br/>Example: <code>1/1/00 13:50</code> for 1:50pm</td>
                        <td><code>M</code> for Monday<br/><code>T</code> for Tuesday<br/><code>W</code> for
                            Wednesday<br/><code>R</code> for Thursday<br/><code>F</code> for
                            Friday<br/><code>empty</code> will not schedule the exam manually
                        </td>
                        <td><code>8:00</code> for 8:00-10:00am<br/><code>11:00</code> for
                            11:00am-1:00pm<br/><code>14:00</code> for 2:00-4:00pm<br/><code>17:30</code> for
                            5:30-7:30pm<br/><code>20:00</code> for
                            8:00-10:00pm<br/><code>empty</code> will not schedule the exam manually
                        </td>
                        <td>Room Number exactly as specified in <code>room_nm</code> column of Rooms.txt
                            file <br/><code>empty</code> will schedule the exam in the smallest room that fits all
                            students if examDay and examTime are valid
                        </td>
                        <td><code>1</code> if the specified day/time/room should be
                            forced<br/><code>0</code> or <code>empty</code> if the exam shouldn&#39;t be forced
                        </td>
                    </tr>
                    </tbody>
                </table>
                <h3 id="additional-notes-for-course-schedule-file">Additional Notes for Course Schedule File</h3>
                <p>All headers exported from Jenzebar should not be modified. There are 4 additional columns that can be added: <code>examDay</code>, <code>examTime</code>, <code>examRoom</code>,
                    and <code>force_time</code>. These are all
                    all optional columns. If any of these columns are not present, the scheduling algorithm will
                    schedule the exam as if none of the forced columns are present.</p>
                <h2 id="room-list-file">Room List File</h2>
                <table>
                    <thead>
                    <tr>
                        <th>room_nm</th>
                        <th>capacity</th>
                        <th>room_dep1</th>
                        <th>room_dep2</th>
                        <th>usable_room</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>The room number of the room<br/><code>string</code> containing alphanumeric characters
                            and
                            spaces
                        </td>
                        <td><code>integer</code> greater than or equal to 0</td>
                        <td>room number <code>room_nm</code> for the first room dependent on this
                            room<br/><code>empty</code> for no dependencies
                        </td>
                        <td>room number <code>room_nm</code> for the second room dependent on
                            this <br/><code>empty</code> for no dependencies
                        </td>
                        <td><code>1</code> if the scheduling algorithm can schedule final exams in the
                            room<br/><code>0</code> otherwise
                        </td>
                    </tr>
                    </tbody>
                </table>
                <h3 id="additional-notes-for-room-list-file">Additional Notes for Room List File</h3>
                <p>If <code>room_dep1</code> and/or <code>room_dep2</code> are not empty, the scheduling algorithm
                    will
                    assume that the room has no dependencies. The Usable Room field tells the algorithm if it can schedule an exam in that room. If a room is not 'usable', exams can only be scheduled in the room manually.</p>
            </div>
        </div>
    )
}