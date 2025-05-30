/**
 * This class is a container that holds data related to a student.
 * It provides methods to add, remove, and query courses that the student is enrolled in.
 */
export class Student {
  /**
   * Create a student with a student ID
   * @param {*} studentID
   */
  constructor(studentID) {
    this.studentID = studentID;
    this.courseGrid = [[]];
    for (let i = 0; i < 5; i++) {
      this.courseGrid[i] = new Array(5).fill().map(() => []);
    }
    this.courses = new Map();
    this.doubleBooked = new Map();
  }
  /**
   * Add a course to enroll the student in.
   * @param {Course} course Course Object to the student
   */
  addCourse(course) {
    if (course === undefined) {
      console.warn("undefined course is not being added");
    }
    this.courses.set(course.courseCode, {...course});
    if (course.examDay !== undefined && course.examTime !== undefined) {
      if (this.courseGrid[course.examDay][course.examTime].length > 0) {
        const index = this.courseGrid[course.examDay][course.examTime].indexOf(
          course.courseCode,
        );
        if (index === -1) {
          this.courseGrid[course.examDay][course.examTime].forEach(
            (otherClass) => {
              const doubleBooking = [otherClass, course.courseCode].sort();
              this.doubleBooked.set(
                JSON.stringify(doubleBooking),
                doubleBooking,
              );
            },
          );
        } else {
          return;
        }
      }
      this.courseGrid[course.examDay][course.examTime].push(course.courseCode);
    }
  }
  /**
   * Update a course with a new exam date and time.
   * @param {Course} course Course Object to update
   * @param {*} time Exam time
   * @param {*} day Exam Day
   */
  updateCourse(course) {
    if(this.courses.has(course.courseCode)){
      this.removeCourse(this.courses.get(course.courseCode));
    }
    this.addCourse(course);
  }

  /**
   * Get the courses that the student has at given time.
   * @param {*} day Exam day
   * @param {*} time Exam time
   * @returns {allCourses[]}
   */
  getCourseOnDayTime(day, time) {
    return this.courseGrid[day][time];
  }

  /**
   * Get the double booked exams for this student
   * @returns {conflicts[][]}
   */
  getDoubleBooked() {
    return Array.from(this.doubleBooked.values());
  }

  /**
   * Remove a course from a students schedule
   * @param {Course} course
   */
  removeCourse(course) {
    if (course.examDay !== undefined && course.examTime !== undefined) {
      const examDay = this.courseGrid[course.examDay];
      const examTimeCourses = examDay ? examDay[course.examTime] : undefined;
      if (examTimeCourses) {
        const index = examTimeCourses.indexOf(course.courseCode);
        if (examTimeCourses.length > 1) {
          examTimeCourses.forEach(code => {
            const key = JSON.stringify([course.courseCode, code].sort());
            this.doubleBooked.delete(key);
          });
        }
        this.courseGrid = {
          ...this.courseGrid,
          [course.examDay]: {
            ...examDay,
            [course.examTime]: [
              ...examTimeCourses.slice(0, index),
              ...examTimeCourses.slice(index + 1),
            ],
          },
        };
      }
    }
    this.courses.delete(course.courseCode);
  }

  /**
   * Checks if student has given course
   * @param {*} courseCode course code to check
   * @returns {Boolean}
   */
  hasCourse(courseCode) {
    return this.courses.has(courseCode);
  }

  /**
   * Get courses student has on given day
   * @param {*} day
   * @returns allCourses[]
   */
  coursesOnDay(day) {
    if (day !== undefined) {
      const courseMap = this.courseGrid[day];
      const courseArrays = Object.values(courseMap);
      const tempCourses = [];
      courseArrays.forEach((courseArray) => {
        courseArray.forEach((course) => {
          tempCourses.push(course);
        });
      });
      return tempCourses;
    }
  }
}
