import {
  clean,
  scheduleForcedTimeExams,
  importAllOnTestStart,
  weightAllRedux,
  unscheduleExam,
  weightReduxExamTime,
  getCourse,
  getRooms,
} from "../../FinalExamScheduler.js";
import fs from "fs";
import store from "../../Redux/Slices/store.js";
import chai from "chai";
const { expect } = chai;
import chaiWaitFor from "chai-wait-for";
chai.use(chaiWaitFor);

const waitFor = chaiWaitFor.bindWaitFor({
  // If no assertion attempt succeeds before this time elapses (in milliseconds), the waitFor will fail.
  timeout: 4000,
  // If an assertion attempt fails, it will retry after this amount of time (in milliseconds)
  retryInterval: 100,
});

const testImport_Act = async (folderName) => {
  const e = { encoding: "utf8", flag: "r" };

  //-- Arrange
  await importAllOnTestStart(
    fs.readFileSync(
      `src/testing/DBStudentRedux/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/DBStudentRedux/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/DBStudentRedux/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/DBStudentRedux/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );
  // Act
  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Redux Weights Testing", function () {
  beforeEach(clean);

  it("No Double Booked Students", async () => {
    //-- Arrange + Act
    await testImport_Act("No_Double_Booked_Students");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.studentDoubleBooked).to.not.be.undefined;

    const doubleBookedSlice = state.generatedWeights.studentDoubleBooked;

    expect(doubleBookedSlice.instances.length).to.equal(0);
  });

  it("3 Double Booked Students", async () => {
    await waitFor(
      store.getState().generatedWeights.studentDoubleBooked.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("3_Double_Booked_Students");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.studentDoubleBooked).to.not.be.undefined;

    const doubleBookedSlice = state.generatedWeights.studentDoubleBooked;

    expect(doubleBookedSlice.instances.length).to.equal(3);
    const overlappingStudentIds = [];
    doubleBookedSlice.instances.forEach((instance) => {
      overlappingStudentIds.push(instance.studentId);
    });
    for (let i = 1; i <= 3; i++) {
      expect(overlappingStudentIds).contains(`student${i}`);
    }
  });

  it("1 Manually Double Booked Student", async () => {
    await waitFor(
      store.getState().generatedWeights.studentDoubleBooked.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("1_Manual_Double_Booked");
    unscheduleExam("CLASS_B_");
    const conflictCourse = getCourse("CLASS_B_");

    //-- Act
    weightReduxExamTime(0, 0, getRooms().get("DBS2"), conflictCourse);
    const state = store.getState();

    //-- Assert
    const doubleBookedSlice = state.generatedWeights.studentDoubleBooked;
    expect(doubleBookedSlice.instances.length).equals(1);
  });

  it("Manually unschedule double booked student", async () => {
    await waitFor(
      store.getState().generatedWeights.studentDoubleBooked.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("1_Double_Booked_Student");
    //-- Act
    unscheduleExam("CLASS_A_");
    //-- Assert
    expect(
      store.getState().generatedWeights.studentDoubleBooked.instances.length,
    ).equals(0);
  });

  it("1 student with 2 double bookings at same day/time", async () => {
    await waitFor(
      store.getState().generatedWeights.studentDoubleBooked.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("1_Student_2_Double_Bookings_Same_DayTime");
    let expectedConflicts = new Set();
    expectedConflicts.add(`[CLASS_A_, CLASS_B_]`);
    expectedConflicts.add(`[CLASS_A_, CLASS_C_]`);
    expectedConflicts.add(`[CLASS_B_, CLASS_C_]`);
    //-- Assert

    store
      .getState()
      .generatedWeights.studentDoubleBooked.instances.forEach((conflict) => {
        const { studentId, Course_1_Code, Course_2_Code } = conflict;
        expect(expectedConflicts.delete(`[${Course_1_Code}, ${Course_2_Code}]`))
          .to.be.true;
      });
    expect(expectedConflicts.size).equals(0);
  });

  it("1 student with 2 double bookings at different days/times", async () => {
    await waitFor(
      store.getState().generatedWeights.studentDoubleBooked.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("1_Student_2_Double_Bookings");
    let expectedConflicts = new Set();
    expectedConflicts.add(`[CLASS_A_, CLASS_B_]`);
    expectedConflicts.add(`[CLASS_C_, CLASS_D_]`);
    //-- Assert

    store
      .getState()
      .generatedWeights.studentDoubleBooked.instances.forEach((conflict) => {
        const { studentId, Course_1_Code, Course_2_Code } = conflict;
        expect(expectedConflicts.delete(`[${Course_1_Code}, ${Course_2_Code}]`))
          .to.be.true;
      });
    expect(expectedConflicts.size).equals(0);
  });
});
