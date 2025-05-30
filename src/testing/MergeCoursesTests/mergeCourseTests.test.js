
import {
    importAllOnTestStart,
    generateSchedule,
    getCourseNoWsUnmerged,
    getCourse,
    getCourses
} from "../../FinalExamScheduler.js";
import { waitFor } from '@testing-library/react';
import fs from "fs";
import store from "../../Redux/Slices/store.js";
import 'jsdom-worker';

const testImport_Act = async (folderName) => {

    const e = { encoding: 'utf8', flag: 'r' };

    const code = fs.readFileSync("src/phase2worker.js");
    let worker = new Worker(URL.createObjectURL(new Blob([code])));

    //-- Arrange
    await importAllOnTestStart(
        fs.readFileSync(`src/testing/MergeCoursesTests/TestFiles/${folderName}/courseSchedule.txt`, e),
        fs.readFileSync(`src/testing/MergeCoursesTests/TestFiles/${folderName}/classList.txt`, e),
        fs.readFileSync(`src/testing/MergeCoursesTests/TestFiles/${folderName}/rooms.txt`, e),
        fs.readFileSync(`src/testing/MergeCoursesTests/TestFiles/${folderName}/specialCases.txt`, e),
        fs.readFileSync('src/testing/testingWeights.csv', e),
        worker);
    
}

describe("Merged Courses Testing", function () {

    it("Simple Merge two courses test", async () => {
        //Arrange
        await testImport_Act("SimpleMerge");
        await generateSchedule();
        await waitFor(() => {
            expect(store.getState().progress.progress).toEqual(-1);
        });
        //Act
        const mergedCourse = getCourse("MRG  1000 001/002");
        //Assert
        expect(mergedCourse).toBeTruthy();
        expect(mergedCourse.courseCode).toEqual('MRG  1000 001/002')
        expect(mergedCourse.numOfStudents).toEqual(2)
        expect(mergedCourse.students).toEqual(expect.arrayContaining(['uniqueStudent1', 'uniqueStudent2']));
        expect(mergedCourse.day).toEqual(['M', undefined, 'W', undefined,'F', undefined]);
    });

    it("Merge three courses", async () => {
        //Arrange
        await testImport_Act("MergeThreeCourses");
        await generateSchedule();
        await waitFor(() => {
            expect(store.getState().progress.progress).toEqual(-1);
        });
        //Act
        const mergedCourse = getCourse("MRG  1000 001/002/003");
        //Assert
        expect(mergedCourse).toBeTruthy();
        expect(mergedCourse.courseCode).toEqual('MRG  1000 001/002/003')
        expect(mergedCourse.numOfStudents).toEqual(3)
        expect(mergedCourse.students).toEqual(expect.arrayContaining(['uniqueStudent1', 'uniqueStudent2', 'uniqueStudent3']));
        expect(mergedCourse.day).toEqual(['M', undefined, 'W', undefined,'F', undefined]);
    });

    it("Merge three crosslisted courses with a non merged course", async () => {
        //Arrange
        await testImport_Act("MergeThreeCrossListed");
        await generateSchedule();
        await waitFor(() => {
            expect(store.getState().progress.progress).toEqual(-1);
        });
        //Act
        const mergedCourse = getCourse("MRG  1000 001/002/003");
        const otherCrossListedCourse = getCourse("NAH  1100 110");
        //Assert
        expect(mergedCourse).toBeTruthy();
        expect(mergedCourse.crossListedClasses).toEqual(['NAH  1100 110']);
        expect(otherCrossListedCourse.crossListedClasses).toEqual(['MRG  1000 001/002/003']);
    });

    it("Merge courses with different lab day", async () => {
        //Arrange
        await testImport_Act("MergeDiffLabs");
        await generateSchedule();
        await waitFor(() => {
            expect(store.getState().progress.progress).toEqual(-1);
        });
        //Act
        const mergedCourse = getCourse("MRG  1000 001/002");
        //Assert
        expect(mergedCourse).toBeTruthy();
        expect(mergedCourse.courseCode).toEqual('MRG  1000 001/002')
        expect(mergedCourse.numOfStudents).toEqual(2)
        expect(mergedCourse.students).toEqual(expect.arrayContaining(['uniqueStudent1', 'uniqueStudent2']));
        expect(mergedCourse.day).toEqual(['M', 'T', 'W', 'R','F', undefined]);
        expect(mergedCourse.endTime).toEqual(['1/1/00 10:50', '1/1/00 10:50', '1/1/00 10:50', '1/1/00 10:50', '1/1/00 10:50', undefined]);
        expect(mergedCourse.startTime).toEqual(['1/1/00 10:00', '1/1/00 10:00', '1/1/00 10:00', '1/1/00 10:00', '1/1/00 10:00', undefined]);
    });

    it("Merge courses with different lab day, time, and room", async () => {
        //Arrange
        await testImport_Act("MergeDiffLabsDayTime");
        await generateSchedule();
        await waitFor(() => {
            expect(store.getState().progress.progress).toEqual(-1);
        });
        //Act
        const mergedCourse = getCourse("MRG  1000 001/002");
        //Assert
        expect(mergedCourse).toBeTruthy();
        expect(mergedCourse.courseCode).toEqual('MRG  1000 001/002')
        expect(mergedCourse.numOfStudents).toEqual(2)
        expect(mergedCourse.students).toEqual(expect.arrayContaining(['uniqueStudent1', 'uniqueStudent2']));
        expect(mergedCourse.day).toEqual(['M', 'T', 'W', 'R','F', undefined]);
        expect(mergedCourse.endTime).toEqual(['1/1/00 10:50', '1/1/00 12:50', '1/1/00 10:50', '1/1/00 13:50', '1/1/00 10:50', undefined]);
        expect(mergedCourse.startTime).toEqual(['1/1/00 10:00', '1/1/00 11:00', '1/1/00 10:00', '1/1/00 12:00', '1/1/00 10:00', undefined]);
    });

    

});