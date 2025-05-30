import {
  clean,
  getCourse,
  getRooms,
  importAllOnTestStart, scheduleExam,
  scheduleForcedTimeExams,
  unscheduleExam,
  weightAllRedux,
  weightReduxExamTime,
} from "../../FinalExamScheduler.js";
import chai from "chai";
const { expect } = chai;
import chaiWaitFor from "chai-wait-for";
chai.use(chaiWaitFor);
import fs from "fs";
import store from "../../Redux/Slices/store.js";

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
      `src/testing/CommonFinalFridayRedux/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinalFridayRedux/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinalFridayRedux/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/CommonFinalFridayRedux/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );

  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Common Final on Friday Testing", function () {
  beforeEach(() => {
    clean();
  });

  test("No Common Finals on Friday", async () => {
    await waitFor(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).to.equal(0);

    //-- Arrange + Act
    await testImport_Act("NoCommonFinalsOnFriday");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.fridayCommonFinal).to.not.be.undefined;

    const fridayCommonFinalSlice = state.generatedWeights.fridayCommonFinal;

    expect(fridayCommonFinalSlice.instances.length).to.equal(0);
  });

  test("One Common Final on Friday", async () => {
    await waitFor(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).to.equal(0);

    //-- Arrange + Act
    await testImport_Act("1CommonFinalOnFriday");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.fridayCommonFinal).to.not.be.undefined;

    const fridayCommonFinalSlice = state.generatedWeights.fridayCommonFinal;
    expect(fridayCommonFinalSlice.instances.length).to.equal(1);
  });

  test("Manually scheduling a common final on Friday", async () => {
    await waitFor(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("ManualScheduleCommonFinalFriday");
    unscheduleExam("CLASS_A_");
    const conflictCourse = getCourse("CLASS_A_");
    //-- Act
    scheduleExam(conflictCourse, 4, 0, getRooms().get("DBS1"));
    weightReduxExamTime(4, 0, getRooms().get("DBS1"), conflictCourse);
    const state = store.getState();

    //-- Assert
    const fridayCommonFinalSlice = state.generatedWeights.fridayCommonFinal;
    expect(fridayCommonFinalSlice.instances.length).equals(1);
  });

  test("Manually scheduling a common final on every other day", async () => {
    await waitFor(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("ManualScheduleCommonFinalNOTFriday");
    unscheduleExam("CLASS_A_");
    const conflictCourse = getCourse("CLASS_A_");

    for (let i = 0; i < 3; i++) {
      //-- Act
      weightReduxExamTime(i, 0, getRooms().get("DBS1"), conflictCourse);
      const state = store.getState();

      //-- Assert
      const fridayCommonFinalSlice = state.generatedWeights.fridayCommonFinal;
      expect(fridayCommonFinalSlice.instances.length).equals(0);
    }
  });

  test("Un-scheduling a common final on a Friday", async () => {
    await waitFor(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("UnscheduleCommonFinalOnFriday");
    const state = store.getState();

    //-- Act
    expect(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).equals(1);
    unscheduleExam("CLASS_A_");

    //-- Assert
    const fridayCommonFinalSlice = state.generatedWeights.fridayCommonFinal;
    expect(
      store.getState().generatedWeights.fridayCommonFinal.instances.length,
    ).equals(0);
  });
});
