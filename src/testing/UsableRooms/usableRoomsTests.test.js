import {
  clean,
  importAllOnTestStart,
  getRooms,
  getCourse,
  generateSchedule,
  getCourses,
  scheduleExam,
  getRoom,
} from "../../FinalExamScheduler.js";
import chai from "chai";
import fs from "fs";
import "jsdom-worker";
const { expect } = chai;

const testImport_Act = async (folderName) => {
  const e = { encoding: "utf8", flag: "r" };

  const code = fs.readFileSync("src/phase2worker.js");
  let worker = new Worker(URL.createObjectURL(new Blob([code])));

  //-- Arrange
  await importAllOnTestStart(
    fs.readFileSync(
      `src/testing/UsableRooms/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/UsableRooms/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/UsableRooms/TestFiles/${folderName}/rooms.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/UsableRooms/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
    fs.readFileSync("src/testing/testingWeights.csv", e),
    worker,
  );
  // Act
  generateSchedule();
};

const sleep = (t) =>
  new Promise((r) => {
    setTimeout(r, t);
  });

describe("Redux Weights Testing", function () {
  beforeEach(() => {
    clean();
  });

  it("All rooms are set to usable if there is no usable header", async () => {
    //-- Arrange + Act
    await testImport_Act("all_rooms_usable_no_header");

    const rooms = getRooms();
    for (let [roomId, room] of rooms) {
      expect(room.usable).to.be.true;
    }
  });
  it("All rooms are set to usable if column is empty or 1", async () => {
    //-- Arrange + Act
    await testImport_Act("all_rooms_usable_with_header");

    const rooms = getRooms();
    for (let [roomId, room] of rooms) {
      expect(room.usable).to.be.true;
    }
  });
  it("Rooms set to not usable if there is a 0 in usable column", async () => {
    await testImport_Act("no_rooms_usable");
    const rooms = getRooms();
    for (let [roomId, room] of rooms) {
      expect(room.usable).to.be.false;
    }
  });
  it("Unusable rooms not being used in algorithm", async () => {
    //-- Arrange + Act
    await testImport_Act("no_rooms_usable");
    await sleep(100);
    const courses = getCourses();
    //-- Assert
    for (let [code, course] of courses) {
      expect(course.examRoom).to.be.undefined;
      expect(course.examDay).to.be.undefined;
      expect(course.examTime).to.be.undefined;
    }
  });
  it("Unusable rooms not being used to schedule special case classes", async () => {
    //-- Arrange + Act
    await testImport_Act("no_rooms_usable");
    await sleep(100);
    const courses = getCourses();
    //-- Assert
    for (let [code, course] of courses) {
      expect(course.examRoom).to.be.undefined;
      expect(course.examDay).to.be.undefined;
      expect(course.examTime).to.be.undefined;
    }
  });

  it("Usable rooms are being used in algorithm", async () => {
    //-- Arrange + Act
    await testImport_Act("all_rooms_usable_no_header");
    await sleep(100);
    const courses = getCourses();
    //-- Assert
    for (let [code, course] of courses) {
      expect(course.examRoom).to.be.not.undefined;
      expect(course.examDay).to.be.not.undefined;
      expect(course.examTime).to.be.not.undefined;
    }
  });

  it("Full test with some usable and unusable rooms with special cases", async () => {
    //-- Arrange + Act
    await testImport_Act("some_usable_and_unusable_rooms");
    await sleep(100);
    const courses = getCourses();
    //-- Assert
    for (let [code, course] of courses) {
      expect(course.examRoom).to.not.equal("DBS4");
      expect(course.examRoom).to.not.equal("DBS5");
      expect(course.examRoom).to.not.be.undefined;
    }
  });

  it("Unusable rooms can be manually scheduled", async () => {
    //-- Arrange
    await testImport_Act("no_rooms_usable");
    await sleep(100);
    const course = getCourse("CLASS_A_");
    const room = getRoom("DBS1");
    //-- Act
    scheduleExam(course, 0, 1, room);
    //-- Assert
    expect(course.examRoom).equals("DBS1");
  });
});
