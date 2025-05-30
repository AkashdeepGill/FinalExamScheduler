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
      `src/testing/RoomTooSmallRedux/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/RoomTooSmallRedux/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/RoomTooSmallRedux/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/RoomTooSmallRedux/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
  );
  // Act
  scheduleForcedTimeExams();
  weightAllRedux();
};

describe("Room Too Small Redux Testing", function () {
  beforeEach(clean);

  it("Exact Fit Room", async () => {
    //-- Arrange + Act
    await testImport_Act("Exact_Capacity_Room");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.roomTooSmall).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.roomTooSmall.instances.length,
    ).to.equal(0);
  });
  it("Room One Student Over Capacity", async () => {
    //-- Arrange + Act
    await testImport_Act("One_Student_Over_Capacity");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.roomTooSmall).to.not.be.undefined;

    await waitFor(
      store.getState().generatedWeights.roomTooSmall.instances.length,
    ).to.equal(1);
    await waitFor(
      store.getState().generatedWeights.roomTooSmall.instances[0]
        .Instructor,
    ).to.equal("rts_instructor");
    await waitFor(
      store.getState().generatedWeights.roomTooSmall.instances[0]
        .Exam_Time,
    ).to.equal("8:00 am on Monday");
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Room,
    ).to.equal("RTS1");
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Class_Enrollment,
    ).to.equal(30);
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Room_Capacity,
    ).to.equal(29);
    await waitFor(
      store.getState().generatedWeights.roomTooSmall.courses,
    ).to.contain("RTS_Redux_Testing");
  });
  it("Manually Unschedule Room with One Student Over Capacity", async () => {
    //-- Arrange + Act
    await testImport_Act("One_Student_Over_Capacity");
    const state = store.getState();
    const courseCode = "RTS_Redux_Testing";
    unscheduleExam(courseCode);
    store.dispatch(unscheduleCourse({ courseId: courseCode }));

    //-- Assert
    expect(state.generatedWeights.roomTooSmall).to.not.be.undefined;

    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances.length,
    ).to.equal(0);
  });
  it("Manually Schedule Room with One Student Over Capacity", async () => {
    //-- Arrange + Act
    await testImport_Act("Unscheduled_One_Student_Over_Capacity");
    const state = store.getState();
    const courseCode = "RTS_Redux_Testing";

    weightReduxExamTime(0, 0, getRoom("RTS1"), getCourse(courseCode));
    scheduleExamInRoomOnly(getCourse(courseCode), getRoom("RTS1"), 0, 0);

    //-- Assert
    expect(state.generatedWeights.roomTooSmall).to.not.be.undefined;

    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances.length,
    ).to.equal(1);
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Instructor,
    ).to.equal("rts_instructor");
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Exam_Time,
    ).to.equal("8:00 am on Monday");
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Room,
    ).to.equal("RTS1");
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Class_Enrollment,
    ).to.equal(30);
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances[0]
            .Room_Capacity,
    ).to.equal(29);
    await waitFor(
        store.getState().generatedWeights.roomTooSmall.courses,
    ).to.contain("RTS_Redux_Testing");
  });
  it("Room One Student Under Capacity", async () => {
    //-- Arrange + Act
    await testImport_Act("One_Student_Under_Capacity");
    const state = store.getState();

    //-- Assert
    expect(state.generatedWeights.roomTooSmall).to.not.be.undefined;

    await waitFor(
        store.getState().generatedWeights.roomTooSmall.instances.length,
    ).to.equal(0);
  });
});
