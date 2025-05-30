import {
  clean,
  scheduleForcedTimeExams,
  importAllOnTestStart,
  weightAllRedux,
  weightReduxExamTime,
  getRooms,
  getCourse,
  unscheduleExam,
} from "../../FinalExamScheduler.js";
import chai from "chai";
import chaiWaitFor from "chai-wait-for";
import fs from "fs";
import store from "../../Redux/Slices/store.js";
const { expect } = chai;

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
      `src/testing/CommonFinalNonCommonTimeRedux/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinalNonCommonTimeRedux/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinalNonCommonTimeRedux/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinalNonCommonTimeRedux/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );
  // Act
  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Testing Redux Common Final at Noncommon time", function () {
  beforeEach(() => {
    clean();
  });

  it("1 Common Final with 2 sections at Noncommon time", async () => {
    //-- Arrange + Act
    await testImport_Act("2_Common_Sections_At_NonCommon_Time");

    const state = store.getState();
    //-- Assert

    const nonCommonTimeSlice = state.generatedWeights.nonCommonFinal;

    expect(nonCommonTimeSlice.instances.length).equals(2);
  });

  it("Non Common finals at Noncommon time", async () => {
    await waitFor(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("No_Common_Finals_At_NonCommon_Times");

    const state = store.getState();
    //-- Assert

    const nonCommonTimeSlice = state.generatedWeights.nonCommonFinal;

    expect(nonCommonTimeSlice.instances.length).equals(0);
  });

  it("Manually unschedule common final that was at noncommon time", async () => {
    await waitFor(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("2_Common_Sections_At_NonCommon_Time");

    //-- Assert
    unscheduleExam("CSC  1110 051");

    expect(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).equals(0);
  });

  it("Manually schedule common final at a noncommon time", async () => {
    await waitFor(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("No_Common_Finals_At_NonCommon_Times");
    unscheduleExam("CSC  1110 051");
    let conflictCourse = getCourse("CSC  1110 051");

    //-- Act
    weightReduxExamTime(0, 0, getRooms().get("DBS2"), conflictCourse);

    //-- Assert
    expect(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).equals(1);
  });

  it("Manually schedule common final at 11AM", async () => {
    await waitFor(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("No_Common_Finals_At_NonCommon_Times");
    unscheduleExam("CSC  1110 051");
    let conflictCourse = getCourse("CSC  1110 051");

    //-- Act
    weightReduxExamTime(0, 1, getRooms().get("DBS2"), conflictCourse);

    //-- Assert
    expect(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).equals(0);
  });

  it("Manually schedule common final at a 5:30PM", async () => {
    await waitFor(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("No_Common_Finals_At_NonCommon_Times");
    unscheduleExam("CSC  1110 051");
    let conflictCourse = getCourse("CSC  1110 051");

    //-- Act
    weightReduxExamTime(0, 3, getRooms().get("DBS2"), conflictCourse);

    //-- Assert
    expect(
      store.getState().generatedWeights.nonCommonFinal.instances.length,
    ).equals(0);
  });
});
