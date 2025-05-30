import {
  getCourse,
  getCourses,
  importCourses,
  importSpecialTreatmentCourses,
  updateSpecialCourses,
  clean,
} from "../../FinalExamScheduler.js";
import { StudentInstructorCatalog } from "../../Models/StudentInstructorCatalog.js";
import { expect } from "chai";
import fs from "fs";

describe("SpecialCaseTests", function () {
  /**
   * Clean up the final exam scheduler for every new test
   */
  beforeEach(() => {
    clean();
  });

  it("All Normal Classes", async function () {
    //Arrange
    const SI_Catalog = new StudentInstructorCatalog();
    const e = { encoding: "utf8", flag: "r" };
    await importCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NormalClasses/courseSchedule.txt",
        e,
      ),
    );
    SI_Catalog.setCourseMap(getCourses());
    await SI_Catalog.importClassListRawData(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NormalClasses/classList.txt",
        e,
      ),
    );
    SI_Catalog.updateCoursesWithClassList();
    SI_Catalog.refreshCatalogs();
    await importSpecialTreatmentCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NormalClasses/specialCase.txt",
        e,
      ),
    );

    //Act
    updateSpecialCourses();

    //Assert
    expect(getCourse("AE   4712 011")).to.not.be.undefined;
    expect(getCourse("UX   3011 001")).to.not.be.undefined;
    expect(getCourse("TC   3010 101")).to.not.be.undefined;
  });

  it("No Student Class", async function () {
    //Arrange
    const SI_Catalog = new StudentInstructorCatalog();
    const e = { encoding: "utf8", flag: "r" };
    await importCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoStudentClass/courseSchedule.txt",
        e,
      ),
    );
    SI_Catalog.setCourseMap(getCourses());
    await SI_Catalog.importClassListRawData(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoStudentClass/classList.txt",
        e,
      ),
    );
    SI_Catalog.updateCoursesWithClassList();
    SI_Catalog.refreshCatalogs();
    await importSpecialTreatmentCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoStudentClass/specialCase.txt",
        e,
      ),
    );

    //Act
    updateSpecialCourses();

    //Assert
    expect(getCourse("AE   4712 011")).to.not.be.undefined;
    expect(getCourse("UX   3011 001")).to.not.be.undefined;
    expect(getCourse("TC   3010 101")).to.be.undefined;
  });

  it("No Final Class", async function () {
    //Arrange
    const SI_Catalog = new StudentInstructorCatalog();
    const e = { encoding: "utf8", flag: "r" };
    await importCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoFinalClass/courseSchedule.txt",
        e,
      ),
    );
    SI_Catalog.setCourseMap(getCourses());
    await SI_Catalog.importClassListRawData(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoFinalClass/classList.txt",
        e,
      ),
    );
    SI_Catalog.updateCoursesWithClassList();
    SI_Catalog.refreshCatalogs();
    await importSpecialTreatmentCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoFinalClass/specialCase.txt",
        e,
      ),
    );

    //Act
    updateSpecialCourses();

    //Assert
    expect(getCourse("AE   4712 011")).to.be.undefined;
    expect(getCourse("UX   3011 001")).to.not.be.undefined;
    expect(getCourse("TC   3010 101")).to.not.be.undefined;
  });

  it("No Final And No Student Class", async function () {
    //Arrange
    const SI_Catalog = new StudentInstructorCatalog();
    const e = { encoding: "utf8", flag: "r" };
    await importCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoFinalAndStudentClass/courseSchedule.txt",
        e,
      ),
    );
    SI_Catalog.setCourseMap(getCourses());
    await SI_Catalog.importClassListRawData(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoFinalAndStudentClass/classList.txt",
        e,
      ),
    );
    SI_Catalog.updateCoursesWithClassList();
    SI_Catalog.refreshCatalogs();
    await importSpecialTreatmentCourses(
      fs.readFileSync(
        "src/testing/SpecialCaseTests/TestFiles/NoFinalAndStudentClass/specialCase.txt",
        e,
      ),
    );

    //Act
    updateSpecialCourses();

    //Assert
    expect(getCourse("AE   4712 011")).to.be.undefined;
    expect(getCourse("UX   3011 001")).to.not.be.undefined;
    expect(getCourse("TC   3010 101")).to.be.undefined;
  });
}); //end test suite
