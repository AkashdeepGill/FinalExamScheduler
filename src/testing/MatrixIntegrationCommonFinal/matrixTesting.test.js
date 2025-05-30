
import {
    importAllOnTestStart,
    generateSchedule, getCourse, getCourses, getCourseNoWsUnmerged
} from "../../FinalExamScheduler.js";
import {waitFor} from '@testing-library/react';
import fs from "fs";
import store from "../../Redux/Slices/store.js";
import 'jsdom-worker';
import {addCourse} from "../../Redux/Slices/courseSlice.js";

const testCases = ["CAE 2411 111", "CAE 2411 121", "CAE 2411 131", "CAE 2411 141", "CAE 2511 121", "CAE 2511 131", "CAE 2511 141", "CAE 2511 151", "SWE 2511 111", "SWE 2410 111", "SWE 2410 121" , "SWE 2410 131", "SWE 2410 141" ,"CSC 3210 001", "CSC 3210 002", "CSC 1110 121", "CSC 1110 141", "CSC 1110 151", "CSC 1110 161","CSC 1110 171", "CSC 4911 121", "CSC 2611 121", "CSC 2611 131", "CSC 2611 141", "CSC 2611 151", "CSC 2621 121", "CSC 2621 121", "CSC 2621 131", "CSC 4911 111", "BME 3210 111", "BME 3210 112", "SWE 4211 111", "SWE 4211 121", "CSC 1120 111", "SWE 2511 121", "CSC 2611 111", "CSC 3320 111", "CSC 3320 121", "SWE 2710 111", "SWE 2710 121", "SWE 3411 111", "SWE 3411 121", "CSC 1110 111", "CSC 1110 231", "CSC 1110 241", "CSC 1110 251", "CSC 1120 121", "CSC 1110 211", "ELE 1000 121", "ELE 1000 131", "ELE 4980T 111", "BME 4710 111", "BME 3710 111", "ELE 1000 111", "BME 3710 121", "BME 4710 121"];

const testImport_Act = async (worker) => {

    const e = {encoding: 'utf8', flag: 'r'};

    //-- Arrange
    await importAllOnTestStart(
        fs.readFileSync(`src/testing/MatrixIntegrationCommonFinal/TestFiles/courseSchedule.txt`, e),
        fs.readFileSync(`src/testing/MatrixIntegrationCommonFinal/TestFiles/classList.txt`, e),
        fs.readFileSync(`src/testing/MatrixIntegrationCommonFinal/TestFiles/rooms.txt`, e),
        fs.readFileSync(`src/testing/MatrixIntegrationCommonFinal/TestFiles/specialCases.txt`, e),
        fs.readFileSync('src/testing/testingWeights.csv', e),
        worker);
}

describe("Matrix Testing", function() {
    // Replaced with Redux Matrix Testing

    it("Automated Matrix Testing Common Final with Real File", async () => {
        //-- Arrange
        const code = fs.readFileSync("src/phase2worker.js");
        let worker = new Worker(URL.createObjectURL(new Blob([code])));
        await testImport_Act(worker);

        //-- Act
        await generateSchedule();

        // wait for schedule to be generated
        await waitFor(() => {
            expect(store.getState().progress.progress).toEqual(-1);
        });
        // Assert
        let incorrectCases = [];
        testCases.forEach(testCase => {
            const course = getCourseNoWsUnmerged(testCase);
            // const course = getCourse(testCase)

            if (course === undefined) {
                incorrectCases.push(`Course ${testCase} was not found in the schedule.`);
            } else {
                const correctTime = (course.examTime === 1 ||course.examTime === 3) && course.examDay < 4;
                if (!(correctTime)) {
                    incorrectCases.push(`Final Exam for ${testCase} is scheduled at the wrong time. Expected: 11:00 or 17:30, received ${course.examTime} and scheduled on day ${course.examDay}`);
                    console.log(course)
                }
            }
        });
        if (incorrectCases.length > 0) {
            console.log(incorrectCases);
        }
        // 515 Total Test Cases
        expect(incorrectCases).toHaveLength(0, `${incorrectCases.length} tests were scheduled incorrectly. See above for details.`);
    });
});

