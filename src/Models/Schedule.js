/**
 * Author(s): Alex O, Kyle S.
 */
export class Schedule {
  //-------- FIELDS --------//

  courses = [];
  rooms = [];
  weight = 0;
  weights = [];

  //-------- METHODS --------//

  constructor(courses, rooms, weight, weights) {
    if (courses !== undefined) {
      courses.forEach((value, key) => {
        this.courses.push([key, value]);
      });
    }
    if (rooms !== undefined) {
      rooms.forEach((value, key) => {
        this.rooms.push([key, value]);
      });
    }
    if (weight !== undefined) {
      this.weight = weight;
    }
    if (weights !== undefined) {
      weights.forEach((value, key) => {
        this.weights.push([key, value]);
      });
    }
  }

  toString() {
    return JSON.stringify(this);
  }

  parse(data) {
    let parsed = JSON.parse(data);
    this.courses = parsed.courses;
    for (let i = 0; i < this.courses.length; i++) {
      this.replaceNullCourse(this.courses[i][1]);
    }
    this.rooms = parsed.rooms;
    for (let i = 0; i < this.rooms.length; i++) {
      this.replaceNullRoom(this.rooms[i][1]);
    }
    this.weights = parsed.weights;
    this.weight = parsed.weight;
  }

  getCourses() {
    let courses = new Map();
    this.courses.forEach((course) => {
      this.replaceNullCourse(course[1]);
      courses.set(course[0], course[1]);
    });
    return courses;
  }

  getCourse(key) {
    let c = undefined;
    for (let i = 0; i < this.courses.length && c === undefined; i++) {
      const cData = this.courses[i];
      if (key === cData[0]) {
        c = cData[1];
      }
    }
    return c;
  }

  getRooms() {
    let rooms = new Map();
    this.rooms.forEach((room) => {
      this.replaceNullRoom(room[1]);
      rooms.set(room[0], room[1]);
    });
    return rooms;
  }
  getWeights() {
    let weights = new Map();
    this.weights.forEach((weight) => {
      weights.set(weight[0], weight[1]);
    });
    return weights;
  }

  replaceNullCourse(course) {
    for (let i = 0; i < course.day.length; i++) {
      course.day[i] = course.day[i] === null ? undefined : course.day[i];
    }
    for (let i = 0; i < course.startTime.length; i++) {
      course.startTime[i] =
        course.startTime[i] === null ? undefined : course.startTime[i];
    }
    for (let i = 0; i < course.endTime.length; i++) {
      course.endTime[i] =
        course.endTime[i] === null ? undefined : course.endTime[i];
    }
    for (let i = 0; i < course.roomCode.length; i++) {
      course.roomCode[i] =
        course.roomCode[i] === null ? undefined : course.roomCode[i];
    }
    course.courseCode =
      course.courseCode === null ? undefined : course.courseCode;
    course.yearCode = course.yearCode === null ? undefined : course.yearCode;
    course.termCode = course.termCode === null ? undefined : course.termCode;
    course.isForced = course.isForced === null ? undefined : course.isForced;
    course.forceDay = course.forceDay === null ? undefined : course.forceDay;
    course.forceTime = course.forceTime === null ? undefined : course.forceTime;
    course.forceRoom = course.forceRoom === null ? undefined : course.forceRoom;
    course.examDay = course.examDay === null ? undefined : course.examDay;
    course.examTime = course.examTime === null ? undefined : course.examTime;
    course.examRoom = course.examRoom === null ? undefined : course.examRoom;
    course.teacherID = course.teacherID === null ? undefined : course.teacherID;
    course.numOfStudents =
      course.numOfStudents === null ? undefined : course.numOfStudents;
    course.specialCode =
      course.specialCode === null ? undefined : course.specialCode;
  }

  replaceNullRoom(room) {
    for (let i = 0; i < room.exams.length; i++) {
      for (let x = 0; x < room.exams[i].length; x++) {
        room.exams[i][x] =
          room.exams[i][x] === null ? undefined : room.exams[i][x];
      }
    }
  }

  isEqualTo(schedule) {
    return (
      this.courses.toString() === schedule.courses.toString() &&
      this.rooms.toString() === schedule.rooms.toString() &&
      this.weight === schedule.weight
    );
  }
} //end class Schedule

export default Schedule;
