import { indexToDay, indexToTime } from "../../../../Import/FileIO.js";
import './ModalComponents.css'
export default function ClassMeetingTimes({ course }) {
  const splitClasses = (course) => {
    let classesAtTimes = new Map();
    for (let i = 0; i < course.day.length; i++) {
      if (
        course.roomCode[i] !== undefined &&
        course.roomCode[i] !== null &&
        course.startTime[i] !== undefined &&
        course.endTime[i] !== undefined
      ) {
        const key =
          course.roomCode[i] +
          "\t" +
          course.startTime[i] +
          "\t" +
          course.endTime[i];
        if (classesAtTimes.has(key)) {
          classesAtTimes.set(key, classesAtTimes.get(key) + course.day[i]);
        } else {
          let classData =
            "\n" +
            course.yearCode +
            "\t" +
            course.termCode +
            "\t" +
            course.roomCode[i] +
            "\t" +
            course.courseCode +
            "\t";
          for (let x = 0; x < i; x++) {
            classData += "\t";
          }
          classData += course.day[i];
          classesAtTimes.set(key, classData);
        }
      }
      classesAtTimes.forEach((value, key) => {
        classesAtTimes.set(key, classesAtTimes.get(key) + "\t");
      });
    }
    classesAtTimes.forEach((value, key) => {
      const data = key.split("\t");
      classesAtTimes.set(
        key,
        classesAtTimes.get(key) +
          "\t" +
          data[1] +
          "\t" +
          data[2] +
          "\t" +
          (course.examRoom !== undefined ? course.examRoom : "") +
          "\t" +
          (course.examDay !== undefined ? indexToDay(course.examDay) : "") +
          "\t" +
          (course.examTime !== undefined ? indexToTime(course.examTime) : "") +
          "\t" +
          (course.forceTime !== undefined ? course.forceTime : ""),
      );
    });
    return Array.from(classesAtTimes.values());
  };

  const classData = splitClasses(course);
  return (
    <table>
      <thead>
        <tr>
          <th>Room</th>
          <th>Day 1</th>
          <th>Day 2</th>
          <th>Day 3</th>
          <th>Day 4</th>
          <th>Day 5</th>
          <th>Day 6</th>
          <th>Day 7</th>
          <th>Start Time</th>
          <th>End Time</th>
        </tr>
      </thead>
      <tbody id="unscheduledRoomTimes">
        {classData.map((course, index) => {
          const data = course.split("\t");
          return (
            <tr key={`${data[3]}-${index}`}>
              <td>{data[2]}</td>
              {[4, 5, 6, 7, 8, 9, 10].map((i) => (
                <td key={i}>{data[i]}</td>
              ))}
              {[11, 12].map((i) => {
                const timeInfo = data[i].split(" ")[1];
                let time;
                if (!timeInfo) {
                  time = "No Meeting Time";
                } else if (parseInt(timeInfo.split(":")[0]) > 12) {
                  const t =
                    parseInt(timeInfo.split(":")[0]) -
                    12 +
                    ":" +
                    timeInfo.split(":")[1];
                  time = t + " PM";
                } else {
                  time = timeInfo + " AM";
                }
                return <td key={`${i}-${data[3]}`}>{time}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
