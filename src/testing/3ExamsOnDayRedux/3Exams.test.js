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
      `src/testing/3ExamsOnDayRedux/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/3ExamsOnDayRedux/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/3ExamsOnDayRedux/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/3ExamsOnDayRedux/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );
  // Act
  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Redux Weights Testing", function () {
  beforeEach(() => {
    clean();
  });

  it("1 Student With 3 Same Day Exams", async () => {
    //-- Arrange + Act
    await testImport_Act("1_Student_3_Exams");

    const state = store.getState();
    //-- Assert

    const threeExamsSlice = state.generatedWeights.threeSameDayExams;

    expect(threeExamsSlice.instances.length).equals(1);
  });

  it("2 Students With 3 Same Day Exams", async () => {
    await waitFor(
      store.getState().generatedWeights.threeSameDayExams.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("2_Students_3_Exams");
    const state = store.getState();
    //-- Assert

    const threeExamsSlice = state.generatedWeights.threeSameDayExams;
    console.log(threeExamsSlice);
    expect(threeExamsSlice.instances.length).equals(2);
  });

  test("1 Student With 4 Same Day Exams", async () => {
    await waitFor(
      store.getState().generatedWeights.threeSameDayExams.instances.length,
    ).to.equal(0);
    //-- Arrange + Act
    await testImport_Act("1_Student_4_Exams");
    const state = store.getState();

    //-- Assert

    const threeExamsSlice = state.generatedWeights.threeSameDayExams;

    expect(threeExamsSlice.instances.length).equals(4);
  });

  test("Manually Schedule 1 Student With 3 Same Day Exams", async () => {
    await waitFor(
      store.getState().generatedWeights.threeSameDayExams.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("1_Student_3_Exams_Manual");
    unscheduleExam("CLASS_C_");
    const conflictCourse = getCourse("CLASS_C_");
    //-- Act
    weightReduxExamTime(0, 0, getRooms().get("DBS3"), conflictCourse);
    const state = store.getState();

    //-- Assert
    const threeExamsSlice = state.generatedWeights.threeSameDayExams;
    expect(threeExamsSlice.instances.length).equals(1);
  });

  test("Manually Schedule 1 Student With 4 Same Day Exams", async () => {
    await waitFor(
      store.getState().generatedWeights.threeSameDayExams.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("1_Student_4_Exams_Manual");
    unscheduleExam("CLASS_D_");
    let conflictCourse = getCourse("CLASS_D_");
    //-- Act
    weightReduxExamTime(0, 0, getRooms().get("DBS3"), conflictCourse);
    const state = store.getState();

    //-- Assert
    const threeExamsSlice = state.generatedWeights.threeSameDayExams;
    expect(threeExamsSlice.instances.length).equals(4);
  });

  const data = [
    {
      courseCode: "CLASS_C_",
    },
    {
      courseCode: "CLASS_B_",
    },
    {
      courseCode: "CLASS_A_",
    },
  ];

  test.each(data)("Unschedule Conflicting Class", async (c) => {
    await waitFor(
      store.getState().generatedWeights.threeSameDayExams.instances.length,
    ).to.equal(0);
    //-- Arrange
    await testImport_Act("1_Student_3_Exams");
    const state = store.getState();
    //-- Act
    unscheduleExam(c.courseCode);

    //-- Assert
    const threeExamsSlice = state.generatedWeights.threeSameDayExams;
    expect(
      store.getState().generatedWeights.threeSameDayExams.instances.length,
    ).equals(0);
  });
});
