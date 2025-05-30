import React from "react";
import { indexToDay, indexToTime } from "../../../../Import/FileIO.js";
import { weightExamRoomTime } from "../../../../FinalExamScheduler.js";
import TableHeaderBar from "../../ExportTables/TableComponents/TableHeaderBar.jsx";
import './ModalComponents.css'
export default function AvailableRoomsTable(props) {
  const course = props.course;
  const rooms = props.rooms;
  return (
    <div id="Available-Rooms-Div" className="table-container">
      <TableHeaderBar label = {"Available Rooms"}></TableHeaderBar>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Capacity</th>
              <th>Exam Day</th>
              <th>Exam Time</th>
              <th>Undesirable Aspects</th>
            </tr>
          </thead>
          <tbody id="availableRooms" className="classesAvaliable">
            {rooms &&
              Array.from(rooms.values()).map((room) =>
                room.exams.map((dayExams, day) =>
                  dayExams.map((exam, time) => {
                    if (!exam) {
                      const weights = weightExamRoomTime(
                        day,
                        time,
                        room,
                        course,
                      )[1];
                      let formattedWeights = "";
                      weights.forEach((numOccurrences, aspect) => {
                        formattedWeights += `${aspect} (${numOccurrences}), `;
                      });
                      if (formattedWeights.length > 0) {
                        formattedWeights = formattedWeights.slice(0, -2);
                      }
                      return (
                        <tr
                          key={`${room.roomNumber}-${day}-${time}`}
                          className={"available-room"}
                          onClick={() =>
                            props.scheduleInRoom(room.roomNumber, day, time)
                          }
                        >
                          <td>{room.roomNumber}</td>
                          <td>{room.capacity}</td>
                          <td>{indexToDay(day)}</td>
                          <td>{indexToTime(time)}</td>
                          <td>{formattedWeights}</td>
                        </tr>
                      );
                    }
                    return null;
                  }),
                ),
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
