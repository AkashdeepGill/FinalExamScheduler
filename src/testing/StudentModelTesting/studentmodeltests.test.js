import {
    getRooms,
} from "../../FinalExamScheduler.js";
import "jsdom-worker";
import Course from "../../Models/Course.js";
import { Student } from "../../Models/Student.js";

describe("Student Model Testing", function () {

    const courseA = new Course("CLASS_A_");

    const courseB = new Course("CLASS_B_");

    const courseC = new Course("CLASS_C_");

    beforeEach(() => {
        courseA.examDay = 0;
        courseA.examTime = 0;

        courseB.examDay = 0;
        courseB.examTime = 0;

        courseC.examDay = 0;
        courseC.examTime = 0;
    })
    
    it("Add One Course test", async () => {
        //-- Arrange
        const student = new Student("1234");
        //-- Act
        student.addCourse(courseA);
        //-- Assert
        expect(student.courseGrid[0][0]).toEqual(["CLASS_A_"])
        expect(student.courses.get("CLASS_A_")).not.toBeUndefined();
    });
    it("Remove One Course test", async () => {
        //-- Arrange
        const student = new Student("1234");
        student.addCourse(courseA);
        //-- Act
        student.removeCourse(courseA);
        //-- Assert
        expect(student.courseGrid[0][0]).toEqual([])
        expect(student.courses.get("CLASS_A_")).toBeUndefined();
    });
    it("Add course that causes double booking", async () => {
        //-- Arrange
        const student = new Student("1234");
        student.addCourse(courseA);
        //-- Act
        student.addCourse(courseB);
        //-- Assert
        expect(student.courseGrid[0][0]).toEqual(["CLASS_A_", "CLASS_B_"]);
        expect(student.getDoubleBooked()).toEqual([["CLASS_A_", "CLASS_B_"]]);
    });
    it("Add course that causes multiple double bookings", async () => {
        //-- Arrange
        const student = new Student("1234");
        student.addCourse(courseA);
        student.addCourse(courseB);
        //-- Act
        student.addCourse(courseC);
        //-- Assert
        expect(student.courseGrid[0][0]).toEqual(["CLASS_A_", "CLASS_B_", "CLASS_C_"]);
        expect(student.getDoubleBooked()).toEqual([["CLASS_A_", "CLASS_B_"], ["CLASS_A_", "CLASS_C_"], ["CLASS_B_", "CLASS_C_"]]);
    });
    it("Remove course that caused multiple double bookings", async () => {
        //-- Arrange
        const student = new Student("1234");
        student.addCourse(courseA);
        student.addCourse(courseB);
        student.addCourse(courseC);
        //-- Act
        student.removeCourse(courseA);
        //-- Assert
        expect(student.courseGrid[0][0]).toEqual(["CLASS_B_", "CLASS_C_"]);
        expect(student.getDoubleBooked()).toEqual([["CLASS_B_", "CLASS_C_"]]);
    });
    it("Reschedule course", async () => {
        //-- Arrange
        const student = new Student("1234");
        student.addCourse(courseA);
        student.addCourse(courseB);
        courseA.examDay = 1
        courseA.examTime = 1
        //-- Act
        student.updateCourse(courseA, 1, 1);
        //-- Assert
        expect(student.courseGrid[0][0]).toEqual(["CLASS_B_"]);
        expect(student.courseGrid[1][1]).toEqual(["CLASS_A_"]);
        expect(student.getDoubleBooked()).toEqual([]);
    });

    it("Get courses on day", async () => {
        //-- Arrange
        const student = new Student("1234");
        student.addCourse(courseA);
        student.addCourse(courseB);
        courseC.examDay = 0
        courseC.examTime = 1
        student.addCourse(courseC);
        //-- Act
        const courses = student.coursesOnDay(0);
        //-- Assert
        expect(courses).toEqual(["CLASS_A_","CLASS_B_", "CLASS_C_"]);
    });
});
