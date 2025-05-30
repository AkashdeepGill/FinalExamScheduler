// import {expect} from "chai"
import {
  scheduleForcedTimeExams,
  getCourse,
  importCourses,
  importRooms,
  clean,
} from "../../FinalExamScheduler.js";
import { expect } from "chai";
import fs from "fs";

describe("ForcedTimeTests", function () {
  /**
   * Clean up the final exam scheduler for every new test
   */
  beforeEach(() => {
    clean();
  });

  it("No Forced Time Classes", async function () {
    //Arrange
    const e = { encoding: "utf8", flag: "r" };
    await importCourses(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/NoForced/noForced.txt",
        e,
      ),
    );

    //Act
    scheduleForcedTimeExams();

    //Assert
    expect(getCourse("AE   4712 011").examTime).to.be.undefined;
    expect(getCourse("UX   3011 001").examTime).to.be.undefined;
    expect(getCourse("TC   3010 101").examTime).to.be.undefined;
  });

  it("One Forced Time Exam", async function () {
    //Arrange
    const e = { encoding: "utf8", flag: "r" };
    await importRooms(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/OneForcedDifferentRoom/rooms.txt",
        e,
      ),
    );
    await importCourses(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/OneForcedDifferentRoom/oneForced.txt",
        e,
      ),
    );

    //Act
    scheduleForcedTimeExams();

    //Assert
    expect(getCourse("AE   4712 011").examDay).to.be.undefined;
    expect(getCourse("AE   4712 011").examTime).to.be.undefined;
    expect(getCourse("AE   4712 011").examRoom).to.be.undefined;

    expect(getCourse("UX   3011 001").forceTime).to.equal("1");
    expect(getCourse("UX   3011 001").examRoom).to.equal("CC03");
    expect(getCourse("UX   3011 001").examDay).to.equal(0);
    expect(getCourse("UX   3011 001").examTime).to.equal(0);
  });

  it("Two Forced Time Exams In Different Rooms", async function () {
    //Arrange
    const e = { encoding: "utf8", flag: "r" };
    await importRooms(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/TwoForcedDifferentRoom/rooms.txt",
        e,
      ),
    );
    await importCourses(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/TwoForcedDifferentRoom/twoForcedDifferentRoom.txt",
        e,
      ),
    );

    //Act
    scheduleForcedTimeExams();

    //Assert
    expect(getCourse("AE   4712 011").forceTime).to.equal("1");
    expect(getCourse("AE   4712 011").examRoom).to.equal("CC03");
    expect(getCourse("AE   4712 011").examDay).to.equal(0);
    expect(getCourse("AE   4712 011").examTime).to.equal(0);

    expect(getCourse("UX   3011 001").forceTime).to.equal("1");
    expect(getCourse("UX   3011 001").examRoom).to.equal("CC107");
    expect(getCourse("UX   3011 001").examDay).to.equal(0);
    expect(getCourse("UX   3011 001").examTime).to.equal(0);
  });

  it("8 AM Force Time Testing", async function () {
    //Arrange
    const e = { encoding: "utf8", flag: "r" };
    await importRooms(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/8AMTest/rooms.txt",
        e,
      ),
    );
    await importCourses(
      fs.readFileSync(
        "src/testing/ForcedTimeTests/TestFiles/8AMTest/8AMForced.txt",
        e,
      ),
    );

    //Act
    scheduleForcedTimeExams();

    expect(getCourse("UX   3011 001").examTime).to.equal(0);
    expect(getCourse("TC   3010 101").examTime).to.equal(0);
    expect(getCourse("TC   3010 1012").examTime).to.equal(1);
    expect(getCourse("TC   3010 1013").examTime).to.equal(2);
    expect(getCourse("TC   3010 1014").examTime).to.equal(3);
    expect(getCourse("TC   3010 1015").examTime).to.equal(4);
  });
});
