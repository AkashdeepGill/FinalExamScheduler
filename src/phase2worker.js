/**
 * Author(s): Alex O, Kyle S, Ian C
 */
let allCourses = new Map();
let allRooms, weights, allStudents;
let studentExams;
let profExams;
let originalStudentExams;
let originalProfExams;


/**
 * Author: Kyle Senebouttarath
 * Last Update: 1/20/23
 *
 * This class is a custom data structure is responsible for parsing the class list files
 * and organizing the student IDs and instructor IDs into maps. These maps then contain
 * arrays that indicate what courses these students and instructors are involved in.
 */

//---------------- IMPORTS ----------------//



//---------------- CONSTANTS ----------------//

const CLASS_LIST_HEADERS = ['id_num', 'yr_cde', 'trm_cde', 'crs_cde', 'lead_instructr_id', 'crs_enrollment'];

//---------------- CLASS ----------------//

const StudentInstructorCatalog = class {

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
        this.studentCatalog = sMap
    }

    setInstructorMap(iMap) {
        this.instructorCatalog = iMap
    }

    /**
     * Updates the student and instructor catalogs. This should be executed AFTER the
     * class list has been set to the desired class list and after the course map should
     * be set. If the class list wasn't provided and the courses map wasn't provided,
     * then nothing shall happen.
     */
    refreshCatalogs() {
        if (!this.classListData) { return; }
        if (!this.courses) { return; }
        this.studentCatalog.clear();
        this.instructorCatalog.clear();
        const headerIndexes = this.findColumns(CLASS_LIST_HEADERS, this.classListData[0]);
        this.classListData.slice(1).forEach(classListEntry => {
            const studentID = classListEntry[headerIndexes[0]];
            const courseID = classListEntry[headerIndexes[3]];
            const instructorID = classListEntry[headerIndexes[4]];
            let courseObj = this.courses.get(courseID);
            const possibleCourses = Array.from(this.courses).filter(([key, value]) => key.startsWith(courseID.substr(0, 10)));
            possibleCourses.forEach(course => {
                if(course){
                    const sectionString = course[0].substr(10);
                    const uniqueSections = sectionString.split("/");
                    uniqueSections.forEach(section => {
                        if(uniqueSections.length > 1){
                            if(courseID.includes(section)){
                                courseObj = course[1];
                            }
                        }
                    });
                }
            });
            if (courseObj !== undefined){
                this.addCourseToStudentID(studentID, courseObj);
                this.addCourseToInstructorID(instructorID, courseObj);
            }
        });
    }

    /**
     * Author: Alex Ottelein
     */
    findColumns(headers, headerLine) {
        let headerIndex = [];
        for (let i = 0; i < headers.length; i++) {
            headerIndex[i] = headerLine.indexOf(headers[i]);
        }
        return headerIndex;
    }

    /**
     * Author: Rose Wakelin
     *
     * Gets all the students in a given class
     * @returns {*}
     */
    getStudentsInClass(courseCode) {
        let students = new Map();
        for (let [id, courses] of this.studentCatalog) {
            let inClass = false;
            for (let course of courses) {
                if (course.courseCode === courseCode) { inClass = true };
            }
            if (inClass) { students.set(id, courses) };
        }
        return students;
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
        if (courseObj && this._arrayHasCourseObj(catalog.get(id), courseObj.courseCode) < 0) {
            catalog.get(id).push(courseObj);
        }
    }

     /**
     * Adds a course to a given student ID, then put the course object into the array inside
     * @param instructorID ID of student; string
     * @param courseObj Course object to add to array
     */
     addCourseToStudentID(studentID, courseObj) {
        this._addCourseToID(this.studentCatalog, studentID, courseObj);
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
     * Adds a course to a given instructor ID, then put the course object into the array inside
     * @param instructorID ID of instructor; string
     * @param courseObj Course object to add to array
     */
    addCourseToInstructorID(instructorID, courseObj) {
        this._addCourseToID(this.instructorCatalog, instructorID, courseObj);
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
            sb += (key + " " + val.length + "\n")
        })
        if (doPrint) { console.log(sb); }
        return sb;
    }

    _debug_printStudentCatalog_courseCounts(doPrint) {
        return this._debug_printCatalog(this.studentCatalog, doPrint);
    }

    _debug_printInstructorCatalog_courseCounts(doPrint) {
        return this._debug_printCatalog(this.instructorCatalog, doPrint);
    }

}   //end class StudentInstructorCatalog



//-------- CONSTANTS --------//

const VERSION_START = 1;    //to start counting memento versions
const TIMES_SHUFFlED = 1;
const NUM_EXAM_TIMES = 5;
const NUM_EXAM_DAYS = 5;

//-------- CLASS --------//

class CareTaker {

    //-------- FIELDS --------//

    versions = [];

    //-------- METHODS --------//

    placeVersion(memento) {
        this.versions.push(memento)
    }

    getVersion(version) {
        return this.versions[version]
    }

    getLowestWeightVersion() {
        let myWeights = [];
        let versions1 = [];

        for(let i = VERSION_START; i < this.versions.length; i++) {
            versions1.push(JSON.parse(this.versions[i]));
            myWeights.push(versions1[i-1].weight);
        }

        const minWeight = Math.min(...myWeights);

        const num = versions1.findIndex(version => version.weight === minWeight);
        return this.versions[num+1];
    }

    getVersions() {
        return this.versions;
    }
    copy() {
        const ct = new CareTaker();
        ct.versions = [...this.versions];
        return ct;
    }

    clear() {
        this.versions = [];
    }
}   //end cass CareTaker

/**
 * Author(s): Alex O, Kyle S.
 */
class Schedule {

    //-------- FIELDS --------//

    courses = [];
    rooms = [];
    weight = 0;
    weights = []

    //-------- METHODS --------//

    constructor(courses, rooms, weight, weights) {
        if (courses !== undefined) {
            courses.forEach((value, key) => {this.courses.push([key, value])})
        }
        if (allRooms !== undefined) {
            rooms.forEach((value, key) => {this.rooms.push([key, value])})
        }
        if (weight !== undefined) {
            this.weight = weight;
        }
        if (weights !== undefined) {
            weights.forEach((value, key) => {this.weights.push([key, value])})
        }
    }

    toString() {
        return JSON.stringify(this);
    }

    parse(data) {
        let parsed = JSON.parse(data);
        this.courses = parsed.courses;
        for (let i = 0; i < this.courses.length; i++){
            this.replaceNullCourse(this.courses[i][1]);
        }
        this.rooms = parsed.rooms;
        for (let i = 0; i < this.rooms.length; i++){
            this.replaceNullRoom(this.rooms[i][1]);
        }
        this.weights = parsed.weights;
        this.weight = parsed.weight;
    }

    getCourses() {
        let courses2 = new Map();
        this.courses.forEach((course) => {
            this.replaceNullCourse(course[1])
            courses2.set(course[0], course[1])
        })
        return courses2;
    }
    getRooms() {
        let rooms2 = new Map();
        this.rooms.forEach((room) => {
            this.replaceNullRoom(room[1]);
            rooms2.set(room[0], room[1]);
        })
        return rooms2;
    }
    getWeights() {
        let weights2 = new Map();
        this.weights.forEach((weight) => {
            weights2.set(weight[0], weight[1]);
        })
        return weights2;
    }

    replaceNullCourse(course) {
        for (let i = 0; i < course.day.length; i++) {
            course.day[i] = (course.day[i] === null ? undefined : course.day[i]);
        }
        for (let i = 0; i < course.startTime.length; i++) {
            course.startTime[i] = (course.startTime[i] === null ? undefined : course.startTime[i]);
        }
        for (let i = 0; i < course.endTime.length; i++) {
            course.endTime[i] = (course.endTime[i] === null ? undefined : course.endTime[i]);
        }
        for (let i = 0; i < course.roomCode.length; i++) {
            course.roomCode[i] = (course.roomCode[i] === null ? undefined : course.roomCode[i]);
        }
        course.courseCode = (course.courseCode === null ? undefined : course.courseCode);
        course.yearCode = (course.yearCode === null ? undefined : course.yearCode);
        course.termCode = (course.termCode === null ? undefined : course.termCode);
        course.isForced = (course.isForced === null ? undefined : course.isForced);
        course.forceDay = (course.forceDay === null ? undefined : course.forceDay);
        course.forceTime = (course.forceTime === null ? undefined : course.forceTime);
        course.forceRoom = (course.forceRoom === null ? undefined : course.forceRoom);
        course.examDay = (course.examDay === null ? undefined : course.examDay);
        course.examTime = (course.examTime === null ? undefined : course.examTime);
        course.examRoom = (course.examRoom === null ? undefined : course.examRoom);
        course.teacherID = (course.teacherID === null ? undefined : course.teacherID);
        course.numOfStudents = (course.numOfStudents === null ? undefined : course.numOfStudents);
        course.specialCode = (course.specialCode === null ? undefined : course.specialCode);
    }

    replaceNullRoom(room) {
        for(let i = 0; i < room.exams.length; i++){
            for(let x = 0; x < room.exams[i].length; x++){
                room.exams[i][x] = (room.exams[i][x] === null ? undefined : room.exams[i][x]);
            }
        }
    }
}

const shuffleArray = (array) => {
    return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
}

const hasCommonFinal = (cObj) => (cObj && cObj.hasSpecialCode && (cObj.specialCode === "c" || cObj.specialCode === "common"));

const scheduleExamInRoomOnly = (course, room, day, time) => {
    if (room.isADependent) {
        room.exams[day][time] = course.courseCode;
        allRooms.get(room.dependencies[0]).exams[day][time] = course.courseCode;
        allRooms.get(room.dependencies[1]).exams[day][time] = course.courseCode;
    } else if (room.hasADependent) {
        room.exams[day][time] = course.courseCode;
        allRooms.get(room.dependencies[0]).exams[day][time] = course.courseCode;
    } else {
        room.exams[day][time] = course.courseCode;
    }
}

const getCourses = () => {
    return allCourses;
}

const getPriorityClassesOnGivenDay = (dayIndex) => {
    const courses = []
    getCourses().forEach(c => {
        if (isPriorityExam(c) && c.examDay === dayIndex) {
            courses.push(c)
        }
    })
    return courses
}


const isPriorityExam = (cObj) => (cObj.priority === 1);

const getIntersectingStudentsInCourses = (course1, course2) => {
    const studentsInCourse1 = []
    const studentsInCourse2 = []

    SI_Catalog.studentCatalog.forEach((thisStudentsCourses, studentId) => {
        thisStudentsCourses.forEach(c => {
            if (course1.courseCode === c.courseCode) {
                studentsInCourse1.push(studentId)
            } else if (course2.courseCode === c.courseCode) {
                studentsInCourse2.push(studentId)
            }
        })
    })

    return studentsInCourse1.filter(value => studentsInCourse2.includes(value));
}

const setKeyValue = (map, key) => {
    if (!map.has(key)) {
        map.set(key, 0)
    }
    map.set(key, map.get(key) + 1)
}

const weightExamRoomTime = (examDay, examTime, room, clas) => {
    let weight = 0;
    let weightTypes = new Map()

    if (room.exams[examDay][examTime] !== undefined) {
        weight += Number.MAX_VALUE
    }

    if (clas.numOfStudents > room.capacity) {
        weight += weights.get("Room Too Small")[0];
        // weights.get("Room Too Small")[2].push(clas.courseCode)
        setKeyValue(weightTypes, "Room Too Small")
    }

    if (hasCommonFinal(clas)) {
        if (examTime === 3) { // exam at 5:30
            weight += weights.get("Common Final at 5:30")[0];
            // weights.get("Common Final at 5:30")[2].push(clas.courseCode)
            setKeyValue(weightTypes, "Common Final at 5:30")
        }
        if (examDay === 4) { // exam on Friday
            weight += weights.get("Common Final on Friday")[0]
            // weights.get("Common Final on Friday")[2].push(clas.courseCode)
            setKeyValue(weightTypes, "Common Final on Friday")
        }

        if (examTime !== 1 && examTime !== 3) {
            weight += weights.get("Common Final at Non-Common Time")[0];
            setKeyValue(weightTypes, "Common Final at Non-Common Time");
        }
    }

    const instructor = SI_Catalog.getInstructorCatalog().get(clas.teacherID);

    for (let course of instructor) {
        if (course.examDay === examDay && course.examTime === examTime) {
            weight += weights.get("Instructor Double Booked")[0];
            // weights.get("Instructor Double Booked")[2].push(clas.courseCode)
            setKeyValue(weightTypes, "Instructor Double Booked")
        }
    }

    if (isPriorityExam(clas)) {
        getPriorityClassesOnGivenDay(examDay).forEach(c => {
            const affectedStudents = getIntersectingStudentsInCourses(clas, c).length
            weight += weights.get("Student has 2 priority Exams Same Day")[0] * affectedStudents
            // weights.get("Student has 2 priority Exams Same Day")[2].push(clas.courseCode)
            setKeyValue(weightTypes, "Student has 2 priority Exams Same Day")
        })
    }

    let courses = [clas.courseCode];
    if (clas.courseCode === "crossClass") { courses = clas.crossListedClasses };

    for (let courseCode of courses) {
        const students = SI_Catalog.getStudentsInClass(courseCode);
        for (let [id, courses] of students) {
            let oneSameDay = false;
            for (let course of courses) {
                if (course.examDay === examDay) {
                    if (course.examTime === examTime) {
                        weight += weights.get("Student Double Booked")[0];
                        // weights.get("Student Double Booked")[2].push(course.courseCode)
                        setKeyValue(weightTypes, "Student Double Booked")
                    }
                    if (!oneSameDay) {
                        oneSameDay = true;
                    } else {
                        weight += weights.get("Student has 3 Exams Same Day")[0]
                        // weights.get("Student has 3 Exams Same Day")[2].push(course.courseCode)
                        setKeyValue(weightTypes, "Student has 3 Exams Same Day")
                    }
                }
            }
        }
    }
    return [weight, weightTypes];
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
            if (rCode.match(/[a-zA-Z]+/g)[0] === lowestRoom.roomNumber.match(/[a-zA-Z]+/g)[0]) {
                match = true;
            }
        }
    });
    return match;
}

const runCostFunction = (course, rooms) => {
    let lowestCost = undefined;
    let lowestRoom = undefined;
    let lowestTime = undefined;
    let weightType = undefined;
    rooms = Array.from(rooms.values()).filter(room => room.usable)
    let loopStartTime = 0;
    let loopEndTime = 3;

    // If night class, only look at night class times
    let classStartTime = course.startTime.find(e => e !== undefined);
    if (classStartTime !== undefined) {
        let startTimeString = classStartTime.substring(classStartTime.length - 5, classStartTime.length).trim();
        let classTime = new Date();
        let comparisonTime = new Date();
        classTime.setHours(parseInt(startTimeString.split(":")[0]), parseInt(startTimeString.split(":")[1]));
        comparisonTime.setHours(16, 1);
        if (classTime >= comparisonTime) {
            loopStartTime = 3;
            loopEndTime = 5
        }
    }

    rooms.forEach((room) => {
        // for each day
        // Phase 2 should only schedule Mon-Thur
        for (let i = 0; i < 4; i++) {
            // for each time
            // Phase 2 should only schedule normal classes at 8am, 11am, and 2pm
            // and night classes at 5:30pm or 8pm
            for (let x = loopStartTime; x < loopEndTime; x++) {
                if (room.exams[i][x] === undefined) {
                    let weightData = weightExamRoomTime(i, x, room, course);
                    let cost = weightData[0];
                    if (lowestCost === undefined || cost < lowestCost) {
                        lowestCost = cost;
                        weightType = weightData[1];
                        lowestRoom = room;
                        lowestTime = [i, x]
                    } else if (cost === lowestCost) {
                        if ((room.capacity <= lowestRoom.capacity
                            || course.roomCode.includes(room.roomNumber)
                            || getBuildingCode(course, room))
                            && [i, x] <= lowestTime) {
                            lowestCost = cost;
                            weightType = weightData[1];
                            lowestRoom = room;
                            lowestTime = [i, x]
                        }
                    }
                }
            }
        }
    });
    return [lowestCost, lowestRoom, lowestTime, weightType];
}

const scheduleExam = (courseObj, day, time, roomObj) => {
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

let SI_Catalog = new StudentInstructorCatalog();
const phase2 = (updateCallback) => {
    const careTaker = new CareTaker();
    careTaker.clear()
    let schedule = new Schedule(allCourses, allRooms, 0, weights)
    careTaker.placeVersion(schedule.toString())
    for (let i = 0; i < TIMES_SHUFFlED; i++) {
        schedule.parse(careTaker.getVersion(0))
        allCourses = schedule.getCourses()
        weights = schedule.getWeights()
        allRooms = schedule.getRooms()
        let courseOrder = shuffleArray(Array.from(allCourses.keys()))
        courseOrder.forEach((courseCode, courseIndex) => {
            let course = allCourses.get(courseCode)
            if (course.examTime === undefined) {
                let students = course.numOfStudents
                for (let i = 0; i < course.crossListedClasses.length; i++) {
                    if (allCourses.get(course.crossListedClasses[i])) {
                        students += allCourses.get(course.crossListedClasses[i]).numOfStudents
                    }
                }
                let capRooms = [];
                allRooms.forEach((room) => {
                    if (room.capacity >= students) {
                        capRooms.push(room)
                    }
                })
                let values = runCostFunction(course, capRooms)
                if (values[0] !== undefined) {
                    schedule.weight += values[0]
                    if (values[3] !== undefined) {
                        values[3].forEach((weight, weightType) => {
                            weights.get(weightType)[1] += weight
                            weights.get(weightType)[2].push(course.courseCode)
                        })
                    }
                    scheduleExam(course, values[2][0], values[2][1], allRooms.get(values[1].roomNumber))
                    for (let i = 0; i < course.crossListedClasses.length; i++) {
                        if (allCourses.get(course.crossListedClasses[i])) {
                            allCourses.get(course.crossListedClasses[i]).examRoom = course.examRoom
                            allCourses.get(course.crossListedClasses[i]).examDay = course.examDay
                            allCourses.get(course.crossListedClasses[i]).examTime = course.examTime
                        }
                    }
                    SI_Catalog.setCourseMap(allCourses)
                    SI_Catalog.refreshCatalogs()
                }
            }
            const max = TIMES_SHUFFlED * courseOrder.length;
            const progress = i * courseOrder.length + courseIndex;
            self.postMessage({ type: 'progress', data: (progress / max) * 100 });

        })
        careTaker.placeVersion(schedule.toString())
    }
    allCourses = schedule.getCourses()
    allRooms = schedule.getRooms()
    return schedule;
}

self.onmessage = (e) => {
    const { type, data } = e.data;

    if (type === 'start') {
        console.log('worker starting');
        allCourses = data.courses;
        allRooms = data.rooms;
        weights = data.weights;
        SI_Catalog.courses = data.SI_Catalog.courses;
        SI_Catalog.classListData = data.SI_Catalog.classListData;
        SI_Catalog.refreshCatalogs();
        const generatedSchedule = phase2();
        const retData = {
            courses: generatedSchedule.getCourses(),
            rooms: generatedSchedule.getRooms(),
            weights: generatedSchedule.getWeights(),
            schedule: generatedSchedule
        }
        console.log('worker complete');
        // Send the schedule back as a response using a Promise
        self.postMessage({ type: 'schedule', data: retData });
    }
};
