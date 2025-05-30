//---------------- PARSING CONSTANTS ----------------//

export const EXAM_TIMES = [
  ["08:00", "8:00"],
  "11:00",
  "14:00",
  "17:30",
  "20:00",
  "N",
];
export const EXAM_DAYS = ["M", "T", "W", "R", "F", "S"];

export const COURSE_HEADERS = [
  "yr_cde",
  "trm_cde",
  "room_cde",
  "crs_cde",
  "monday_cde", //0-4
  "tuesday_cde",
  "wednesday_cde",
  "thursday_cde",
  "friday_cde",
  "saturday_cde", //5-9
  "sunday_cde",
  "begin_tim",
  "end_tim",
  "exam_room",
  "exam_day", //10-14
  "exam_time",
  "force_time",
]; //15, 16

export const FORCE_TIME_INDEXES = {
  IS_FORCED: 14,
  DAY: 13,
  TIME: 12,
  ROOM: 11,
};

//-------------- MEMENTO CONSTANTS ---------------//
export const TIMES_SHUFFlED = 1;

export const NUM_MEMENTOS_FOR_COMMON_FINALS = 5;
export const NUM_MEMENTOS_FOR_CROSSLISTED_FINALS = 5;
export const NUM_MEMENTOS_FOR_PRIORITY_EXAMS = 5;
