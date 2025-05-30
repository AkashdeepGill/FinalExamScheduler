import {
  clean,
  scheduleForcedTimeExams,
  importAllOnTestStart,
  weightAllRedux,
  unscheduleExam,
  weightReduxExamTime,
  scheduleExamInRoomOnly,
  getCourse,
  getRoom,
} from "../../FinalExamScheduler.js";
import chai from "chai";
import chaiWaitFor from "chai-wait-for";
chai.use(chaiWaitFor);
const { expect } = chai;
import fs from "fs";
import store from "../../Redux/Slices/store.js";
import {
  scheduleCourse,
  unscheduleCourse,
} from "../../Redux/Slices/courseSlice.js";

const waitFor = chaiWaitFor.bindWaitFor({
  // If no assertion attempt succeeds before this time elapses (in milliseconds), the waitFor will fail.
  timeout: 5000,
  // If an assertion attempt fails, it will retry after this amount of time (in milliseconds)
  retryInterval: 100,
});

const testImport_Act = async (folderName) => {
  const e = { encoding: "utf8", flag: "r" };

  //-- Arrange
  await importAllOnTestStart(
    fs.readFileSync(
      `src/testing/DBInstructorRedux/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/DBInstructorRedux/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/DBInstructorRedux/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/DBInstructorRedux/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );
  // Act
  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Double Booked Instructor Redux Testing", function () {
  beforeEach(clean);

  it("No Double Booked Instructors", async () => {
    //-- Arrange + Act
    await testImport_Act("No_Double_Booked_Instructors");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.instructorDoubleBooked).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances.length,
    ).to.equal(0);
  });
  it("Manually Schedule 1 Exam to Cause Double Booked Instructor", async () => {
    //-- Arrange + Act
    await testImport_Act("No_Double_Booked_Instructors");
    const state = store.getState();
    const courseCode = "CLASS_C_";
    unscheduleExam(courseCode);
    store.dispatch(unscheduleCourse({ courseId: courseCode }));

    weightReduxExamTime(0, 0, getRoom("DBI3"), getCourse(courseCode));
    scheduleExamInRoomOnly(getCourse(courseCode), getRoom("DBI3"), 0, 0);
    store.dispatch(
      scheduleCourse({ courseId: courseCode, day: 0, time: 0, room: "DBI3" }),
    );

    //-- Assert
    expect(state.generatedWeights.instructorDoubleBooked).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances.length,
    ).to.equal(1);
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances[0]
        .Instructor,
    ).to.equal("instructor1");
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances[0]
        .Exam_Time,
    ).to.equal("8:00 am on Monday");
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.courses,
    ).to.contain("CLASS_A_");
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.courses,
    ).to.contain("CLASS_C_");
  });
  it("Forced Time Exams Cause 1 Double Booked Instructor", async () => {
    //-- Arrange + Act
    await testImport_Act("1_Double_Booked_Instructor");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.instructorDoubleBooked).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances.length,
    ).to.equal(1);
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances[0]
        .Instructor,
    ).to.equal("instructor1");
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances[0]
        .Exam_Time,
    ).to.equal("8:00 am on Monday");
  });
  it("Forced Time Exams Cause 2 Double Booked Instances of Same Professor", async () => {
    //-- Arrange + Act
    await testImport_Act("2_Double_Booked_Instructors");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.instructorDoubleBooked).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances.length,
    ).to.equal(2);
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.courses,
    ).to.include("CLASS_A_");
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.courses,
    ).to.include("CLASS_B_");
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.courses,
    ).to.include("CLASS_C_");
    const doubleBookedSlice =
      store.getState().generatedWeights.instructorDoubleBooked;
    doubleBookedSlice.instances.forEach((instance) => {
      expect(instance.Instructor).to.equal("instructor1");
      expect(instance.Exam_Time).to.equal("8:00 am on Monday");
    });
  });
  it("Unschedule 1 Exam to Cause No Double Booked Instructors", async () => {
    //-- Arrange + Act
    await testImport_Act("1_Double_Booked_Instructor");
    const state = store.getState();
    store.dispatch(unscheduleCourse({ courseId: "CLASS_A_" }));
    unscheduleExam("CLASS_A_");

    //-- Assert
    expect(state.generatedWeights.instructorDoubleBooked).to.not.be.undefined;
    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances.length,
    ).to.equal(0);
  });
  it("Unschedule 2 Exams to Cause No Double Booked Instructors", async () => {
    //-- Arrange + Act
    await testImport_Act("1_Double_Booked_Instructor");
    const state = store.getState();
    store.dispatch(unscheduleCourse({ courseId: "CLASS_A_" }));
    unscheduleExam("CLASS_A_");
    store.dispatch(unscheduleCourse({ courseId: "CLASS_B_" }));
    unscheduleExam("CLASS_B_");

    //-- Assert
    expect(state.generatedWeights.instructorDoubleBooked).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.instructorDoubleBooked.instances.length,
    ).to.equal(0);
  });
});
