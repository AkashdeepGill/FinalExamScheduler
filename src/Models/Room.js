//---------------- CONSTANTS ---------------//

import { dayTimeCodeToIndex } from "../Import/FileIO.js";

const DAYS = 5;

//---------------- CLASS ----------------//

/**
 *
 * Author(s):
 *
 * This class is a container that tracks what hours during exam week a room is being used by a
 * final exam. The room also tracks it's number, capacity, and any dependencies it may have
 * from the imported rooms file.
 */
class Room {
  //---------------- ATTRIBUTES ----------------//

  roomNumber = "";
  capacity = 0;
  exams = new Array(DAYS); //6 rows are days, 5 columns are times
  isADependent = false;
  hasADependent = false;
  dependencies = [];
  usable = true;

  //---------------- METHODS ----------------//

  constructor(roomNumber, capacity) {
    this.roomNumber = roomNumber;
    this.capacity = parseInt(capacity);
    for (let i = 0; i < DAYS; i++) {
      // 6 num of days
      this.exams[i] = new Array(5); // 5 num of times
    }
  }

  /**
   * Marks this room as a dependency.
   * @param dep1 String room number first dependency
   * @param dep2 String room number second dependency
   */
  addDependencies(dep1, dep2) {
    this.isADependent = true;
    this.dependencies[0] = dep1;
    this.dependencies[1] = dep2;
  }

  /**
   * Adds a single dependency to slot 0 and indicates that
   * it has a dependency
   * @param dep
   */
  addDependent(dep) {
    this.hasADependent = true;
    this.dependencies[0] = dep;
  }

  /**
   * Returns item from 2d array using the day and time code as indexes
   *
   * @param dayCode ('M', 'T', 'W', 'R', 'F', 'S')
   * @param timeCode ("08:00" or "8:00", "11:00", "14:00", "17:30", "20:00", "N")
   * @return {undefined|*}
   */
  getExamAtDayTimeCode(dayCode, timeCode) {
    const [day, time] = dayTimeCodeToIndex(dayCode, timeCode);
    if (isNaN(day) || isNaN(time)) {
      return undefined;
    }

    return this.exams[day][time];
  }

  /**
   * Clear the exams object
   */
  clearExams() {
    for (let i = 0; i < DAYS; i++) {
      // 6 num of days
      this.exams[i] = new Array(6); // 6 num of times
    }
  }
} //end class Room

export default Room;
