import {
    clean, getCourse, getRooms,
    getSI_Catalog,
    importAllOnTestStart,
    phase1,
    removeStudentInstructorOverlaps, scheduleCommonFinals,
    scheduleForcedTimeExams, unscheduleExam, weightAllRedux, weightReduxExamTime
} from "../../FinalExamScheduler.js";
import chai from 'chai'
const { expect } = chai;
import chaiWaitFor from 'chai-wait-for';
chai.use(chaiWaitFor);
import fs from "fs";
import store from '../../Redux/Slices/store.js';

const waitFor = chaiWaitFor.bindWaitFor({
    // If no assertion attempt succeeds before this time elapses (in milliseconds), the waitFor will fail.
    timeout: 4000,
    // If an assertion attempt fails, it will retry after this amount of time (in milliseconds)
    retryInterval: 100,
})

const testImport_Act = async (folderName) => {

    const e = { encoding: 'utf8', flag: 'r' };

    //-- Arrange
    await importAllOnTestStart(
        fs.readFileSync(`src/testing/PriorityExamsRedux/TestFiles/${folderName}/courseSchedule.txt`, e),
        fs.readFileSync(`src/testing/PriorityExamsRedux/TestFiles/${folderName}/classList.txt`, e),
        fs.readFileSync(`src/testing/PriorityExamsRedux/TestFiles/${folderName}/rooms.txt`, e),
        fs.readFileSync(`src/testing/PriorityExamsRedux/TestFiles/${folderName}/specialCases.txt`, e),
        fs.readFileSync('src/testing/testingWeights.csv', e));

    scheduleForcedTimeExams();
    weightAllRedux();
}

describe('2 Priority Exams Redux', function () {

    beforeEach(() => {
        clean();
    });

    test("No 2 Priority Exams on Any Day", async () => {
        await waitFor(store.getState().generatedWeights.sameDayPriorityExams.instances.length).to.equal(0);

        //-- Arrange + Act
        await testImport_Act('No2PriorityExams');
        const state = store.getState();

        //-- Assert
        expect(state.generatedWeights.sameDayPriorityExams).to.not.be.undefined;

        const priorityExamsSlice = state.generatedWeights.sameDayPriorityExams;

        expect(priorityExamsSlice.instances.length).to.equal(0);
    });

    test("2 Priority Exams on Any Day", async () => {
        await waitFor(store.getState().generatedWeights.sameDayPriorityExams.instances.length).to.equal(0);

        //-- Arrange + Act
        await testImport_Act('2PriorityExams');
        const state = store.getState();

        //-- Assert
        expect(state.generatedWeights.sameDayPriorityExams).to.not.be.undefined;

        const priorityExamsSlice = state.generatedWeights.sameDayPriorityExams;

        expect(priorityExamsSlice.instances.length).to.equal(1);
    });

    test("Manually Schedule 2 Priority Exams on Any Day", async () => {
        await waitFor(store.getState().generatedWeights.sameDayPriorityExams.instances.length).to.equal(0);

        //-- Arrange + Act
        await testImport_Act('Manual2PriorityExams');
        unscheduleExam("CLASS_A_");
        const conflictCourse = getCourse("CLASS_A_");

        weightReduxExamTime(1, 0, getRooms().get("DBS1"), conflictCourse);
        const state = store.getState();

        //-- Assert
        const priorityExamsSlice = state.generatedWeights.sameDayPriorityExams;
        expect(priorityExamsSlice.instances.length).equals(1);
    });

    test("Manually Schedule Priority Exams on Different Days", async () => {
        await waitFor(store.getState().generatedWeights.sameDayPriorityExams.instances.length).to.equal(0);

        //-- Arrange + Act
        await testImport_Act('Manual2PriorityExams');
        unscheduleExam("CLASS_A_");

        for (let i = 0; i < 5; i++) {
            if(i !== 1) {
                const conflictCourse = getCourse("CLASS_A_");
                weightReduxExamTime(i, 0, getRooms().get("DBS1"), conflictCourse);
                const state = store.getState();

                //-- Assert
                const priorityExamsSlice = state.generatedWeights.sameDayPriorityExams;
                expect(priorityExamsSlice.instances.length).equals(0);
            }
        }




    });

    test("Manually Unschedule 2 Priority Exams on Any Day", async () => {
        await waitFor(store.getState().generatedWeights.sameDayPriorityExams.instances.length).to.equal(0);

        //-- Arrange + Act
        await testImport_Act('ManualUnschedule2PriorityExams');
        unscheduleExam("CLASS_A_");
        const state = store.getState();

        //-- Assert
        const priorityExamsSlice = state.generatedWeights.sameDayPriorityExams;
        expect(priorityExamsSlice.instances.length).equals(0);
    });


});