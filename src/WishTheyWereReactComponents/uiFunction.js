import {
  indexToDay,
  indexToMilitaryTime,
  indexToTime,
} from "../Import/FileIO.js";
import {
  getCourses,
  getRooms,
  weightExamRoomTime,
  getOriginalCourses,
} from "../FinalExamScheduler.js";
import store from "../Redux/Slices/store.js";
import html2pdf from "html2pdf.js";

let selectedUnscheduledRow = null;
let selectedRoomRow = null;


export const removeChildren = (elementName) => {
  while (document.getElementById(elementName).hasChildNodes()) {
    document
      .getElementById(elementName)
      .removeChild(document.getElementById(elementName).lastChild);
  }
};

export const createRoomRow = (valuesArr) => {
  let tr = document.createElement("tr");
  for (let i = 0; i < valuesArr.length; i++) {
    let td = document.createElement("td");
    td.innerHTML = valuesArr[i];
    tr.appendChild(td);
  }
  tr.onclick = () => {
    if (selectedRoomRow !== null) {
      selectedRoomRow.style.backgroundColor = "white";
    }
    selectedRoomRow = tr;
    tr.style.backgroundColor = "gray";
  };
  return tr;
};

export const getSelectedRoomRow = () => {
  return selectedRoomRow;
};

export const getSelectedUnscheduledRow = () => {
  return selectedUnscheduledRow;
};

export const generateInitialAvailableRoomsTable = (course) => {
  removeChildren("availableRooms");
  getRooms().forEach((room) => {
    for (let day = 0; day < room.exams.length; day++) {
      for (let time = 0; time < room.exams[day].length; time++) {
        if (room.exams[day][time] === undefined) {
          let undesirable = weightExamRoomTime(day, time, room, course);
          let aspects = "";
          undesirable[1].forEach((weight, aspect) => {
            aspects += aspect + "-" + weight + "\t";
          });
          let values = [
            room.roomNumber,
            room.capacity,
            indexToTime(time),
            indexToDay(day),
            aspects,
          ];
          let available = createRoomRow(values);
          document.getElementById("availableRooms").appendChild(available);
        }
      }
    }
  });
};

function separateCourseCodes(combinedCourseCode) {
  if (combinedCourseCode.includes("/")) {
    const parts = combinedCourseCode.split("/");
    const prefix = parts[0].slice(0, -4);
    const separator = parts[0].charAt(prefix.length);
    let firstCourseCode = parts[0].slice(-3);
    const courseCodes = [`${prefix}${separator}${firstCourseCode}`];
    for (let i = 1; i < parts.length; i++) {
      courseCodes.push(`${prefix}${separator}${parts[i]}`);
    }
    return courseCodes;
  } else {
    return [combinedCourseCode];
  }
}

function getExportedRow(course, examDay, examTime, examRoom, forceTime) {
  let begin_time = "";
  let end_time = "";
  let room_code = "";
  if (typeof examDay !== "undefined" && typeof examTime !== "undefined") {
    for (let i = 0; i < course.day.length; i++) {
      if (!course.day[i]) {
        course.day[i] = " ";
      } else if((course.startTime[i] !== null) && (course.endTime[i]  !== null) && (course.roomCode[i]  !== null))  {
        begin_time = course.startTime[i];
        end_time = course.endTime[i];
        room_code = course.roomCode[i];
      }
    }
    let day = indexToDay(examDay).substring(0, 1);
    if (indexToDay(examDay) === "Thursday") {
      day = "R";
    }

    return (
      "\n" +
      course.yearCode +
      "\t" +
      course.courseCode +
      "\t" +
      indexToDay(examDay) +
      "\t" +
      indexToTime(examTime) +
      "\t" +
      examRoom +
      "\t" +
      course.termCode +
      "\t" +
      room_code +
      "\t" +
      course.day[0] +
      "\t" +
      course.day[1] +
      "\t" +
      course.day[2] +
      "\t" +
      course.day[3] +
      "\t" +
      course.day[4] +
      "\t" +
      course.day[5] +
      "\t" +
      " " +
      "\t" +
      begin_time +
      "\t" +
      end_time +
      "\t" +
      course.teacherID +
      "\t" +
      day +
      "\t" +
      indexToMilitaryTime(examTime) +
      "\t1"
    );
  } else {
    for (let i = 0; i < course.day.length; i++) {
      if (!course.day[i]) {
        course.day[i] = " ";
      } else {
        begin_time = course.startTime[i];
        end_time = course.endTime[i];
        room_code = course.roomCode[i];
      }
    }
    return (
      "\n" +
      course.yearCode +
      "\t" +
      course.courseCode +
      "\t \t \t \t" +
      course.termCode +
      "\t" +
      room_code +
      "\t" +
      course.day[0] +
      "\t" +
      course.day[1] +
      "\t" +
      course.day[2] +
      "\t" +
      course.day[3] +
      "\t" +
      course.day[4] +
      "\t" +
      course.day[5] +
      "\t" +
      " " +
      "\t" +
      begin_time +
      "\t" +
      end_time +
      "\t" +
      course.teacherID +
      "\t \t \t0"
    );
  }
}

function getOldCourseByNoWSKey(originalCourses, noWSKey) {
  for (let [key, value] of originalCourses) {
    const noWSOriginalKey = key.replace(/\s/g, "");

    if (noWSOriginalKey === noWSKey) {
      return value;
    }
  }
  return null;
}

function objectToMap(obj) {
  return new Map(Object.entries(obj));
}

/**
 * This method exports the file of the schedule that was made
 * and downloads it for the user
 */
export const newOutputFile = () => {
  // yr_cde, trm_cde, crs_cde, room_cde, monday_cde, tuesday_cde, wednesday_cde, thursday_cde, friday_cde, saturday_cde, sunday_cde, begin_time, end_time, exam_room, exam_day, exam_time, force_time
  let outputData =
    "yr_cde\tcrs_cde\tDay_of_exam\tTime_of_exam\texamRoom\ttrm_cde\troom_cde\tmonday_cde\ttuesday_cde\twednesday_cde\tthursday_cde" +
    "\tfriday_cde\tsaturday_cde\tsunday_cde\tbegin_tim\tend_tim\tinstructor\texamDay\texamTime" +
    "\tforce_time";
  const courses = store.getState().courses;
  const newCourses = new Map([
    ...objectToMap(courses.scheduledCourses),
    ...objectToMap(courses.unscheduledCourses),
  ]);
  const originalCourses = getOriginalCourses();
  newCourses.forEach((course) => {
    const courseCodes = separateCourseCodes(course.courseCode);
    courseCodes.forEach((courseCode) => {
      let oldCourse = originalCourses.get(courseCode);
      if (oldCourse === undefined) {
        const oldCourseCodeNoWS = courseCode.replace(/\s/g, "");
        oldCourse = getOldCourseByNoWSKey(originalCourses, oldCourseCodeNoWS);
      }
      if (oldCourse) {
        outputData += getExportedRow(
          oldCourse,
          course.examDay,
          course.examTime,
          course.examRoom,
          course.forceTime ? course.forceTime : "1",
        );
      } else {
        console.error("cannot find " + courseCode);
        const courseCodes1 = separateCourseCodes(course.courseCode);
      }
    });
  });
  let a = document.createElement("a");
  a.href = window.URL.createObjectURL(
    new Blob([outputData], { type: "text/plain" }),
  );
  a.download = "ExportedSchedule.txt";
  a.click();
};

export const exportCoursesAsPDF = (termTitle) => {
  return new Promise((resolve, reject) => {
    const outputData = `
            <div style="text-align: center; font-weight: bold; font-size: 1.5em;">${termTitle}</div>
            <table border='1' style="margin: auto;">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Instructor</th>
                        <th>Day of Exam</th>
                        <th>Time of Exam</th>
                        <th>Exam Room</th>
                    </tr>
                </thead>
                <tbody>
                    ${getCoursesHTML()}
                </tbody>
            </table>
        `;

    const element = document.createElement("div");
    element.innerHTML = outputData;

    html2pdf(element, {
      margin: 10,
      filename: "ExportedExamSchedule.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
      .then((pdf) => {
        resolve(pdf);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getCoursesHTML = () => {
  let coursesHTML = "";

  const newCourses = getCourses();
  const originalCourses = getOriginalCourses();

  newCourses.forEach((course) => {
    const courseCodes = separateCourseCodes(course.courseCode);

    courseCodes.forEach((courseCode) => {
      let oldCourse = originalCourses.get(courseCode);

      if (oldCourse === undefined) {
        const oldCourseCodeNoWS = courseCode.replace(/\s/g, "");
        oldCourse = getOldCourseByNoWSKey(originalCourses, oldCourseCodeNoWS);
      }

      if (oldCourse) {
        coursesHTML += getExportedRowHTML(
          oldCourse,
          course.examDay,
          course.examTime,
          course.examRoom,
          course.forceTime ? course.forceTime : "1",
        );
      } else {
        console.error("Cannot find " + courseCode);
      }
    });
  });

  return coursesHTML;
};

function getExportedRowHTML(course, examDay, examTime, examRoom, forceTime) {
  let begin_time = "";
  let end_time = "";
  let room_code = "";

  if (
    typeof examDay !== "undefined" &&
    typeof examTime !== "undefined" &&
    examRoom &&
    forceTime === "1"
  ) {
    for (let i = 0; i < course.day.length; i++) {
      if (!course.day[i]) {
        course.day[i] = " ";
      } else {
        begin_time = course.startTime[i];
        end_time = course.endTime[i];
        room_code = course.roomCode[i];
      }
    }

    let day = indexToDay(examDay).substring(0, 1);

    if (indexToDay(examDay) === "Thursday") {
      day = "R";
    }

    let timeArray = indexToTime(examTime).split(" ");

    if (timeArray[0].length <= 4) {
      timeArray[0] = "0" + timeArray[0];
      indexToTime(examTime);
    }

    return (
      "<tr><td>" +
      course.courseCode +
      "</td><td>" +
      course.teacherID +
      "</td><td>" +
      indexToDay(examDay) +
      "</td><td>" +
      indexToTime(examTime) +
      "</td><td>" +
      examRoom +
      "</td></tr>"
    );
  } else {
    for (let i = 0; i < course.day.length; i++) {
      if (course.day[i] === undefined) {
        course.day[i] = " ";
      } else {
        begin_time = course.startTime[i];
        end_time = course.endTime[i];
        room_code = course.roomCode[i];
      }
    }

    return (
      "<tr><td>" +
      course.courseCode +
      "</td><td>" +
      course.teacherID +
      "</td><td>No Scheduled Final Exam</td><td>" +
      "</td><td> </td></tr>"
    );
  }
}

export const hideSearchStudents = () => {
  const modalContainers = document.getElementsByClassName("Modal-Container");

  // Check if there are any elements with the specified class
  if (modalContainers.length > 0) {
    const firstModalContainer = modalContainers[0];

    // Toggle the display property
    if (firstModalContainer.style.display === "none") {
      firstModalContainer.style.display = "block";
    } else {
      firstModalContainer.style.display = "none";
    }
  }
};
