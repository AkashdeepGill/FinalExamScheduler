import {
  clean,
  getRooms,
  phase1,
  getCourses,
  importAllOnTestStart,
} from "../../FinalExamScheduler.js";
import { expect } from "chai";
import { CareTaker } from "../../Models/CareTaker.js";
import Schedule from "../../Models/Schedule.js";
import fs from "fs";

const testImport_Act = async (folderName) => {
  //-- Arrange
  const e = { encoding: "utf8", flag: "r" };

  //-- Arrange
  await importAllOnTestStart(
    fs.readFileSync(
      `src/testing/Memento/TestFiles/${folderName}/courseSchedule.txt`,
      e,
    ),
    fs.readFileSync(
      `src/testing/Memento/TestFiles/${folderName}/classList.txt`,
      e,
    ),
    fs.readFileSync(`src/testing/Memento/TestFiles/${folderName}/rooms.txt`, e),
    fs.readFileSync(
      `src/testing/Memento/TestFiles/${folderName}/specialCases.txt`,
      e,
    ),
  );
  phase1();
};

//Note: These tests only deal with the memento pattern and test that it works. Using phase1 as a baseline.
describe("Memento Tests", () => {
  beforeEach(clean);

  it("Creating a memento with 3 scheduled classes", () => {
    //-- Arrange + Act
    testImport_Act("3Classes_3Days_SameRoom_ForMemento");
    const schedule1 = new Schedule(getCourses(), getRooms(), 0);

    //-- Act
    const stamp = schedule1.toString();
    const schedule2 = new Schedule();
    schedule2.parse(stamp);

    expect(schedule1.isEqualTo(schedule2)).to.be.true;
    expect(schedule2).to.deep.equal(schedule1);
  });

  it("Memento properly saved with 3 scheduled classes", () => {
    //-- Arrange + Act
    testImport_Act("3Classes_3Days_SameRoom_ForMemento");
    const careTaker = new CareTaker();
    const schedule1 = new Schedule(getCourses(), getRooms(), 69);

    //-- Act
    const stamp = schedule1.toString();
    careTaker.placeVersion(stamp);

    //-- Assert
    expect(careTaker.getVersion(1)).to.be.undefined;
    expect(careTaker.getVersion(0)).to.not.be.undefined;
    expect(careTaker.getVersion(0)).to.equal(stamp);
  });

  it("Memento properly parsed with 3 scheduled classes", () => {
    //-- Arrange + Act
    testImport_Act("3Classes_3Days_SameRoom_ForMemento");
    const careTaker = new CareTaker();
    const schedule1 = new Schedule(getCourses(), getRooms(), 420);

    //-- Act
    const stamp = schedule1.toString();
    careTaker.placeVersion(stamp);
    const copyOfSchedule1 = new Schedule(getCourses(), getRooms(), 420);
    const secondCopyOfSchedule1 = new Schedule();
    secondCopyOfSchedule1.parse(stamp);

    //-- Assert
    expect(careTaker.getVersion(0).toString()).to.equal(stamp);
    expect(careTaker.getVersion(0).toString()).to.equal(
      copyOfSchedule1.toString(),
    );
    expect(secondCopyOfSchedule1).to.deep.equal(schedule1);
  });
});
