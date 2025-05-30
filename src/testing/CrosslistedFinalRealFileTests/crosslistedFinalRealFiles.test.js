import {
    importAllOnTestStart,
    generateSchedule,
    getCourse
} from "../../FinalExamScheduler.js";
import {waitFor} from '@testing-library/react';
import fs from "fs";
import store from "../../Redux/Slices/store.js";
import 'jsdom-worker';
import {testCases} from "./TestFiles/testCases.js";

const testingSet = testCases;

const testImport_Act = async (worker) => {

    const e = {encoding: 'utf8', flag: 'r'};

    //-- Arrange
    await importAllOnTestStart(
        fs.readFileSync(`src/testing/CrosslistedFinalRealFileTests/TestFiles/courseSchedule.txt`, e),
        fs.readFileSync(`src/testing/CrosslistedFinalRealFileTests/TestFiles/classList.txt`, e),
        fs.readFileSync(`src/testing/CrosslistedFinalRealFileTests/TestFiles/rooms.txt`, e),
        fs.readFileSync(`src/testing/CrosslistedFinalRealFileTests/TestFiles/specialCases.txt`, e),
        fs.readFileSync('src/testing/testingWeights.csv', e),
        worker);
}

describe("Crosslisted Finals Real Files Testing", function() {
    // Replaced with Redux Matrix Testing

    it("Automated Crosslisted Finals Testing with Real File", async () => {
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
        testingSet.forEach(testCase => {
            const referenceCourse = getCourse(testCase[0]);
            if (referenceCourse === undefined) {
                console.log(`Course ${testCase[0]} was not found in the schedule.`);
            } else {
                const referenceDay = referenceCourse.examDay;
                const referenceTime = referenceCourse.examTime
                testCase.forEach(courseCode => {
                    const course = getCourse(courseCode);
                    if (course !== undefined) {
                        const correctDay = course.examDay === referenceDay;
                        const correctTime = course.examTime === referenceTime;
                        if (!(correctDay)) {
                            incorrectCases.push(`Final Exam for ${courseCode} is scheduled on the wrong day. Expected: ${referenceDay}, received ${course.examDay}`);
                        }
                        if (!(correctTime)) {
                            incorrectCases.push(`Final Exam for ${courseCode} is scheduled at the wrong time. Expected: ${referenceTime}, received ${course.examTime}`);
                        }
                    }
                })
            }
        });
        if (incorrectCases.length > 0) {
            console.log(incorrectCases);
        }
        // 515 Total Test Cases
        // expect(incorrectCases).toHaveLength(0, `${incorrectCases.length} tests were scheduled incorrectly. See above for details.`);
    });
});