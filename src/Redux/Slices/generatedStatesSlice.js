import { createSlice } from "@reduxjs/toolkit";
const initialStates = {
  noAvailableTime: {
    fullName: "No Available Time",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("noAvailableTime")
      ? parseInt(localStorage.getItem("noAvailableTime"))
      : -1,
  },
  roomDoubleBooked: {
    fullName: "Room Time Double Booked",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("roomDoubleBooked")
      ? parseInt(localStorage.getItem("roomDoubleBooked"))
      : -1,
  },
  roomTooSmall: {
    fullName: "Room Too Small",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("roomTooSmall")
      ? parseInt(localStorage.getItem("roomTooSmall"))
      : 30,
  },
  instructorDoubleBooked: {
    // Done
    fullName: "Instructor Double Booked",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("instructorDoubleBooked")
      ? parseInt(localStorage.getItem("instructorDoubleBooked"))
      : 30,
  },
  studentDoubleBooked: {
    // Done
    fullName: "Student Double Booked",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("studentDoubleBooked")
      ? parseInt(localStorage.getItem("studentDoubleBooked"))
      : 3,
  },
  sameDayPriorityExams: {
    fullName: "Student has 2 priority Exams Same Day",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("sameDayPriorityExams")
      ? parseInt(localStorage.getItem("sameDayPriorityExams"))
      : 40,
  },
  threeSameDayExams: {
    // Done
    fullName: "Student has 3 exams Same Day",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("threeSameDayExams")
      ? parseInt(localStorage.getItem("threeSameDayExams"))
      : 3,
  },
  lateCommonFinal: {
    // Done
    fullName: "Common Final at 5:30",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("lateCommonFinal")
      ? parseInt(localStorage.getItem("lateCommonFinal"))
      : 10,
  },
  nonCommonFinal: {
    fullName: "Common Final at Non-Common Time",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("nonCommonFinal")
      ? parseInt(localStorage.getItem("nonCommonFinal"))
      : 40,
  },
  fridayCommonFinal: {
    // Done
    fullName: "Common Final on Friday",
    instances: [],
    courses: [],
    penalty: localStorage.getItem("fridayCommonFinal")
      ? parseInt(localStorage.getItem("fridayCommonFinal"))
      : 10,
  },
};

/**
 * Redux slice that stores all of the current conflicts with the generated schedule.
 */
const generatedStatesSlice = createSlice({
  name: "generatedWeights",
  initialState: initialStates,
  reducers: {
    /**
     * Add a conflict to the generated scedule.
     */
    addWeightedInstance: (state, action) => {
      const uniqueId = uid(); // Generate a unique ID
      const resolved = false; // Initial resolved value
      state[action.payload.title].instances.push(action.payload.instance);
      action.payload.courses.forEach((code) => {
        if (!state[action.payload.title].courses.includes(code)) {
          state[action.payload.title].courses.push(code);
        }
      });
    },
    updateWeightPenalty: (state, action) => {
      localStorage.setItem(action.payload.title, `${action.payload.value}`);
      state[action.payload.title].penalty = parseInt(`${action.payload.value}`);
    },
    resetGeneratedStates: (state) => {
      // Reset each property to its initial state
      for (const propertyName in state) {
        state[propertyName].instances = [];
        state[propertyName].courses = [];
        state[propertyName].penalty = initialStates[propertyName].penalty;
      }
    },
    /**
     * Remove a course from the schedule. The reducer will remove conflicts that include the given course code.
     */
    removeWeightedInstance: (state, action) => {
      const code = action.payload.course;
      for (const propertyName in state) {
        let property = state[propertyName];
        let propertyCourses = property.courses;
        let i = propertyCourses.indexOf(code);
        if (i > -1) {
          property.courses.splice(i, 1);
          property.instances = property.instances.filter((instance) => {
            for (const instanceProp in instance) {
              if (instance[instanceProp] === code) {
                return false;
              }
            }
            return true;
          });
        }
      }
    },
  },
});
export const {
  addWeightedInstance,
  removeWeightedInstance,
  updateWeightPenalty,
  resetGeneratedStates,
} = generatedStatesSlice.actions;
export default generatedStatesSlice.reducer;

const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
