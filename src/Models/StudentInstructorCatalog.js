/**
 * Author: Kyle Senebouttarath
 * Last Update: 1/20/23
 *
 * This class is a custom data structure is responsible for parsing the class list files
 * and organizing the student IDs and instructor IDs into maps. These maps then contain
 * arrays that indicate what courses these students and instructors are involved in.
 */

//---------------- IMPORTS ----------------//

import { filterData } from "../FinalExamScheduler.js";
import {
  findColumns,
  parseLines,
  getFileData,
  openFile,
} from "../Import/FileIO.js";
import { Student } from "./Student.js";

//---------------- CONSTANTS ----------------//

const CLASS_LIST_HEADERS = [
  "id_num",
  "yr_cde",
  "trm_cde",
  "crs_cde",
  "lead_instructr_id",
  "crs_enrollment",
];

//---------------- CLASS ----------------//

export const StudentInstructorCatalog = class {
  /**
   * Primary constructor. Optional course map, which is a JavaScript map object
   * full of course objects, organized by the course codes as keys.
   * @param courseMap JavaScript Map object. Optional (null can be passed)
   */
  constructor(courseMap) {
    this.studentCatalog = new Map();
    this.instructorCatalog = new Map();
    this.courses = courseMap;
    this.classListData = null;
  }

  //---------------- METHODS ----------------//

  setCourseMap(courseMap) {
    this.courses = courseMap;
  }

  setStudentMap(sMap) {
    this.studentCatalog = sMap;
  }

  setInstructorMap(iMap) {
    this.instructorCatalog = iMap;
  }

  /**
   * Takes a file raw data and reads it. It then parses the
   * file data and stores it inside the object. NOTE: This should be called before
   * doing any work! If raw data isn't provided, it uses the file chooser
   *
   * @param optionalPath Path of ClassList.txt file to read
   */
  async importClassListRawData(data) {
    let fileName, openFileResponse;
    if (!data) {
      openFileResponse = await openFile();
      data = openFileResponse[0];
      fileName = openFileResponse[1];
      document.getElementById("Import-SI-Catalog-Button").innerText = fileName;
    }
    let expectedHeaders = [
      "id_num",
      "yr_cde",
      "trm_cde",
      "crs_cde",
      "lead_instructr_id",
      "crs_enrollment",
    ];

    let filteredData = filterData(data, expectedHeaders);

    this.classListData = filteredData;
    if (filteredData === null) {
      document.getElementById("classListName").textContent = "No file chosen";
    }
    return filterData;
  }

  /**
   * Updates the course objects that were provided in the course map with information
   * from the classList.txt file. It will update the courses with the instructor and the
   * enrollment for the course
   */
  updateCoursesWithClassList() {
    const headerIndexes = findColumns(
      CLASS_LIST_HEADERS,
      this.classListData[0],
    );
    this.classListData.slice(1).forEach((classListEntry) => {
      const courseID = classListEntry[headerIndexes[3]];
      const instructorID = classListEntry[headerIndexes[4]];
      const enrollmentCount = parseInt(classListEntry[headerIndexes[5]]);

      const courseObj = this.courses.get(courseID);
      if (courseObj) {
        courseObj.addClassListInformation(instructorID, enrollmentCount);
      }
    });
  }

  /**
   * Helper method. Used to determine if a given course is already in an array based
   * on the course code alone. Basically like a fancy indexOf()
   *
   * @param array Array to check for course object
   * @param cCode Code to look for in course object
   * @return {number} Index the course was found in array. If -1, then it wasn't found.
   */
  _arrayHasCourseObj(array, cCode) {
    let hasIndex = -1;
    for (let i = 0; i < array.length && hasIndex < 0; i++) {
      const obj = array[i];
      if (obj && obj.courseCode && obj.courseCode === cCode) {
        hasIndex = i;
      }
    }
    return hasIndex;
  }

  /**
   * Helper method. Adds a key (id) to a given map (catalog) if it doesn't exist. Then appends a course object to the value
   * of the key, which is an array of course objects.
   *
   * @param catalog Map to append data to
   * @param id Key of the id
   * @param courseObj The course object to add to the value array
   */
  _addCourseToID(catalog, id, courseObj) {
    let entry = catalog.get(id);
    if (!entry) {
      catalog.set(id, []);
    }
    if (
      courseObj &&
      this._arrayHasCourseObj(catalog.get(id), courseObj.courseCode) < 0
    ) {
      catalog.get(id).push(courseObj);
    }
  }

  /**
   * Adds a course to a given instructor ID, then put the course object into the array inside
   * @param instructorID ID of instructor; string
   * @param courseObj Course object to add to array
   */
  addCourseToInstructorID(instructorID, courseObj) {
    this._addCourseToID(this.instructorCatalog, instructorID, courseObj);
  }

  /**
   * Adds a course to a given student ID, then put the course object into the array inside
   * @param instructorID ID of student; string
   * @param courseObj Course object to add to array
   */
  addCourseToStudentID(studentID, courseObj) {
    let entry = this.studentCatalog.get(studentID);
    if (!entry) {
      const student = new Student(studentID);
      student.addCourse(courseObj);
      this.studentCatalog.set(studentID, student);
    }
    if (
      courseObj &&
      !this.studentCatalog.get(studentID).hasCourse(courseObj.courseCode)
    ) {
      this.studentCatalog.get(studentID).addCourse(courseObj);
    }
    if (
      courseObj &&
      !this.courses.get(courseObj.courseCode).students.includes(studentID)
    ) {
      this.courses.get(courseObj.courseCode).students.push(studentID);
    }
  }

  /**
   * Updates the student and instructor catalogs. This should be executed AFTER the
   * class list has been set to the desired class list and after the course map should
   * be set. If the class list wasn't provided and the courses map wasn't provided,
   * then nothing shall happen.
   */
  refreshCatalogs() {
    if (!this.classListData) {
      return;
    }
    if (!this.courses) {
      return;
    }
    this.studentCatalog.clear();
    this.instructorCatalog.clear();
    const headerIndexes = findColumns(
      CLASS_LIST_HEADERS,
      this.classListData[0],
    );
    this.classListData.slice(1).forEach((classListEntry) => {
      const studentID = classListEntry[headerIndexes[0]];
      const courseID = classListEntry[headerIndexes[3]];
      const instructorID = classListEntry[headerIndexes[4]];
      let courseObj = this.courses.get(courseID);
      const possibleCourses = Array.from(this.courses).filter(([key, value]) =>
        key.startsWith(courseID.slice(0, 10)),
      );
      possibleCourses.forEach((course) => {
        if (course) {
          const sectionString = course[0].substr(10);
          const uniqueSections = sectionString.split("/");
          uniqueSections.forEach((section) => {
            if (uniqueSections.length > 1) {
              if (courseID.includes(section)) {
                courseObj = course[1];
              }
            }
          });
        }
      });
      if (courseObj !== undefined) {
        this.addCourseToStudentID(studentID, courseObj);
        this.addCourseToInstructorID(instructorID, courseObj);
      }
    });
  }

  /**
   * Author: Rose Wakelin
   *
   * Gets all the students in a given class
   * @returns {*}
   */
  getStudentsInClass(courseCode) {
    let students = new Map();
    this.studentCatalog.forEach((student) => {
      if (student.hasCourse(courseCode)) {
        students.set(student.studentID, Array.from(student.courses.values()));
      }
    });
    return students;
  }

  /**
   * Gets all of the student objects in a class.
   * @param courseCode course code to get students from
   * @returns {Map()} Map of student IDs and Objects
   */
  getStudentsObjectsInClass(courseCode) {
    let students = new Map();
    const courseObj = this.courses.get(courseCode);
    courseObj.students.forEach((student) => {
      students.set(student, this.studentCatalog.get(student));
    });
    return students;
  }

  /**
   * Updates all students in given class with new schedule
   * @param {Course} course
   * @param {*} examTime
   * @param {*} examDay
   * @returns
   */
  scheduleStudentsInClass(course, examTime, examDay) {
    course.students.forEach((student) => {
      const studentObj = this.studentCatalog.get(student);
      studentObj.updateCourse(course, examTime, examDay);
    });
  }

  /**
   * Removes all from a given class
   * @param {Course} course
   */
  unscheduleStudentsInClass(course) {
    course.students.forEach((student) => {
      const studentObj = this.studentCatalog.get(student);
      studentObj.removeCourse(course);
    });
  }

  //-------- GETTERS --------//

  getStudentCatalog() {
    return this.studentCatalog;
  }

  getInstructorCatalog() {
    return this.instructorCatalog;
  }

  getClassListRawData() {
    return this.classListData;
  }

  /**
   * Clears out the Maps inside this object
   */
  clear() {
    this.studentCatalog.clear();
    this.instructorCatalog.clear();
  }

  //---------------- INTERNAL METHODS FOR TESTING PURPOSES ----------------//

  /**
   * Prints out the catalog to the console if indicated. Also returns the string of the output
   */
  _debug_printCatalog(catalog, doPrint) {
    let sb = "";
    catalog.forEach((val, key) => {
      sb += key + " " + val.length + "\n";
    });
    if (doPrint) {
      console.log(sb);
    }
    return sb;
  }

  _debug_printStudentCatalog_courseCounts(doPrint) {
    return this._debug_printCatalog(this.studentCatalog, doPrint);
  }

  _debug_printInstructorCatalog_courseCounts(doPrint) {
    return this._debug_printCatalog(this.instructorCatalog, doPrint);
  }
}; //end class StudentInstructorCatalog
