import { createSlice } from "@reduxjs/toolkit";
import { getCommonFinalClasses } from "../../FinalExamScheduler.js";
const initialStates = {
  scheduledCourses: {},
  unscheduledCourses: {},
};

/**
 * Redux slice that stores all of the current conflicts with the generated schedule.
 */
const courseSlice = createSlice({
  name: "courses",
  initialState: initialStates,
  reducers: {
    addCourse: (state, action) => {
      const course = action.payload.courseObj;
      const courseId = action.payload.id;
      if (course.examTime !== undefined) {
        state.scheduledCourses[courseId] = course;
      } else {
        state.unscheduledCourses[courseId] = course;
      }
    },
    updateCourseExamTime: (state, action) => {},

    scheduleCourse: (state, action) => {
      const course = { ...state.unscheduledCourses[action.payload.courseId] };
      course.examDay = action.payload.day;
      course.examTime = action.payload.time;
      course.examRoom = action.payload.room;
      delete state.unscheduledCourses[action.payload.courseId];
      state.scheduledCourses[course.courseCode] = course;
    },

    unscheduleCourse: (state, action) => {
      const course = unscheduleHelper(state, action.payload.courseId);
      if (course.specialCode === "c") {
        const sameCommonClass = getCommonFinalClasses(
          course.courseCode.slice(0, 10),
        );
        sameCommonClass.forEach((c) => {
          if (state.scheduledCourses[c.courseCode]) {
            unscheduleHelper(state, c.courseCode);
          }
        });
      }
      if (
        course.crossListedClasses &&
        course.crossListedClasses.length > 0 &&
        !course.courseCode.includes("/")
      ) {
        course.crossListedClasses.forEach((crosslistedCode) => {
          unscheduleHelper(state, crosslistedCode);
        });
      }
    },
    resetCourseSlice: (state, action) => {
      state = initialStates;
    },
  },
});

const unscheduleHelper = (state, courseCode) => {
  const course = { ...state.scheduledCourses[courseCode] };
  if (course) {
    delete state.scheduledCourses[courseCode];
    course.examDay = undefined;
    course.examTime = undefined;
    course.examRoom = undefined;
    state.unscheduledCourses[courseCode] = course;
    return course;
  }
};

export const {
  addCourse,
  updateCourseExamTime,
  scheduleCourse,
  unscheduleCourse,
  resetCourseSlice,
} = courseSlice.actions;
export default courseSlice.reducer;
