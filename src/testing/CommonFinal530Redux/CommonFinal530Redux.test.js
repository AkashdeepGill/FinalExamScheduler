import {
  clean,
  scheduleForcedTimeExams,
  importAllOnTestStart,
  weightAllRedux,
  weightReduxExamTime,
  getCourse,
  unscheduleExam,
  scheduleExamInRoomOnly,
  getRoom,
} from "../../FinalExamScheduler.js";
import chai from "chai";
import chaiWaitFor from "chai-wait-for";
import fs from "fs";
import store from "../../Redux/Slices/store.js";
import {
  scheduleCourse,
  unscheduleCourse,
} from "../../Redux/Slices/courseSlice.js";
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
    // src/testing/CommonFinal530Redux/CommonFinalMatrix/classList.txt
    fs.readFileSync(
      `src/testing/CommonFinal530Redux/CommonFinalMatrix/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinal530Redux/CommonFinalMatrix/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinal530Redux/CommonFinalMatrix/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinal530Redux/CommonFinalMatrix/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );
  // Act
  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Common Final at 5:30 Redux Testing", function () {
  beforeEach(clean);

  it("Forcing A Friday 5:50 Exam", async () => {
    //-- Arrange + Act
    await testImport_Act("2_Common_At_530");
    const state = store.getState();

    //-- Assert
    await waitFor(
      state.generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(2);
  });

  it("No common finals at 5:30 but class meets at 5:30pm", async () => {
    //-- Arrange
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(0);
    //-- Act
    await testImport_Act("No_Common_At_530");
    const state = store.getState();
    const lateCommonFinalSlice = state.generatedWeights.lateCommonFinal;
    //-- Assert
    expect(lateCommonFinalSlice.instances.length).equals(0);
  });

  it("Unscheduled 2 Exams to Cause No Common Final", async () => {
    //-- Arrange + Act
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(0);
    await testImport_Act("2_Common_At_530");
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(2);
    store.dispatch(unscheduleCourse({ courseId: "CLASS_A_" }));
    unscheduleExam("CLASS_A_");
    store.dispatch(unscheduleCourse({ courseId: "CLASS_B_" }));
    unscheduleExam("CLASS_B_");
    //-- Assert
    expect(store.getState().generatedWeights.lateCommonFinal).to.not.be
      .undefined;
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(0);
  });

  it("Adding and Removing Exams", async () => {
    //-- Arrange + Act
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(0);
    await testImport_Act("2_Common_At_530");
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(2);
    store.dispatch(unscheduleCourse({ courseId: "CLASS_B_" }));
    unscheduleExam("CLASS_B_");

    const courseToAdd = getCourse("CLASS_B_");

    expect(store.getState().generatedWeights.lateCommonFinal).to.not.be
      .undefined;
    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(1);

    weightReduxExamTime(0, 3, getRoom("DBI2"), courseToAdd);
    scheduleExamInRoomOnly(courseToAdd, getRoom("DBI2"), 0, 3);
    store.dispatch(
      scheduleCourse({ courseId: "CLASS_B_", day: 0, time: 3, room: "DBI2" }),
    );

    await waitFor(
      store.getState().generatedWeights.lateCommonFinal.instances.length,
    ).to.equal(2);
  });
});
