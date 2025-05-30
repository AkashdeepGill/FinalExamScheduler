//---------------- IMPORTS ----------------//

import { EXAM_DAYS } from "../CONSTANTS.js";
import { dayTimeCodeToIndex } from "../Import/FileIO.js";
import {getRoom, scheduleExam} from "../FinalExamScheduler.js";

//----------------- CLASS ----------------//

/**
 * TODO: Document file authors and rest of code file
 *
 * Author(s): <alex>, Kyle Senebouttarath
 *
 * This class is a container for all the information for a given course. A course is defined by
 * it's course code (course ID and section number combined). Courses hold information about
 * when the classes meet, if the course has a forced exam, and the instructor/# students in the course
 */
class Course {
  //---------------- ATTRIBUTES ----------------//
  day = new Array(6);
  startTime = new Array(6);
  endTime = new Array(6);
  roomCode = new Array(6);
  courseCode = undefined;
  yearCode = undefined;
  termCode = undefined;

  isForced = undefined;
  forceDay = undefined;
  forceTime = undefined;
  forceRoom = undefined;

  examDay = undefined;
  examTime = undefined;
  examRoom = undefined;

  teacherID = undefined;
  numOfStudents = undefined;

  hasSpecialCode = false;
  specialCode = undefined;
  crossListedClasses = [];
  sameCommonFinals = [];
  students = [];

  toBeUnscheduled = false;
  priority = null;

  //---------------- METHODS ----------------//

  constructor(courseCode, hasSpecialCode, specialCode, crossListedCourses) {
    this.courseCode = courseCode;
    this.hasSpecialCode = hasSpecialCode;
    if (hasSpecialCode) {
      this.specialCode = specialCode;
      this.crossListedClasses = crossListedCourses;
    }
  }

  /**
   * Author: Kyle Senebouttarath
   *
   * @param isForced boolean of if this course has a forced exam or not
   * @param day Day the course exam should be
   * @param time Time the course exam should be
   * @param room Room the course exam should be in. Can be unspecified (undefined) for any room
   */
  setForceExam(isForced, day, time, room) {
    this.isForced = isForced;
    const [dayIndex, timeIndex] = dayTimeCodeToIndex(day, time);
    this.forceDay = day ? "1" : "0";
    this.forceTime = time ? "1" : "0";
    this.forceRoom = room ? "1" : "0";

    scheduleExam(this, dayIndex, timeIndex, getRoom(room));
  }

  /**
   * Sets the year and term for the course
   *
   * @param yearCode
   * @param termCode
   */
  addCourseScheduleInformation(yearCode, termCode) {
    this.yearCode = yearCode;
    this.termCode = termCode;
  }

  /**
   * Adds a dayTimeRoom object into the course
   *
   * @param dayTimeRoom
   */
  addDayTimeAndRoom(dayTimeRoom) {
    const dayIndex = EXAM_DAYS.indexOf(dayTimeRoom.day);
    this.day[dayIndex] = dayTimeRoom.day;
    this.startTime[dayIndex] = dayTimeRoom.startTime;
    this.endTime[dayIndex] = dayTimeRoom.endTime;
    this.roomCode[dayIndex] = dayTimeRoom.room;
  }

  /**
   * Sets the instructor ID and enrollment count into the course
   *
   * @param teacherID
   * @param numOfStudents
   */
  addClassListInformation(teacherID, numOfStudents) {
    this.teacherID = teacherID;
    this.numOfStudents = numOfStudents;
  }

  /**
   * Returns the course code
   *
   * @return {undefined}
   */
  getCourseCode() {
    return this.courseCode;
  }

  equals(courseObj) {
    if (!courseObj) {
      return false;
    }
    return this.courseCode === courseObj.getCourseCode();
  }

  //---------------- TESTING METHODS ----------------//

  testImport() {
    // console.log(this.courseCode + " " + this.startTime[0]);
    console.log(this);
  }
} //end class Course

export default Course;
