import { EXAM_TIMES, EXAM_DAYS } from "../CONSTANTS.js";

/**
 * Author: Chris Taylor
 * Pulled from STAT tool implementation
 */
export const parseLines = (data, separator) =>
  data
    .trim() // Trim the data to fix any preceding or trailing white space
    .split(/\r?\n/g) // Each course history entry is on its own line
    .map((line) => line.trim()) // Trim the line to prevent extra entries
    .filter((line) => line.length > 0 && line.charAt(0) !== "#") // Ignore lines that start with # - comment
    .map((line) => line.split(separator).map((entry) => entry.trim())); // Lines are delimited by comma

/**
 * Author: Alex Ottelein
 *
 * @param headers
 * @param headerLine
 * @return {*[]}
 */
export const findColumns = (headers, headerLine) => {
  let headerIndex = [];
  for (let i = 0; i < headers.length; i++) {
    headerIndex[i] = headerLine.indexOf(headers[i]);
  }
  return headerIndex;
};

/**
 * Helper method for reading in file text.
 * Deprecated: Cannot use FS in React project!
 * @param path
 * @returns {*}
 * @author Chandler Frakes
 */
/*
export const quickReadFile = (path) => {
    const data = fs.readFileSync(path, { encoding: 'utf8' });
    return parseLines(data, '\t');
}
 */

/**
 * Converts a day code to its equivalent array index (for exams 2d array)
 * @param dayCode ('M' -> 0, 'T' -> 1, 'W' -> 2, 'R' -> 3, 'F' -> 4, 'S' -> 5)
 * @return undefined if no matching index
 */
export const dayCodeToIndex = (dayCode) => {
  if (!dayCode) {
    return undefined;
  }
  dayCode = dayCode.toUpperCase();
  const day = EXAM_DAYS.indexOf(dayCode);
  if (day < 0) {
    return undefined;
  }
  return day;
};

/**
 * Converts a time code to its equivalent array index (for exams 2d array)
 * @param dayCode ("08:00", "8:00" -> 0, "11:00" -> 1, "14:00" -> 2, "17:30" -> 3, "20:00" - 4, "N" -> 5)
 */
export const timeCodeToIndex = (timeCode) => {
  let time = -1;
  for (let index = 0; index < EXAM_TIMES.length && time < 0; index++) {
    const el = EXAM_TIMES[index];
    if (el instanceof Array && el.includes(timeCode)) {
      time = index;
    } else if (
      (typeof el === "string" || el instanceof String) &&
      el === timeCode
    ) {
      time = index;
    }
  }
  if (time < 0) {
    return undefined;
  }
  return time;
};

/**
 * Converts a day code and time code to their equivalent array index.
 */
export const dayTimeCodeToIndex = (dayCode, timeCode) => {
  return [dayCodeToIndex(dayCode), timeCodeToIndex(timeCode)];
};

/**
 * Converts an index number to it's correct output from the exam times 2d array
 * @param index
 * @return {string}
 */
export const indexToTime = (index) => {
  switch (index) {
    case 0:
      return "8:00 AM - 10:00 AM";
    case 1:
      return "11:00 AM - 1:00 PM";
    case 2:
      return "2:00 PM - 4:00 PM";
    case 3:
      return "5:30 PM - 7:30 PM";
    case 4:
      return "8:00 PM - 10:00 PM";
    default:
      return "Undefined Time";
  }
};

export const indexToMilitaryTime = (index) => {
  switch (index) {
    case 0:
      return "8:00";
    case 1:
      return "11:00";
    case 2:
      return "14:00";
    case 3:
      return "17:30";
    case 4:
      return "20:00";
    default:
      return "Undefined Time";
  }
};

/**
 * Converts an index number to it's correct output from the exam day 2d array
 * @param index
 * @return {string}
 */
export const indexToDay = (index) => {
  switch (index) {
    case 0:
      return "Monday";
    case 1:
      return "Tuesday";
    case 2:
      return "Wednesday";
    case 3:
      return "Thursday";
    case 4:
      return "Friday";
    case 5:
      return "Saturday";
    default:
      return "Undefined Day";
  }
};

/**
 * @author Alex O
 *
 * [DEPRECIATED]
 * File chooser, returns raw data of file
 */
export const openFile = async () => {
  try {
    const [handle] = await window.showOpenFilePicker(); //Always returns an array of files
    console.log("here");
    const fullFileData = await handle.getFile();
    const fileContents = await fullFileData.text();

    return [fileContents, fullFileData.name];
  } catch (err) {
    console.warn("Canceled import:", err.name, err.message);
    return undefined;
  }
};

/**
 * @author Alex O
 *
 * @param path Get file data without chooser
 * @return {Promise<*>}
 */
export const preloadedFile = async (rawImportData) => {
  let data;

  await fetch(rawImportData)
    .then((file) => file.text())
    .then((text) => {
      data = text;
    });

  return data;
};

/**
 * @author Kyle S, Alex O
 *
 * Function used to get file data. If a path isn't specified,
 * it will default to the file choose
 * @param optionalPath
 * @return {*}
 */
export const getFileData = async (rawImport) => {
  let data;
  if (!rawImport) {
    data = await openFile()[0];
  } else {
    data = await preloadedFile(rawImport);
  }
  return data;
};
