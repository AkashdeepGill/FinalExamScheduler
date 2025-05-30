//------------------- IMPORTS --------------------//

import { CareTaker } from "./Models/CareTaker.js";
import { Schedule } from "./Models/Schedule.js";
import Room from "./Models/Room.js";
import Course from "./Models/Course.js";
import { StudentInstructorCatalog } from "./Models/StudentInstructorCatalog.js";
import {
  addWeightedInstance,
  removeWeightedInstance,
  resetGeneratedStates,
} from "./Redux/Slices/generatedStatesSlice.js";
import {
  indexToDay,
  indexToTime,
  parseLines,
  preloadedFile,
} from "./Import/FileIO.js";
import Phase2Worker from "./phase2worker.js?worker";

//------------------- CONSTANTS --------------------//
import {
  NUM_MEMENTOS_FOR_COMMON_FINALS,
  NUM_MEMENTOS_FOR_PRIORITY_EXAMS,
} from "./CONSTANTS.js";

import roomCapacitiesTxt from "./public/files/RoomCapacities.txt";
import specialTreatmentCoursesTxt from "./public/files/24S1SpecialCases.txt";
import store from "./Redux/Slices/store.js";
import { setProgress } from "./Redux/Slices/progressSlice.js";
import { addCourse, resetCourseSlice } from "./Redux/Slices/courseSlice.js";
//------------------- GLOBALS --------------------//

let phase2Worker;

// There are different types of Workers for Node.js vs DOM, and we must use the correct type for testing vs browser
if (typeof window.Worker !== "undefined") {
  phase2Worker = new Phase2Worker();
}

let rooms = undefined;
let courses = new Map();
let originalCourses = new Map();
let weights = new Map();
let SI_Catalog = new StudentInstructorCatalog();
let commonFinalCodes = [];
let sameCommonFinals = [];
let crosslistedFinalCodes = [];
let careTaker = new CareTaker();
let testing = false;
let specialCoursesUploaded = false;
let originalProfExams, originalStudentExams, profExams, studentExams;
const NUM_EXAM_TIMES = 5;
const NUM_EXAM_DAYS = 5;

//------------------- FUNCTIONS --------------------//

/**
 * Author: Rose Wakelin
 *
 * Imports weight map from weights file
 * @param path Raw file data
 */
export const importWeights = (data) => {
  const dataLines = parseLines(data, ",");
  dataLines.slice(1).forEach((weightData) => {
    weights.set(weightData[0], [parseInt(weightData[1]), 0, []]);
  });
};

/**
 * Author: Rose Wakelin
 * Given a correctly formatted room file, room object will be created
 * @param path Path to room file
 */
export const importRooms = (data) => {
  rooms = new Map();
  const hasDependent = new Map();
  let expectedHeader = ["room_nm", "capacity", "room_dep1", "room_dep2"];
  let optionalHeader = ["usable"];
  const filteredRows = filterData(data, expectedHeader, optionalHeader);
  if (filteredRows) {
    filteredRows.slice(1).forEach((roomData) => {
      let room = new Room(roomData[0], roomData[1]);
      if (roomData[2] && roomData[3]) {
        room.addDependencies(roomData[2], roomData[3]);
        hasDependent.set(roomData[2], roomData[0]);
        hasDependent.set(roomData[3], roomData[0]);
      }
      if (!roomData[4] || roomData[4] === "1") {
        room.usable = true;
      } else if (roomData[4] === "0") {
        room.usable = false;
      }
      rooms.set(roomData[0], room);
    });
    for (let [room, dep] of hasDependent) {
      rooms.get(room).addDependent(dep);
    }
  } else {
    document.getElementById("roomListName").textContent = "No file chosen";
  }
};

/**
 * Author: Kyle Senebouttarath
 *
 * Determines if a given day and time variable are valid for forced exams
 *
 * @param dayEntry
 * @param timeEntry
 * @return {*}
 */
const isCourseForceDayTimeValid = (dayEntry, timeEntry) => {
  const validDays = ["M", "T", "W", "R", "F", "S"];
  const validTimes = ["8:00", "11:00", "14:00", "17:30", "20:00"];
  return (
    dayEntry !== undefined &&
    timeEntry !== undefined &&
    validDays.includes(dayEntry) &&
    validTimes.includes(timeEntry)
  );
};

/**
 * Author: Kyle Senebouttarath
 *
 * Executed per course on course importing. Reads the file data for a course on a particular
 * line and reads information about force times (if any). If so, update the course object.
 *
 * @param headers
 * @param courseData
 * @param courseObj
 */
const updateCourseForceTime = (headers, courseData, courseObj) => {
  if (!headers || !courseData) {
    return;
  }

  const isForceTimeIndex = headers.indexOf("force_time");
  if (!courseData[isForceTimeIndex]) {
    return;
  }
  courseObj.forceTime = courseData[isForceTimeIndex];
  if (courseData[isForceTimeIndex] !== "1") {
    return;
  } //Per README spec; force_time must contain a 1

  const forceDayIndex = headers.indexOf("examDay");
  const forceTimeIndex = headers.indexOf("examTime");

  const day = courseData[forceDayIndex] ? courseData[forceDayIndex].trim() : "";
  const time = courseData[forceTimeIndex]
    ? courseData[forceTimeIndex].trim()
    : "";

  if (isNaN(isCourseForceDayTimeValid(day, time))) {
    console.warn(
      `Forcing ${courseObj.courseCode} Failed, Invalid Day/Time Combination`,
    );
    return;
  }
  const forceRoomIndex = headers.indexOf("examRoom");

  courseObj.setForceExam(true, day, time, courseData[forceRoomIndex]);
};

/**
 * Takes in an array and an item that would be within that array and if it exists, it will be removed
 * and the array will be returned without that item (the array will also be one index smaller)
 *
 * @param arr The array in question
 * @param value the item to be removed
 * @author Chandler Frakes
 */
const removeItemFromArray = (arr, value) => {
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

/**
 * Reads a .txt file listing Special Treatment Courses (STC), compares each course code/line to the courses object
 * and assigns it's specialCode, if found.
 * @param path The path to the STC file.
 * @author Chandler Frakes
 */
export const importSpecialTreatmentCourses = (data) => {
  commonFinalCodes = [];
  let expectedHeaders = ["crs_cde", "final_type"];
  let optionalHeaders = ["isPriority", "yr_cde", "trm_cde"];
  const filteredRows = filterData(data, expectedHeaders, optionalHeaders);
  if (filteredRows) {
    filteredRows.slice(1).forEach((specialCourse) => {
      let courseCodes = specialCourse[0].split(",");
      let sameFinal = [];
      courseCodes.forEach((thisCode) => {
        let course = new Course(thisCode, false);
        let codesCopy = [...courseCodes];

        if (specialCourse.length > 1) {
          switch (specialCourse[1].toLowerCase()) {
            case "x":
              course.hasSpecialCode = true;
              course.specialCode = "x";
              course.crossListedClasses = removeItemFromArray(
                codesCopy,
                thisCode,
              );
              if (!crosslistedFinalCodes.includes(thisCode)) {
                crosslistedFinalCodes.push(thisCode);
              }
              if (courses.get(thisCode)) {
                let tempCourse = getCourse(thisCode);
                tempCourse.hasSpecialCode = true;
                tempCourse.specialCode = "x";
                tempCourse.crossListedClasses = removeItemFromArray(
                  codesCopy,
                  thisCode,
                );
              }

              break;
            case "c":
              course.hasSpecialCode = true;
              course.specialCode = "c";
              if (!commonFinalCodes.includes(thisCode)) {
                commonFinalCodes.push(thisCode);
                sameFinal.push(thisCode);
              }
              for (const [key, tempCourse] of courses) {
                if (key.startsWith(thisCode)) {
                  tempCourse.hasSpecialCode = true;
                  tempCourse.specialCode = "c";
                }
              }
              break;
            case "n":
              course.hasSpecialCode = true;
              course.specialCode = "n";
              for (const [key, tempCourse] of courses) {
                if (key.startsWith(thisCode)) {
                  tempCourse.hasSpecialCode = true;
                  tempCourse.specialCode = "n";
                }
              }
              break;
            case "p":
              course.hasSpecialCode = true;
              course.specialCode = "p";
              for (const [key, tempCourse] of courses) {
                if (key.startsWith(thisCode)) {
                  tempCourse.hasSpecialCode = true;
                  tempCourse.specialCode = "p";
                }
              }
              break;
            default:
              course.hasSpecialCode = false;
              break;
          }
        }
      });
      if (sameFinal.length > 1) {
        sameCommonFinals.push(sameFinal);
      }
    });
  } else {
    document.getElementById("specialCasesName").textContent = "No file chosen";
  }
  specialCoursesUploaded = true;
};

const deletedCourses = [];

/**
 * Deletes courses with no students and one's whose code is set to 'n'.
 * @author Chandler Frakes
 */
export const updateSpecialCourses = () => {
  courses.forEach((course, courseCode) => {
    // empty courses numOfStudents = undefined, as well
    if (course.numOfStudents === undefined || course.numOfStudents === 0) {
      console.warn(`Course ${courseCode} is being deleted because it has no students`);
      deletedCourses.push(`"${courseCode}"`);
      courses.delete(courseCode);
    }
    if (hasNoFinal(course)) {
      courses.delete(courseCode);
    }
  });
};

/**
 * Filters out all non-essential data columns from inputted file.
 * If any essential headers are missing an error will be thrown.
 * @param {*} data data file
 * @param {*} expectedHeaders expected data column headers
 * @param {*} optionalHeaders optional column headers (e.g force_time)
 * @returns Matrix where each inner array contains all of the data for one row. First row of returned matrix is the included headers in sorted order.
 */
export const filterData = (data, expectedHeaders, optionalHeaders) => {
  const dataLines = parseLines(data, "\t");
  const headerIndices = {};
  const missing = [];
  const allHeaders = expectedHeaders;
  for (let i = 0; i < dataLines[0].length; i++) {
    headerIndices[dataLines[0][i]] = i;
  }

  for (const header of expectedHeaders) {
    if (!(header in headerIndices)) {
      missing.push(header);
    }
  }

  if (optionalHeaders) {
    for (const header of optionalHeaders) {
      if (header in headerIndices) {
        allHeaders.push(header);
      }
    }
  }

  let modifiedContent;
  if (missing.length > 0) {
    alert(
      "WARNING: File not imported\n\nThe headers in the provided file do not match what is expected." +
        " Please match the following headers. Your file should be tab seperated:\n\n" +
        missing.join("    "),
    );
    modifiedContent = null;
  } else {
    modifiedContent = dataLines.map((row) =>
      allHeaders
        .map((header) => row[headerIndices[header]])
        .filter((data) => data !== undefined)
        .sort((a, b) => allHeaders.indexOf(a) - allHeaders.indexOf(b)),
    );
  }
  return modifiedContent;
};


function deepCloneMap(originalMap) {
  const arrayFromMap = Array.from(originalMap);
  const jsonString = JSON.stringify(arrayFromMap);
  const arrayFromJson = JSON.parse(jsonString);
  return new Map(arrayFromJson);
}

export function getOriginalCourses() {
  return originalCourses;
}

/**
 * Author: Alex Ottelien
 * Imports a file full of courses and parses them into course objects. the objects are then placed into the courses map
 * with the key being the course code
 *
 * @param path the file path of the file
 */
export const importCourses = (data) => {
  if (!data) {
    return;
  }
  courses = new Map(); // clear any existing courses if we're importing new courses
  let expectedHeaders = [
    "yr_cde",
    "trm_cde",
    "room_cde",
    "crs_cde",
    "monday_cde",
    "tuesday_cde",
    "wednesday_cde",
    "thursday_cde",
    "friday_cde",
    "saturday_cde",
    "sunday_cde",
    "begin_tim",
    "end_tim",
  ];
  const optionalHeaders = ["examRoom", "examTime", "examDay", "force_time"];
  const filteredRows = filterData(data, expectedHeaders, optionalHeaders);
  if (filteredRows) {
    const headers = filteredRows[0];
    filteredRows.slice(1).forEach((courseData) => {
      let course;
      const courseCode = courseData[3];
      if (
        courses.has(courseCode.substring(0, courseCode.lastIndexOf(" "))) &&
        (courses.get(courseCode.substring(0, courseCode.lastIndexOf(" ")))
          .yearCode === undefined ||
          courses.get(courseCode.substring(0, courseCode.lastIndexOf(" ")))
            .yearCode === courseData[0]) &&
        (courses.get(courseCode.substring(0, courseCode.lastIndexOf(" ")))
          .termCode === undefined ||
          courses.get(courseCode.substring(0, courseCode.lastIndexOf(" ")))
            .termCode === courseData[1])
      ) {
        let specialCourse = courseCode.substring(
          0,
          courseCode.lastIndexOf(" "),
        );
        course = new Course(
          courseCode,
          true,
          courses.get(specialCourse).specialCode,
          courses.get(specialCourse).crossListedClasses,
        );
        if (courses.has(courseCode)) {
          course.crossListedClasses =
            courses.get(courseCode).crossListedClasses;
        }
      } else if (
        courses.has(courseCode) &&
        (courses.get(courseCode).yearCode === undefined ||
          courses.get(courseCode).yearCode === courseData[0]) &&
        (courses.get(courseCode).termCode === undefined ||
          courses.get(courseCode).termCode === courseData[1])
      ) {
        course = courses.get(courseCode);
      } else {
        course = new Course(courseCode, false);
      }

      for (let i = 0; i < 6; i++) {
        const dayTimeRoom = {
          day: undefined,
          startTime: undefined,
          endTime: undefined,
          room: undefined,
        };
        if (courseData[4 + i] !== undefined && courseData[4 + i] !== "") {
          dayTimeRoom.day = courseData[4 + i];
          dayTimeRoom.startTime = courseData[11];
          dayTimeRoom.endTime = courseData[12];
          dayTimeRoom.room = courseData[2];
          course.addDayTimeAndRoom(dayTimeRoom);
        }
      }

      course.addCourseScheduleInformation(courseData[0], courseData[1]);

      updateCourseForceTime(headers, courseData, course);

      courses.set(courseCode, course);
    });
  } else {
    document.getElementById("courseScheduleName").textContent =
      "No file chosen";
  }
};

/**
 * Author: Rose Wakelin
 * Schedules a room for an exam and makes sure dependencies are properly scheduled as well
 *
 * @param course
 * @param room
 * @param day
 * @param time
 */
export const scheduleExamInRoomOnly = (course, room, day, time) => {
  SI_Catalog.scheduleStudentsInClass(course, time, day);
  courses.set(course.courseCode, course);
  if (room.isADependent) {
    room.exams[day][time] = course.courseCode;
    rooms.get(room.dependencies[0]).exams[day][time] = course.courseCode;
    rooms.get(room.dependencies[1]).exams[day][time] = course.courseCode;
  } else if (room.hasADependent) {
    room.exams[day][time] = course.courseCode;
    rooms.get(room.dependencies[0]).exams[day][time] = course.courseCode;
  } else {
    room.exams[day][time] = course.courseCode;
  }
};

export const scheduleExam = (courseObj, day, time, roomObj) => {
  const studentsInCourse = SI_Catalog.getStudentsInClass(courseObj.courseCode);
  if (studentExams) {
    for (let [studentID, student] of studentsInCourse) {
      studentExams[day][time].add(studentID);
    }
  }
  courseObj.examTime = time;
  courseObj.examDay = day;
  courseObj.examRoom = roomObj.roomNumber;
  scheduleExamInRoomOnly(courseObj, roomObj, day, time);
};

/**
 * Author: Rose Wakelin
 * This method unschedules courses with a double booked instructor or in a room to small.
 * The registrar will manually schedule these classes
 */
export const removeInvalidCases = () => {
  let classesInInvalidState = weights
    .get("Instructor Double Booked")[2]
    .concat(weights.get("Room Too Small")[2]);
  classesInInvalidState = [...new Set(classesInInvalidState)];
  classesInInvalidState.forEach((clas) => {
    let course = courses.get(clas);
    let room = rooms.get(course.examRoom);
    if (room) {
      unscheduleExamInRoomOnly(room, course.examDay, course.examTime);
    } else {
      console.warn("Course object", clas, "lacks a room!");
    }

    course.examRoom = undefined;
    course.examDay = undefined;
    course.examTime = undefined;
  });
  weights.get("Instructor Double Booked")[2] = [];
  weights.get("Instructor Double Booked")[1] = 0;
  weights.get("Room Too Small")[2] = [];
  weights.get("Room Too Small")[1] = 0;
  courses.forEach((course) => {
    if (
      (course.forceTime === 0 || course.forceTime === "0") &&
      course.examDay &&
      course.examTime &&
      course.examRoom
    ) {
      unscheduleExam(course.courseCode);
    }
  });
};

/**
 * Author: Rose Wakelin
 * Unschedules a room for an exam and makes sure dependencies are properly unscheduled as well
 *
 * @param course
 * @param room
 * @param day
 * @param time
 */
const unscheduleExamInRoomOnly = (room, day, time) => {
  if (room.isADependent) {
    room.exams[day][time] = undefined;
    rooms.get(room.dependencies[0]).exams[day][time] = undefined;
    rooms.get(room.dependencies[1]).exams[day][time] = undefined;
  } else if (room.hasADependent) {
    room.exams[day][time] = undefined;
    rooms.get(room.dependencies[0]).exams[day][time] = undefined;
  } else {
    room.exams[day][time] = undefined;
  }
};

/**
 * Author: Kyle Senebouttarath
 *
 * First step of the algorithm, start placing forced exams into their rooms, day, and time;
 */
export const scheduleForcedTimeExams = () => {
  courses.forEach((courseObj, cCode) => {
    //Ensure course object is forced and has a valid day and time to schedule
    if (courseObj.forceTime !== "1") {
      return;
    }
    const dayIndex = courseObj.examDay;
    const timeIndex = courseObj.examTime;
    if (isNaN(dayIndex) || isNaN(timeIndex) || dayIndex < 0 || timeIndex < 0) {
      return;
    }

    //Schedule exam in room
    if (courseObj.examRoom) {
      const roomObj = rooms.get(courseObj.examRoom);
      if (roomObj) {
        scheduleExamInRoomOnly(courseObj, roomObj, dayIndex, timeIndex);
      } else {
        console.warn(
          `Room ${courseObj.examRoom} does not exist for ${courseObj.courseCode}, scheduling in best available room`,
        );
        scheduleExamInBestRoom(courseObj, dayIndex, timeIndex);
      }
    } else {
      console.warn(
        `No Room was specified for ${courseObj.courseCode}, scheduling in best available room`,
      );
      scheduleExamInBestRoom(courseObj, dayIndex, timeIndex);
    }
  });
};

function findRoomWithHighestCapacity(rooms) {
  return rooms.reduce((prevRoom, currentRoom) => {
    return prevRoom.capacity > currentRoom.capacity ? prevRoom : currentRoom;
  });
}

/**
 * Schedules course at the given day and time. Will try and find the room that will fit the class and is not already booked.
 * @param {*} toSchedule course object to schedule
 * @param {*} day
 * @param {*} time
 */
function scheduleExamInBestRoom(toSchedule, day, time) {
  let availableRooms = Array.from(rooms.values()).filter(
    (room) => !room.exams[day][time] && room.usable,
  );

  let selectedRoom = null;
  let minCapacity = Number.MAX_VALUE;

  availableRooms.forEach((room) => {
    // Check if the room capacity is sufficient for the current course
    // and the room is not already assigned to another course
    if (
      room.capacity >= toSchedule.numOfStudents &&
      room.capacity < minCapacity
    ) {
      selectedRoom = room;
      minCapacity = room.capacity;
    }
  });

  // If no rooms are big enough for the class, assign to the biggest remaining room
  if (!selectedRoom) {
    selectedRoom = findRoomWithHighestCapacity(availableRooms);
    // unschedule the exam if there are no more rooms open at that time
    if (!selectedRoom) {
      toSchedule.examTime = undefined;
      toSchedule.examDay = undefined;
    }
  } else {
    scheduleExam(toSchedule, day, time, selectedRoom);
  }
}

function scheduleInPhase1(course) {
  if (course.forceDay === "1" && course.forceTime === "1") {
    return false;
  } else if (course.specialCode === "x") {
    return true;
  } else {
    return !course.hasSpecialCode;
  }
}

const findMatrixTimeRoom = (course) => {
  const meetingTimesMap = new Map();
  const meetingRoomsMap = new Map();
  for (let i = 0; i < 6; i++) {
    // 6 is number of days
    if (course.day[i] !== undefined) {
      // Checks if a class runs on given day
      let startTime = getMeetingStartTime(course.startTime[i]);
      const endTime = getMeetingEndTime(course.endTime[i]);
      meetingRoomsMap.set(
        course.roomCode[i],
        (meetingRoomsMap.get(course.roomCode[i]) || 0) + 1
      );
      for (let j = startTime; j < endTime; j++) {
        if (meetingTimesMap.has(j)) {
          meetingTimesMap.set(j, meetingTimesMap.get(j) + 1);
        } else {
          meetingTimesMap.set(j, 1);
        }
      }
    }
  }
  const sortedMeetingTimes = Array.from(meetingTimesMap)
    .filter(([classMeetingTime, occurrences]) => occurrences >= 3)
    .sort((a, b) => a[0] - b[0]);
  const meetingRooms = Array.from(meetingRoomsMap.entries())
    .filter(([classMeetingRoom, occurrences]) => occurrences >= 3)
    .map(([meetingRoom]) => meetingRoom);
  
  return {sortedMeetingTimes, meetingRooms}
};

/**
 * Author: Rose Wakelin
 * Phase 1 of class scheduling. Follows the matrix used by the registrar
 */
export const phase1 = () => {
  for (let [code, course] of courses) {
    if (code === 'MTH  1110 001'){
      console.log('break here')
    }
    if (scheduleInPhase1(course) && !course.isForced) {
      const {sortedMeetingTimes, meetingRooms} = findMatrixTimeRoom(course)
      for (let [classMeetingTime, occurrences] of sortedMeetingTimes) {
        const dayTime = getExamDayTime(classMeetingTime);
        if (typeof dayTime !== 'undefined') {
          if(meetingRooms.length > 0 && getRoom(meetingRooms[0])){
            scheduleExam(course, dayTime[0], dayTime[1], getRoom(meetingRooms[0]))
          }else{
            scheduleExamInBestRoom(course, dayTime[0], dayTime[1]);
          }
          if (course.specialCode === 'x' && course.crossListedClasses) {
            course.crossListedClasses.forEach((clas) => {
                scheduleExamInBestRoom(clas, dayTime[0], dayTime[1]);
            });
          }
          break;
        } else {
          console.warn(`Unable to schedule: ${code} in matrix`);
        }
      }
    }
  }
};

/**
 * Author: Rose Wakelin
 * Returns the hour given a class start time in two different formats:
 * 2:00 PM
 * 1/1/1900 14:00
 *
 * @param timeString
 * @return {number}
 */
const getMeetingStartTime = (timeString) => {
  const sepDateTime = timeString.split(" ");
  if (timeString.includes("AM") || timeString.includes("PM")) {
    const sepHrMin = sepDateTime[0].split(":");
    if (sepDateTime.includes("PM") && sepHrMin[0] !== "12") {
      return parseInt(sepHrMin[0]) + 12;
    } else {
      return parseInt(sepHrMin[0]);
    }
  } else {
    const sepHrMin = sepDateTime[1].split(":");
    return parseInt(sepHrMin[0]);
  }
}

/**
 * Author: Rose Wakelin
 * Returns the hour a class ends rounded up to the next hour given a class end time formatted in two different ways
 * 2:00 PM
 * 1/1/1900 14:00
 * @param timeString
 * @return {number}
 */
const getMeetingEndTime = (timeString) => {
  const sepDateTime = timeString.split(" ");
  if (timeString.includes("AM") || timeString.includes("PM")) {
    const sepHrMin = sepDateTime[0].split(":");
    let hr = parseInt(sepHrMin[0]);
    if (sepDateTime.includes("PM") && hr !== 12) {
      hr += 12;
    }
    if (sepHrMin[1] > 0) {
      hr++;
    }
    return hr;
  } else {
    const sepHrMin = sepDateTime[1].split(":");
    let hr = parseInt(sepHrMin[0]);
    if (sepHrMin[1] > 0) {
      hr++;
    }
    return hr;
  }
}

/**
 * Author: Rose Wakelin
 * Given the hour a class meets, an array with the day and exam time represented as integers is returned
 *
 * @param meetingTime
 * @return {any[]}
 */
const getExamDayTime = (meetingTime) => {
  // Meeting time in military time
  let examDayTime = new Array(2);
  if (meetingTime < 13) {
    examDayTime[1] = 0;
  } else if (meetingTime < 17) {
    examDayTime[1] = 2;
  } else {
    examDayTime[1] = 3;
  }

  switch (meetingTime) {
    case 17:
    case 13:
    case 8:
      examDayTime[0] = 0;
      break;
    case 18:
    case 14:
    case 9:
      examDayTime[0] = 1;
      break;
    case 19:
    case 15:
    case 10:
      examDayTime[0] = 2;
      break;
    case 20:
    case 16:
    case 11:
      examDayTime[0] = 3;
      break;
    case 12:
    case 21:
      examDayTime[0] = 4;
      break;
    default:
      examDayTime = undefined;
  }

  return examDayTime;
};

export const getCommonFinalCodes = () => {
  return commonFinalCodes;
};

export const getWeights = () => {
  return weights;
};

export const getSI_Catalog = () => {
  return SI_Catalog;
};

export const getCourse = (courseCode) => {
  return courses.get(courseCode);
};

export const getCourseNoWsUnmerged = (courseId) => {
    for (const [key, value] of courses.entries()) {
        if (key.replace(/\s/g, '') === courseId.replace(/\s/g, '')) {
            return value;
        }
    }
    const courseCodeNoWs = courseId.replace(/\s/g, '');
    for (const [key, value] of courses.entries()) {
        const keyNoWs = key.replace(/\s/g, '');
        if (keyNoWs.slice(0, 8) === courseCodeNoWs.slice(0, 8)) {
            if (keyNoWs.includes('/')) {
                const sections = keyNoWs.split('/');
                sections[0] = sections[0].slice(-3);
                if (sections.includes(courseCodeNoWs.slice(-3))) {
                    return value;
                }
            }
        }
    }
    return undefined;
}

export const getCourses = () => {
  return courses;
};

export const getRooms = () => {
  return rooms;
};

export const getRoom = (roomCode) => {
  return rooms.get(roomCode);
};

export const getCareTaker = () => {
  return careTaker;
};

const hasCommonFinal = (cObj) =>
  cObj &&
  cObj.hasSpecialCode &&
  (cObj.specialCode === "c" || cObj.specialCode === "common");
const hasCrosslistedFinal = (cObj) =>
  cObj &&
  cObj.hasSpecialCode &&
  (cObj.specialCode === "x" || cObj.specialCode === "crosslisted");
const hasNoFinal = (cObj) =>
  cObj &&
  cObj.hasSpecialCode &&
  (cObj.specialCode === "n" || cObj.specialCode === "none");
const isPriorityExam = (cObj) => cObj.specialCode === 'p';

/**
 * Author: Kyle Senebouttarath
 * Loops through the student catalog and groups students who both share course1 and course2 in their track
 * @param course1
 * @param course2
 */
export const getIntersectingStudentsInCourses = (course1, course2) => {
  const intersecting = [];
  if (course1.courseCode !== course2.courseCode) {
    SI_Catalog.getStudentsObjectsInClass(course1.courseCode).forEach((student, studentID) =>{
      if(student.hasCourse(course2.courseCode)){
        intersecting.push(studentID)
      }
    })
  }
  return intersecting;
};

/**
 * Author: Kyle Senebouttarath
 * Returns an array of courses that are priority exams on a given day
 * @param dayIndex The day to check
 */
const getPriorityClassesOnGivenDay = (dayIndex) => {
  const courses = [];
  getCourses().forEach((c) => {
    if (isPriorityExam(c) && c.examDay === dayIndex) {
      courses.push(c);
    }
  });
  return courses;
};

const setKeyValue = (map, key) => {
  if (!map.has(key)) {
    map.set(key, 0);
  }
  map.set(key, map.get(key) + 1);
};

/**
 * Author: Rose Wakelin
 * This function determines the weight of scheduling a given exam in a room at a given time
 * Take in the exam day number, exam time number, room object and clas objec
 *
 * Returns the max integer value if this is an infinite weight
 */
export const weightExamRoomTime = (examDay, examTime, room, clas) => {
  let weight = 0;
  let weightTypes = new Map();

  if (room.exams[examDay][examTime] !== undefined) {
    weight += Number.MAX_VALUE;
  }

  if (clas.numOfStudents > room.capacity) {
    weight += store.getState().generatedWeights.roomTooSmall.penalty;
    setKeyValue(weightTypes, "Room Too Small");
  }

  if (hasCommonFinal(clas)) {
    if (examTime === 3) {
      // exam at 5:30
      weight += store.getState().generatedWeights.lateCommonFinal.penalty;
      setKeyValue(weightTypes, "Common Final at 5:30");
    }
    if (examDay === 4) {
      // exam on Friday
      weight += store.getState().generatedWeights.fridayCommonFinal.penalty;
      setKeyValue(weightTypes, "Common Final on Friday");
    }

    if (examTime !== 3 && examTime !== 1) {
      weight += store.getState().generatedWeights.nonCommonFinal.penalty;
      setKeyValue(weightTypes, "Common Final at Non-Common Time");
    }
  }

  const instructor = SI_Catalog.getInstructorCatalog().get(clas.teacherID);

  for (let course of instructor) {
    if (course.examDay === examDay && course.examTime === examTime) {
      weight +=
        store.getState().generatedWeights.instructorDoubleBooked.penalty;
      setKeyValue(weightTypes, "Instructor Double Booked");
    }
  }

  if (isPriorityExam(clas)) {
    getPriorityClassesOnGivenDay(examDay).forEach((c) => {
      const affectedStudents = getIntersectingStudentsInCourses(clas, c).length;
      weight +=
        store.getState().generatedWeights.sameDayPriorityExams.penalty *
        affectedStudents;
      setKeyValue(weightTypes, "Student has 2 priority Exams Same Day");
    });
  }

  let courses = [clas.courseCode];
  if (clas.courseCode === "x") {
    courses = clas.crossListedClasses;
  }
  for (let courseCode of courses) {
    const students = SI_Catalog.getStudentsObjectsInClass(courseCode);
    students.forEach((student) => {
      let coursesNow = student.getCourseOnDayTime(examDay, examTime);
      if (coursesNow.length > 0) {
        weight +=
          store.getState().generatedWeights.studentDoubleBooked.penalty *
          coursesNow.length;
        setKeyValue(weightTypes, "Student Double Booked");
      }
      if (student.coursesOnDay(examDay).length > 1) {
        weight += store.getState().generatedWeights.threeSameDayExams.penalty;
        setKeyValue(weightTypes, "Student has 3 Exams Same Day");
      }
    });
  }
  return [weight, weightTypes];
};

function convertExamTimeToString(timeCode, dayCode) {
  let ret = "";
  switch (timeCode) {
    case 0:
      ret += "8:00 am";
      break;
    case 1:
      ret += "11:00 am";
      break;
    case 2:
      ret += "2:00 pm";
      break;
    case 3:
      ret += "5:00 pm";
      break;
    case 4:
      ret += "8:00 pm";
      break;
    default:
      ret += "Unknown time";
      break;
  }
  ret += " on ";
  switch (dayCode) {
    case 0:
      ret += "Monday";
      break;
    case 1:
      ret += "Tuesday";
      break;
    case 2:
      ret += "Wednesday";
      break;
    case 3:
      ret += "Thursday";
      break;
    case 4:
      ret += "Friday";
      break;
    default:
      ret += "Unknown Day";
      break;
  }
  return ret;
}

/**
 * Compares a room against rooms that a course can have an exam in and return true if they match.
 * @param course
 * @param lowestRoom
 * @returns {boolean}
 * @author Chandler Frakes
 */
const getBuildingCode = (course, lowestRoom) => {
  let match = false;
  course.roomCode.forEach((rCode) => {
    if (rCode !== undefined) {
      if (
        rCode.match(/[a-zA-Z]+/g)[0] ===
        lowestRoom.roomNumber.match(/[a-zA-Z]+/g)[0]
      ) {
        match = true;
      }
    }
  });
  return match;
};

/**
 * Optimizes an exam to be scheduled based on the course information and room.
 * @param course
 * @param rooms
 * @returns {[undefined,undefined,undefined]}
 * @author Chandler Frakes
 */
export const runCostFunction = (course, rooms) => {
  let lowestCost = undefined;
  let lowestRoom = undefined;
  let lowestTime = undefined;
  let weightType = undefined;
  rooms = Array.from(rooms.values()).filter((room) => room.usable);
  let loopStartTime = 0;

  // If night class, only look at night class times
  let classStartTime = course.startTime.find((e) => e !== undefined);
  if (classStartTime !== undefined) {
    let startTimeString = classStartTime
      .substring(classStartTime.length - 5, classStartTime.length)
      .trim();
    let classTime = new Date();
    let comparisonTime = new Date();
    classTime.setHours(
      parseInt(startTimeString.split(":")[0]),
      parseInt(startTimeString.split(":")[1]),
    );
    comparisonTime.setHours(16, 1);
    if (classTime >= comparisonTime) {
      loopStartTime = 3;
    }
  }

  rooms.forEach((room) => {
    // for each day
    for (let i = 0; i < room.exams.length; i++) {
      // for each time
      for (let x = loopStartTime; x < room.exams[i].length; x++) {
        if (room.exams[i][x] === undefined) {
          let weightData = weightExamRoomTime(i, x, room, course);
          let cost = weightData[0];

          if (lowestCost === undefined || cost < lowestCost) {
            lowestCost = cost;
            weightType = weightData[1];
            lowestRoom = room;
            lowestTime = [i, x];
          } else if (cost === lowestCost) {
            if (
              (room.capacity <= lowestRoom.capacity ||
                course.roomCode.includes(room.roomNumber) ||
                getBuildingCode(course, room)) &&
              [i, x] <= lowestTime
            ) {
              lowestCost = cost;
              weightType = weightData[1];
              lowestRoom = room;
              lowestTime = [i, x];
            }
          }
        }
      }
    }
  });

  return [lowestCost, lowestRoom, lowestTime, weightType];
};

/**
 * Author: Rose Wakelin
 *
 * Shuffles the elements in an array
 * Note: To shuffle a map, pass in Array.from(map.keys()) to get a shuffled list of keys
 * @param array
 */
export const shuffleArray = (array) => {
  if (testing) {
    return array;
  } else {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
};

/**
 * Author: Rose Wakelin
 *
 * Get all the courses for a given common final.
 * Also sets the class size for cross listed classes to be the combination of all sections
 */
export const getCommonFinalClasses = (code) => {
  const keys = Array.from(courses.keys()).filter((key) => key.startsWith(code));
  sameCommonFinals.forEach((list) => {
    if (list.includes(code)) {
      list.forEach((course) => {
        if (course !== code) {
          Array.from(courses.keys())
            .filter((key) => key == course)
            .forEach((sameFinalCode) => {
              keys.push(sameFinalCode);
            });
        }
      });
    }
  });
  const classes = keys.map((key) => courses.get(key));
  const classesWithCross = [];
  const handledCrossListed = [];
  for (let clas of classes) {
    let alreadyHandled = handledCrossListed.includes(clas.courseCode);
    if (hasCrosslistedFinal(clas) && !alreadyHandled) {
      let crossWithThisClass = [clas.courseCode];
      handledCrossListed[handledCrossListed.length] = clas.courseCode;
      let size = parseInt(clas.numOfStudents);

      for (let crossClas of clas.crossListedClasses) {
        let cc = courses.get(crossClas);
        if (cc) {
          size += parseInt(cc.numOfStudents);
          crossWithThisClass[crossWithThisClass.length] = cc.courseCode;
          handledCrossListed[handledCrossListed.length] = cc.courseCode;
        }
      }

      let combinedClass = new Course(
        clas.courseCode,
        true,
        "x",
        crossWithThisClass,
      );
      combinedClass.numOfStudents = size;
      combinedClass.teacherID = clas.teacherID;
      classesWithCross[classesWithCross.length] = combinedClass;
    } else if (!alreadyHandled) {
      classesWithCross[classesWithCross.length] = clas;
    }
  }
  return classesWithCross;
};

function weightExamDayTime(day, time, toSchedule, isCommon) {
  let weight = 0;
  const state = store.getState().generatedWeights;

  if (isCommon) {
    if (time === 3) {
      // exam at 5:30
      weight += state.lateCommonFinal.penalty;
    }
    if (day === 4) {
      // exam on Friday
      weight += state.fridayCommonFinal.penalty;
    }
  }

  toSchedule.forEach((clas) => {
    if (profExams[day][time].has(clas.teacherID)) {
      weight += state.instructorDoubleBooked.penalty;
    }

    if (isPriorityExam(clas)) {
      getPriorityClassesOnGivenDay(day).forEach((c) => {
        const affectedStudents = getIntersectingStudentsInCourses(
          clas,
          c,
        ).length;
        weight += state.sameDayPriorityExams.penalty * affectedStudents;
      });
    }

    const students = SI_Catalog.getStudentsInClass(clas.courseCode);
    for (let [studentID, student] of students) {
      if (studentExams[day][time].has(studentID)) {
        weight += state.studentDoubleBooked.penalty;
      }

      let numSameDaysExam = 0;
      for (let i = 0; i < NUM_EXAM_TIMES; i++) {
        if (studentExams[day][i].has(studentID)) {
          numSameDaysExam += 1;
        }
      }

      if (numSameDaysExam >= 3) {
        weight += state.threeSameDayExams.penalty;
      }
    }
  });

  let availableRooms = Array.from(rooms.values()).filter(
      (room) => !room.exams[day][time] && room.usable,
  );

  // If there are not enough rooms for all exams, set the weight to max value
  if (availableRooms.length < toSchedule.length) {
    weight = Number.MAX_VALUE;
  } else {
    const assignedRooms = new Set();

    toSchedule.forEach((course) => {
      // Find a room with the smallest capacity that can fit all students for the current course
      let selectedRoom = null;
      let minCapacity = Number.MAX_VALUE;

      availableRooms.forEach((room) => {
        // Check if the room capacity is sufficient for the current course
        // and the room is not already assigned to another course
        if (
          room.capacity >= course.numOfStudents &&
          room.capacity < minCapacity &&
          !assignedRooms.has(room)
        ) {
          selectedRoom = room;
          minCapacity = room.capacity;
        }
      });

      // If no rooms are big enough for the class, update the weight and assign to the biggest remaining room
      if (!selectedRoom) {
        weight += state.roomTooSmall.penalty;
        selectedRoom = findRoomWithHighestCapacity(
          Array.from(rooms.values()).filter(
            (room) => !assignedRooms.has(room.roomNumber),
          ),
        );
      }
      assignedRooms.add(selectedRoom);
    });
  }

  return weight;
}
/**
 * Schedules all given exams at the same given day and time.
 * @param {*} day
 * @param {*} time
 * @param {*} toSchedule course objects to schedule
 */
function scheduleExamsInBestRoom(day, time, toSchedule) {
  let availableRooms = Array.from(rooms.values()).filter(
      (room) => !room.exams[day][time] && room.usable,
  );
  const assignedRooms = new Set();

  toSchedule.forEach((course) => {
    // Find a room with the smallest capacity that can fit all students for the current course
    let selectedRoom = null;
    let minCapacity = Number.MAX_VALUE;

    availableRooms.forEach((room) => {
      // Check if the room capacity is sufficient for the current course and the room is not already assigned to another course
      if (
        room.capacity >= course.numOfStudents &&
        room.capacity < minCapacity &&
        !assignedRooms.has(room)
      ) {
        selectedRoom = room;
        minCapacity = room.capacity;
      }
    });

    // If no rooms are big enough for the class, assign to the biggest remaining room
    if (!selectedRoom) {
      selectedRoom = findRoomWithHighestCapacity(
        Array.from(rooms.values()).filter(
          (room) => !assignedRooms.has(room.roomNumber),
        ),
      );
    }
    assignedRooms.add(selectedRoom);
    scheduleExam(course, day, time, selectedRoom);
  });
}

/**
 * Author: Ian Czerkis
 *
 * Schedules common finals and returns the weight of the schedule.
 * Returns the max integer value is the weight is infinite
 */
const schedulePotentialCommonFinals = () => {
  const commonFinalTimes = [1, 3];
  let shuffledCodes = shuffleArray(
    commonFinalCodes.filter((str) => !str.endsWith("A")),
  );
  let scheduleWeight = 0;
  shuffledCodes.forEach((codeToSchedule) => {
    const unscheduledCourses = [];
    for (let [courseCode, course] of courses) {
      if (courseCode.startsWith(codeToSchedule) && !course.isForced) {
        unscheduledCourses.push(course);
      }
    }
    let dayTimeCombinations = [];

    for (let i = 0; i < NUM_EXAM_DAYS; i++) {
      for (let time of commonFinalTimes) {
        const weight = weightExamDayTime(i, time, unscheduledCourses, true);
        dayTimeCombinations.push({ day: i, time: time, weight: weight });
      }
    }

    // Find the combination with the lowest weight using reduce
    dayTimeCombinations = shuffleArray(dayTimeCombinations);
    let lowestWeightCombo = dayTimeCombinations.reduce(
      (minCombo, currentCombo) => {
        return currentCombo.weight < minCombo.weight ? currentCombo : minCombo;
      },
      dayTimeCombinations[0],
    );

    const bestDay = lowestWeightCombo.day;
    const bestTime = lowestWeightCombo.time;
    scheduleExamsInBestRoom(bestDay, bestTime, unscheduledCourses);
    scheduleWeight += lowestWeightCombo.weight;
  });

  return scheduleWeight;
};

function populateExistingCoursesToSets() {
  courses.forEach((course) => {
    if (course.examTime !== undefined) {
      originalProfExams[course.examDay][course.examTime].add(course.teacherID);
    }
  });
  Array.from(SI_Catalog.getStudentCatalog().entries()).forEach(
    ([studentID, student]) => {
      courses = student.courses;
      courses.forEach((course, courseID) => {
        if (course.examTime !== undefined) {
          originalStudentExams[course.examDay][course.examTime].add(
            student.studentID,
          );
        }
      });
    },
  );
}

function generateDayTimeSets() {
  const arr = [];
  for (let i = 0; i < NUM_EXAM_DAYS; i++) {
    const row = [];
    for (let j = 0; j < NUM_EXAM_TIMES; j++) {
      row.push(new Set());
    }
    arr.push(row);
  }
  return arr;
}

function deepCopySet(originalSet) {
  const copiedSet = new Set();

  originalSet.forEach((str) => {
    const copiedStr = str.slice(); // Use slice to create a new string
    copiedSet.add(copiedStr);
  });

  return copiedSet;
}

function deepClone2DSetArray(setArray) {
  const newArray = [];
  setArray.forEach((array) => {
    const newArrayRow = [];
    array.forEach((set) => {
      newArrayRow.push(deepCopySet(set));
    });
    newArray.push(newArrayRow);
  });
  return newArray;
}

/**
 * Author: Rose Wakelin
 * Uses mementos to schedules common finals given number of times and chooses and schedules the most optimal
 */
export const scheduleCommonFinals = () => {
  const careTaker = new CareTaker();
  careTaker.placeVersion(new Schedule(courses, rooms, 0, weights).toString());
  originalStudentExams = generateDayTimeSets();
  originalProfExams = generateDayTimeSets();
  populateExistingCoursesToSets();

  for (let i = 0; i < NUM_MEMENTOS_FOR_COMMON_FINALS; i++) {
    const baseSchedule = new Schedule([], [], undefined);
    baseSchedule.parse(careTaker.getVersion(0));
    courses = baseSchedule.getCourses();
    rooms = baseSchedule.getRooms();
    studentExams = deepClone2DSetArray(originalStudentExams);
    profExams = deepClone2DSetArray(originalProfExams);
    const weight = schedulePotentialCommonFinals();
    careTaker.placeVersion(new Schedule(courses, rooms, weight).toString());
  }

  const lowestWeightSchedule = new Schedule([], [], undefined);
  lowestWeightSchedule.parse(careTaker.getLowestWeightVersion());
  courses = lowestWeightSchedule.getCourses();
  rooms = lowestWeightSchedule.getRooms();
};

/**
 * Author: Ian Czerkis
 * Uses mementos to schedules crosslisted finals given number of times and chooses and schedules the most optimal
 */
export function scheduleCrosslistedFinals() {
  const careTaker = new CareTaker();
  careTaker.placeVersion(new Schedule(courses, rooms, 0, weights).toString());
  originalStudentExams = generateDayTimeSets();
  originalProfExams = generateDayTimeSets();
  populateExistingCoursesToSets();

  for (let i = 0; i < NUM_MEMENTOS_FOR_COMMON_FINALS; i++) {
    const baseSchedule = new Schedule([], [], undefined);
    baseSchedule.parse(careTaker.getVersion(0));
    courses = baseSchedule.getCourses();
    rooms = baseSchedule.getRooms();
    studentExams = deepClone2DSetArray(originalStudentExams);
    profExams = deepClone2DSetArray(originalProfExams);
    const weight = schedulePotentialCrosslistedFinals();
    careTaker.placeVersion(new Schedule(courses, rooms, weight).toString());
  }

  const lowestWeightSchedule = new Schedule([], [], undefined);
  lowestWeightSchedule.parse(careTaker.getLowestWeightVersion());
  courses = lowestWeightSchedule.getCourses();
  rooms = lowestWeightSchedule.getRooms();
}

/**
 * Author: Ian Czerkis
 *
 * Schedules all crosslisted exams at the same time for each exam
 */
export function schedulePotentialCrosslistedFinals() {
  const crosslistedCourseCodes = [];
  for (let [courseCode, course] of courses) {
    if (course.specialCode === "x" && !course.isForced && !course.examDay) {
      crosslistedCourseCodes.push(courseCode);
    }
  }
  let shuffledCodes = shuffleArray(crosslistedCourseCodes);
  let scheduleWeight = 0;
  shuffledCodes.forEach((codeToSchedule) => {
    const crosslistedCourse = courses.get(codeToSchedule);
    if (crosslistedCourse.examTime === undefined) {
      const unscheduledCourses = [crosslistedCourse];
      crosslistedCourse.crossListedClasses.forEach((clas) => {
        const courseObj = courses.get(clas);
        if (courseObj) {
          unscheduledCourses.push(courseObj);
        }
      });
      let dayTimeCombinations = [];

      for (let i = 0; i < NUM_EXAM_DAYS; i++) {
        for (let j = 0; j < NUM_EXAM_TIMES; j++) {
          const weight = weightExamDayTime(i, j, unscheduledCourses, false);
          dayTimeCombinations.push({ day: i, time: j, weight: weight });
        }
      }
      // Find the combination with the lowest weight using reduce
      dayTimeCombinations = shuffleArray(dayTimeCombinations);
      let lowestWeightCombo = dayTimeCombinations.reduce(
        (minCombo, currentCombo) => {
          return currentCombo.weight < minCombo.weight
            ? currentCombo
            : minCombo;
        },
        dayTimeCombinations[0],
      );

      const bestDay = lowestWeightCombo.day;
      const bestTime = lowestWeightCombo.time;
      scheduleExamsInBestRoom(bestDay, bestTime, unscheduledCourses);
      scheduleWeight += lowestWeightCombo.weight;
    }
  });

  return scheduleWeight;
}

/**
 * Loops through the courses in the course data structure and returns the ones that are priority exams
 * @return {*[]}
 */
export const getPriorityCourses = () => {
  const pCourses = [];
  getCourses().forEach((c) => {
    if (isPriorityExam(c)) {
      pCourses.push(c);
    }
  });
  return pCourses;
};

/**
 * Author: Kyle Senebouttarath
 * Subpart used to iterate through courses until a valid priority exam schedule is made
 *
 * @returns {number}
 */
export const placePriorityExams = () => {
  let totalWeight = 0;
  let foundValidPriorityExamSchedule = false;
  while (!foundValidPriorityExamSchedule) {
    const pCourses = shuffleArray(getPriorityCourses());

    if (pCourses.length <= 0) {
      foundValidPriorityExamSchedule = true;
    }

    pCourses.forEach((pc) => {
      if (!pc.isForced) {
        const [lowestCost, lowestRoom, lowestTime, weightType] =
          runCostFunction(pc, getRooms());

        if (lowestCost === Number.MAX_VALUE) {
          foundValidPriorityExamSchedule = false;
        } else {
          scheduleExamInRoomOnly(pc, lowestRoom, lowestTime[0], lowestTime[1]);
          pc.examRoom = lowestRoom.roomNumber;
          pc.examDay = lowestTime[0];
          pc.examTime = lowestTime[1];
          foundValidPriorityExamSchedule = true;
        }
        totalWeight += lowestCost;
      }
    });
  }

  return totalWeight;
};

/**
 * Author: Kyle Senebouttarath
 * Run after common final scheduling, checks if there are exams in courses marked as priority. Place priority
 * exams in such a way where no student would have two priority exams on a single day
 */
export const schedulePriorityExams = (updateCallback) => {
  if (getPriorityCourses().length <= 0) {
    return;
  }

  const ct = new CareTaker();
  ct.placeVersion(new Schedule(getCourses(), getRooms(), 0).toString());

  for (let i = 0; i < NUM_MEMENTOS_FOR_PRIORITY_EXAMS; i++) {
    //Randomly place and schedule priority exams
    const weight = placePriorityExams();
    careTaker.placeVersion(new Schedule(courses, rooms, weight).toString());

    //Reset our global courses and rooms map to what they were before we added those priority exams
    const baseSchedule = new Schedule([], [], undefined);
    baseSchedule.parse(careTaker.getVersion(0));
    courses = baseSchedule.getCourses();
    rooms = baseSchedule.getRooms();
  }

  //Get our lowest priority exam memento, make it our current globals for courses and rooms
  const lowestWeightSchedule = new Schedule([], [], undefined);
  lowestWeightSchedule.parse(careTaker.getLowestWeightVersion());
  courses = lowestWeightSchedule.getCourses();
  rooms = lowestWeightSchedule.getRooms();
};

export const userImportSICatalog = async (data) => {
  SI_Catalog.setCourseMap(courses);
  let validFile = await SI_Catalog.importClassListRawData(data);
  if (validFile) {
    SI_Catalog.updateCoursesWithClassList();
    SI_Catalog.refreshCatalogs();
  } else {
    SI_Catalog.classListData = null;
  }
};

export const userImportRooms = async (data) => {
  await importRooms(data);
};

export const userImportSpecialCases = async (data) => {
  await importSpecialTreatmentCourses(data);
};

/**
 * Author: Kyle Senebouttarath
 * Section of code in execute that imports everything into the program on initial run
 */
export const importAllOnAppStart = async () => {
  // await importWeights(await preloadedFile(weightsTxt));
  await importRooms(await preloadedFile(roomCapacitiesTxt));
};

export const importAllOnTestStart = async (
  rawCourseScheduleData,
  rawClassListData,
  rawRoomFileData,
  rawSpecialData,
  rawWeightData,
  testWorker,
) => {
  setTestingMode(true);

  if (rawWeightData !== undefined) {
    importWeights(rawWeightData);
  }
  importRooms(rawRoomFileData);

    importCourses(rawCourseScheduleData);
    importSpecialTreatmentCourses(rawSpecialData);

    SI_Catalog.setCourseMap(courses);
    SI_Catalog.importClassListRawData(rawClassListData);
    await SI_Catalog.updateCoursesWithClassList();
    SI_Catalog.refreshCatalogs();
    updateSpecialCourses();
    if(testWorker){
        phase2Worker = testWorker;
    }
}


/**
 * Author: Alex Ottelien
 * @param course
 * @returns {any[]}
 */
export const splitClasses = (course) => {
  let classesAtTimes = new Map();
  for (let i = 0; i < course.day.length; i++) {
    if (
        course.roomCode[i] !== undefined &&
        course.startTime[i] !== undefined &&
        course.endTime[i] !== undefined
    ) {
      const key =
          course.roomCode[i] +
          "\t" +
          course.startTime[i] +
          "\t" +
          course.endTime[i];
      if (classesAtTimes.has(key)) {
        classesAtTimes.set(key, classesAtTimes.get(key) + course.day[i]);
      } else {
        let classData =
            "\n" +
            course.yearCode +
            "\t" +
            course.termCode +
            "\t" +
            course.roomCode[i] +
            "\t" +
            course.courseCode +
            "\t";
        for (let x = 0; x < i; x++) {
          classData += "\t";
        }
        classData += course.day[i];
        classesAtTimes.set(key, classData);
      }
    }
    classesAtTimes.forEach((value, key) => {
      const data = key.split("\t")
      classesAtTimes.set(key,
          classesAtTimes.get(key) + "\t" + data[1] + "\t" + data[2] + "\t"
          + (course.examRoom !== undefined ? course.examRoom : "") + "\t"
          + (course.examDay !== undefined ? indexToDay(course.examDay) : "") + "\t"
          + (course.examTime !== undefined ? indexToTime(course.examTime) : "") + "\t"
          + (course.forceTime !== undefined ? course.forceTime : ""))
    })
    return Array.from(classesAtTimes.values())
  }
}

/**
 * Starts the service worker and sets up a message handler to recieve messages.
 * Closes service worker once the "schedule" message is recieved
 */
function startPhase2AndGetSchedule() {
  return new Promise((resolve, reject) => {
    function messageHandler(e) {
      const { type, data } = e.data;
      if (type === "progress") {
        store.dispatch(setProgress(data));
      } else if (type === "schedule") {
        courses = data.courses;
        rooms = data.rooms;
        weights = data.weights;
        resolve(data.schedule);
        phase2Worker.removeEventListener("message", messageHandler);
      }
    }
    weights = new Map();
    const weightsState = store.getState().generatedWeights;
    weights.set("No Available Time", [weightsState.noAvailableTime.penalty,0,[]]);
    weights.set("Room Time Double Booked", [weightsState.roomDoubleBooked.penalty,0,[]]);
    weights.set("Room Too Small", [weightsState.roomTooSmall.penalty, 0, []]);
    weights.set("Instructor Double Booked", [weightsState.instructorDoubleBooked.penalty,0,[]]);
    weights.set("Student Double Booked", [weightsState.studentDoubleBooked.penalty,0,[]]);
    weights.set("Student has 3 Exams Same Day", [weightsState.threeSameDayExams.penalty,0,[]]);
    weights.set("Student has 2 priority Exams Same Day", [weightsState.sameDayPriorityExams.penalty,0,[]]);
    weights.set("Common Final at 5:30", [weightsState.lateCommonFinal.penalty,0,[]]);
    weights.set("Common Final on Friday", [weightsState.fridayCommonFinal.penalty,0,[]]);
    weights.set("Common Final at Non-Common Time", [weightsState.nonCommonFinal.penalty,0,[]]);
    phase2Worker.addEventListener("message", messageHandler);
    phase2Worker.postMessage({
      type: "start",
      data: { courses, rooms, weights, SI_Catalog },
    });
  });
}

/**
 * Author: Matthew Wehman
 * This method will merge course sections together that meet the following conditions
 *  - Sections are from the same course
 *  - Both sections has the same professor
 *  - Every class time and day throughout the week is the same OR there is only one time disparity per week
 *
 * The result of this method is the creation of a new course with the following new information:
 *  - CourseCode: Course section/section
 *  - Students from each course are added together
 *  - Days that each section meet are combined
 *  - The instructor is set to the shared instructor between the courses.
 *
 * Each of the individual sections are deleted from the course map when they are merged.
 */
const mergeCourses = () => {
  for (let [key, course] of courses) {
    let courseCode = key;
    let sameClass = Array.from(courses)
      .filter(
        ([key, value]) =>
          key !== courseCode && key.startsWith(courseCode.substr(0, 10)),
      )
      .filter(([key, value]) => {
        let count = 0;
        if (
          course.teacherID === value.teacherID &&
          course.specialCode !== "n" &&
          value.specialCode !== "n"
        ) {
          for (let i = 0; i < course.day.length; i++) {
            if (course.day[i] !== undefined || value.day[i] !== undefined) {
              if (
                course.day[i] === value.day[i] &&
                (course.startTime[i] !== value.startTime[i] ||
                  course.endTime[i] !== value.endTime[i])
              ) {
                count++;
              } else if (course.day[i] !== value.day[i]) {
                count++;
              }
            }
          }
          return count < 3;
        }
        return false;
      });
    if (sameClass.length > 0) {
      const firstClass = sameClass[0][1];
      course.examDay = firstClass.examDay;
      course.examTime = firstClass.examTime;
      course.examRoom = firstClass.examRoom;
      course.forceTime = firstClass.forceTime;
      courses.delete(courseCode);
      // eslint-disable-next-line no-loop-func
      sameClass.forEach((courseData) => {
        courses.delete(courseData[0]);
        const diffStudents = courseData[1].students.filter(
          (id) => !course.students.includes(id),
        );
        if(course.crossListedClasses?.length > 0){
          let index = course.crossListedClasses.indexOf(courseData[0]);
          if (index !== -1) {
            course.crossListedClasses.splice(index, 1);
          }
        }
        course.students = course.students.concat(diffStudents);
        course.numOfStudents = course.students.length;
        course.courseCode += "/" + courseData[0].substr(-3);
        for (let i = 0; i < course.day.length; i++) {
          if (!course.day[i] && courseData[1].day[i]) {
            course.day[i] = courseData[1].day[i];
            course.startTime[i] = courseData[1].startTime[i];
            course.endTime[i] = courseData[1].endTime[i];
            course.roomCode[i] = courseData[1].roomCode[i];
          }
        }
      });
      if (course.crossListedClasses?.length > 0) {
        // eslint-disable-next-line no-loop-func
        course.crossListedClasses.forEach((code) => {
          const crossedClass = courses.get(code);
          crossedClass.crossListedClasses = crossedClass.crossListedClasses.filter(value => courses.get(value) !== undefined)
          crossedClass.crossListedClasses.push(course.courseCode);
        })
      }
      courses.set(course.courseCode, course);
    }
  }
};

export const generateSchedule = async () => {
  if (!specialCoursesUploaded) {
    await importSpecialTreatmentCourses(
      await preloadedFile(specialTreatmentCoursesTxt),
    );
  }
  //---- CLEAN ----//
  careTaker.clear();
  store.dispatch(resetGeneratedStates()); // resets the wight table, so the classes don't stack
  store.dispatch(resetCourseSlice());
  //---- RUN ----//

  store.dispatch(setProgress(0));
  console.log(`Deleted Courses: [${deletedCourses}]`)
  setTimeout(() => {
    originalCourses = deepCloneMap(courses);
    console.log("Removing no-exam courses...");
    updateSpecialCourses();

    mergeCourses();

    SI_Catalog.setCourseMap(courses);

    console.log("Setting forced-time exams...");
    scheduleForcedTimeExams();

    console.log("Placing initial classes...");
    phase1();

    SI_Catalog.setCourseMap(courses);
    SI_Catalog.refreshCatalogs();

    console.log("Placing common final classes...");
    scheduleCommonFinals();

    console.log("Placing cross-listed final classes...");
    scheduleCrosslistedFinals();

    console.log("Placing priority classes...");
    schedulePriorityExams();

    console.log("Placing remaining classes...");
    startPhase2AndGetSchedule().then((schedule) => {
      store.dispatch(setProgress(100));
      SI_Catalog.setCourseMap(courses);
      SI_Catalog.refreshCatalogs();
      const cloneCourses = deepCloneMap(courses);
      for (const [key, value] of cloneCourses) {
        store.dispatch(addCourse({ id: key, courseObj: value }));
      }
      weightAllRedux();
      store.dispatch(setProgress(-1));
      console.log("Done!");
    });
  }, 100);
};

/**
 * Author: Alex Ottelien, Kyle Senebouttarath
 * This code will unschedule a given course code by removing its exam day and time. It will also handle the class's
 * cross-listed courses, update the rooms the change affects, update the weighting due to the change
 * @param courseCodeToUnschedule A course code (key) to unschedule
 */
export const unscheduleExam = (courseCodeToUnschedule) => {
  let course = courses.get(courseCodeToUnschedule);
  //Remove course from room schedule
  unscheduleExamInRoomOnly(getRoom(course.examRoom), course.examDay, course.examTime);

  store.dispatch(removeWeightedInstance({ course: courseCodeToUnschedule }));
  //Remove and unschedule related crosslisted courses
  if (course.specialCode === "c") {
    const sameCommonClass = getCommonFinalClasses(
      course.courseCode.slice(0, 10),
    );
    sameCommonClass.forEach((c) => {
      SI_Catalog.unscheduleStudentsInClass(c);
      c.examDay = undefined;
      c.examTime = undefined;
      c.examRoom = undefined;
      store.dispatch(removeWeightedInstance({ course: c.courseCode }));
    });
  }
  if (course.crossListedClasses.length > 0) {
    course.crossListedClasses.forEach((crosslistedCode) => {
      const foundCourse = courses.get(crosslistedCode);
      if (foundCourse) {
        SI_Catalog.unscheduleStudentsInClass(foundCourse);
        foundCourse.examDay = undefined;
        foundCourse.examTime = undefined;
        foundCourse.examRoom = undefined;
      }
    });
  }
  //Remove main course
  SI_Catalog.unscheduleStudentsInClass(course);
  course.examDay = undefined;
  course.examTime = undefined;
  course.examRoom = undefined;

  //Refresh and student/instructor dependencies on said course(s)
  SI_Catalog.setCourseMap(courses);
};

/**
 * Determines if conflicts will occur by scheduling a course at the given room and day/time.
 * @param {*} examDay Day course will be scheduled
 * @param {*} examTime Time course will be scheduled
 * @param {*} room Room to schedule course in
 * @param {*} clas Course object
 * @returns
 */
export const weightReduxExamTime = (examDay, examTime, room, clas) => {
  let weight = 0;
  let weightTypes = new Map();
  if (clas.numOfStudents > room.capacity) {
    store.dispatch(
      addWeightedInstance({
        title: "roomTooSmall",
        courses: [clas.courseCode],
        instance: {
          Instructor: clas.teacherID,
          Exam_Time: convertExamTimeToString(examTime, examDay),
          Room: room.roomNumber,
          Course_Code: clas.courseCode,
          Room_Capacity: room.capacity,
          Class_Enrollment: clas.numOfStudents,
        },
      }),
    );
  }
  if (hasCommonFinal(clas)) {
    if (examTime === 3) {
      // exam at 5:30
      store.dispatch(
        addWeightedInstance({
          // sub table for lateCommonFinal
          title: "lateCommonFinal",
          courses: [clas.courseCode],
          instance: {
            Instructor: clas.teacherID, // column 1 instructor id
            Exam_Time: convertExamTimeToString(examTime, examDay), // exam time
            Room: room.roomNumber, // room number
            Course_Code: clas.courseCode, // course code of the class
          },
        }),
      );
    } else if (examTime !== 1) {
      store.dispatch(
        addWeightedInstance({
          // sub table for noncommon final
          title: "nonCommonFinal",
          courses: [clas.courseCode],
          instance: {
            Instructor: clas.teacherID, // column 1 instructor id
            Exam_Time: convertExamTimeToString(examTime, examDay), // exam time
            Room: room.roomNumber, // room number
            Course_Code: clas.courseCode, // course code of the class
          },
        }),
      );
    }
    if (examDay === 4) {
      // exam on Friday
      store.dispatch(
        addWeightedInstance({
          title: "fridayCommonFinal",
          instance: {
            Course: clas.courseCode,
          },
          courses: [clas.courseCode],
        }),
      );
    }
  }
  const instructor = SI_Catalog.getInstructorCatalog().get(clas.teacherID);

  for (let course of instructor) {
    if (course.courseCode !== clas.courseCode) {
      if (course.examDay === examDay && course.examTime === examTime) {
        store.dispatch(
          addWeightedInstance({
            title: "instructorDoubleBooked",
            courses: [course.courseCode, clas.courseCode],
            instance: {
              Instructor: clas.teacherID,
              Exam_Time: convertExamTimeToString(examTime, examDay),
              Course_1_Code: course.courseCode,
              Course_2_Code: clas.courseCode,
            },
          }),
        );
      }
    }
  }

  if (isPriorityExam(clas)) {
    getPriorityClassesOnGivenDay(examDay).forEach((c) => {
      const affectedStudents = getIntersectingStudentsInCourses(clas, c);
      for (let student of affectedStudents) {
        store.dispatch(
          addWeightedInstance({
            title: "sameDayPriorityExams",
            courses: [c.courseCode, clas.courseCode],
            instance: {
              studentId: student,
              Course_1_Code: clas.courseCode,
              Course_2_Code: c.courseCode,
            },
          }),
        );
      }
    });
  }

  let courses = [clas.courseCode];
  if (clas.courseCode === "x") {
    courses = clas.crossListedClasses;
  }
  let visited = new Set();
  for (let courseCode of courses) {
    const students = SI_Catalog.getStudentsObjectsInClass(courseCode);
    students.forEach((student) => {
      let courseAtTime = student.getCourseOnDayTime(examDay, examTime);
      courseAtTime.forEach((course) => {
        if (course !== courseCode) {
          store.dispatch(
            addWeightedInstance({
              title: "studentDoubleBooked",
              courses: [course, courseCode],
              instance: {
                studentId: student.studentID,
                Course_1_Code: course,
                Course_2_Code: courseCode,
              },
            }),
          );
        }
      });
      const uniqueDayCourses = student.coursesOnDay(examDay).flat();
      if (uniqueDayCourses.length >= 2) {
        uniqueDayCourses.push(clas.courseCode);
        const uniqueCourseCombos = getUniqueCombinations(
          uniqueDayCourses,
        ).filter((x) => x.includes(courseCode));
        for (let i = 0; i < uniqueCourseCombos.length; i++) {
          store.dispatch(
            addWeightedInstance({
              title: "threeSameDayExams",
              courses: [
                uniqueCourseCombos[i][0],
                uniqueCourseCombos[i][1],
                uniqueCourseCombos[i][2],
              ],
              instance: {
                studentId: student.studentID,
                Course_1_Code: uniqueCourseCombos[i][0],
                Course_2_Code: uniqueCourseCombos[i][1],
                Course_3_Code: uniqueCourseCombos[i][2],
              },
            }),
          );
        }
      }
      visited.add(student);
    });
  }
  return [weight, weightTypes];
};

/**
 * Weights the initial schedule that is returned by the service worker and adds any found conflicts to the redux slice
 */
export function weightAllRedux() {
  const students = SI_Catalog.getStudentCatalog();
  const rooms = getRooms();
  Array.from(students.values()).forEach((student) => {
    let doubleBooked = student.getDoubleBooked();
    if (doubleBooked.length > 0) {
      doubleBooked.forEach((conflict) => {
        store.dispatch(
          addWeightedInstance({
            title: "studentDoubleBooked",
            courses: [conflict[0], conflict[1]],
            instance: {
              studentId: student.studentID,
              Course_1_Code: conflict[0],
              Course_2_Code: conflict[1],
            },
          }),
        );
      });
    }
  });
  const instructorMap = new Map();
  for (let day = 0; day < 5; day++) {
    students.forEach((student) => {
      let dayCourses = student.coursesOnDay(day);
      if (dayCourses.length > 1) {
        let priorityCourses = [];
        dayCourses.forEach((course) => {
          if (getCourse(course).specialCode === 'p') priorityCourses.push(course);
        });
        if (priorityCourses.length > 1) {
          store.dispatch(
            addWeightedInstance({
              title: "sameDayPriorityExams",
              courses: priorityCourses,
              instance: {
                studentId: student.studentID,
                Course_1_Code: priorityCourses[0],
                Course_2_Code: priorityCourses[1],
              },
            }),
          );
        }
      }
      const uniqueDayCourses = dayCourses.flat();
      if (uniqueDayCourses.length >= 2) {
        const uniqueCourseCombos = getUniqueCombinations(uniqueDayCourses);
        for (let i = 0; i < uniqueCourseCombos.length; i++) {
          store.dispatch(
            addWeightedInstance({
              title: "threeSameDayExams",
              courses: [
                uniqueCourseCombos[i][0],
                uniqueCourseCombos[i][1],
                uniqueCourseCombos[i][2],
              ],
              instance: {
                studentId: student.studentID,
                Course_1_Code: uniqueCourseCombos[i][0],
                Course_2_Code: uniqueCourseCombos[i][1],
                Course_3_Code: uniqueCourseCombos[i][2],
              },
            }),
          );
        }
      }
    });
    for (let time = 0; time < 5; time++) {
      rooms.forEach((room) => {
        if (
          room.exams[day][time] !== undefined &&
          room.exams[day][time] !== "crossClass"
        ) {
          const courseCode = room.exams[day][time];
          let exam = getCourse(courseCode);
          room = getRoom(exam.examRoom); // checks to make sure room is not a dependent
          if (
            exam &&
            exam.specialCode &&
            exam.specialCode === "c" &&
            !room.hasADependent
          ) {
            if (exam.examTime === 3) {
              store.dispatch(
                addWeightedInstance({
                  title: "lateCommonFinal",
                  courses: [exam.courseCode],
                  instance: {
                    Instructor: exam.teacherID,
                    Exam_Time: convertExamTimeToString(time, day),
                    Room: room.roomNumber,
                    Course_Code: exam.courseCode,
                  },
                }),
              );
            } else if (exam.examDay === 4) {
              store.dispatch(
                addWeightedInstance({
                  title: "fridayCommonFinal",
                  courses: [exam.courseCode],
                  instance: {
                    Instructor: exam.teacherID,
                    Exam_Time: convertExamTimeToString(time, day),
                    Room: room.roomNumber,
                    Course_Code: exam.courseCode,
                  },
                }),
              );
            } else if (exam.examTime !== 1) {
              store.dispatch(
                addWeightedInstance({
                  title: "nonCommonFinal",
                  courses: [exam.courseCode],
                  instance: {
                    Instructor: exam.teacherID,
                    Exam_Time: convertExamTimeToString(time, day),
                    Room: room.roomNumber,
                    Course_Code: exam.courseCode,
                  },
                }),
              );
            }
          }
          const instructor = SI_Catalog.getInstructorCatalog().get(
            exam.teacherID,
          );
          const foundConflicts = instructorMap.has(exam.teacherID)
            ? instructorMap.get(exam.teacherID)
            : new Set();
          if (instructor) {
            for (let course of instructor) {
              if (course.courseCode !== exam.courseCode) {
                if (
                  course.examDay === day &&
                  course.examTime === time &&
                  !(
                    foundConflicts.has(course.courseCode) &&
                    foundConflicts.has(exam.courseCode)
                  )
                ) {
                  store.dispatch(
                    addWeightedInstance({
                      title: "instructorDoubleBooked",
                      courses: [course.courseCode, exam.courseCode],
                      instance: {
                        Instructor: exam.teacherID,
                        Exam_Time: convertExamTimeToString(time, day),
                        Course_1_Code: course.courseCode,
                        Course_2_Code: exam.courseCode,
                      },
                    }),
                  );
                  foundConflicts.add(course.courseCode);
                  foundConflicts.add(exam.courseCode);
                  instructorMap.set(exam.teacherID, foundConflicts);
                }
              }
            }
          }
          if (exam.numOfStudents > room.capacity) {
            store.dispatch(
              addWeightedInstance({
                title: "roomTooSmall",
                courses: [exam.courseCode],
                instance: {
                  Instructor: exam.teacherID,
                  Exam_Time: convertExamTimeToString(time, day),
                  Room: room.roomNumber,
                  Course_Code: exam.courseCode,
                  Room_Capacity: room.capacity,
                  Class_Enrollment: exam.numOfStudents,
                },
              }),
            );
          }
        }
      });
    }
  }
}

/**
 * Finds all of the unique combonations of a 3 element array
 * @param {*} array three element array
 * @returns array of all combinations
 */
function getUniqueCombinations(array) {
  const uniqueCombinations = [];
  // Generate all combinations of three elements
  for (let i = 0; i < array.length - 2; i++) {
    for (let j = i + 1; j < array.length - 1; j++) {
      for (let k = j + 1; k < array.length; k++) {
        const combination = [array[i], array[j], array[k]];
        // Check if the combination has unique classes
        if (new Set(combination).size === 3) {
          uniqueCombinations.push(combination);
        }
      }
    }
  }

  return uniqueCombinations;
}

/**
 * Cleans out the entire program for re-use.
 */
export const clean = () => {
  if (rooms !== undefined) {
    rooms.clear();
  }
  courses.clear();
  SI_Catalog.clear();
  careTaker.clear();
  store.dispatch(resetGeneratedStates());
  store.dispatch(resetCourseSlice());
};

export const setTestingMode = (state) => {
  testing = state;
};
