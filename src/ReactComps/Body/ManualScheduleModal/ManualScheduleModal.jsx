import React from "react";
import {
  getRooms,
  scheduleExam,
  weightReduxExamTime,
} from "../../../FinalExamScheduler.js";
import ClassDescriptionTable from "./ModalComponents/ClassDescriptionTable.jsx";
import ClassMeetingTimes from "./ModalComponents/ClassMeetingTimes.jsx";
import AvailableRoomsTable from "./ModalComponents/AvailableRoomsTable.jsx";
import { useDispatch } from "react-redux";
import { scheduleCourse } from "../../../Redux/Slices/courseSlice.js";
import './ManualScheduleModal.css'
export default function ManualScheduleModal(props) {
  const course = props.course;
  const dispatch = useDispatch();
  /**
   * Author: Alex Ottelien
   */

  const scheduleInRoom = (roomNumber, day, time) => {
    const room = getRooms().get(roomNumber);
    console.log(`Scheduling in Room: ${roomNumber}`);
    const copyCourse = { ...course };
    copyCourse.examDay = day;
    copyCourse.examTime = time;
    copyCourse.examRoom = roomNumber;
    weightReduxExamTime(day, time, room, copyCourse);
    scheduleExam(copyCourse, day, time, room, true);
    dispatch(
      scheduleCourse({
        courseId: course.courseCode,
        day: day,
        time: time,
        room: roomNumber,
      }),
    );
    props.onClose();
  };

  return (
    <div className="manual-schedule-overlay">
      <div className="overlay-content">
        <div className="top-tables">
          <ClassDescriptionTable course={course} closeModal={props.onClose} />
          <ClassMeetingTimes course={course} />
        </div>
        <AvailableRoomsTable
          rooms={getRooms()}
          course={course}
          scheduleInRoom={scheduleInRoom}
          closeModal={props.onClose}
        />
      </div>
    </div>
  );
}
