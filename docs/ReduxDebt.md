# Introduction

This documentation discusses the current technical debt related to redux that has been accrued within the project. 

# Redux Implementation

Our current Redux slices hold the following information:

1) Scheduling conflicts
2) Scheduled and Unscheduled courses
3) Progress bar state

This data is used to update our React components' states. We use update and use this data in multiple ways, so lets go through how we interact with each slice.

## Generated States Slice

The generated states slice (or `generatedStatesSlice.js`) holds all of our scheduling conflicts. These include conflicts such as double booked students or a room being too small. It also holds the weight of each conflict. 

### Reducers

The slice has the following reducers:

#### `addWeightedInstance`

**Description:** Adds a conflict to the redux state

**Example call:**
```
 store.dispatch(
   addWeightedInstance({
     title: "studentDoubleBooked",
     courses: [course, courseCode],
     instance: {
       studentId: student.studentID,
       Course_1_Code: course,
       Course_2_Code: courseCode,
      },
     }),
   );
```

### `removeWeightedInstance`

**Description:** Removes all conflicts that are associated with the given course from the state

**Example Call:**

```
store.dispatch(
   removeWeightedInstance({
     course: courseCodeToUnschedule 
  }));
```

### `resetGeneratedStates`

**Description:** Remove all conflicts from the state

**Example Call:**

```
store.dispatch(resetGeneratedStates());
```

#### `updateWeightPenalty`

**Description:** Updates the penalty weight of the given conflict

**Example Call:**

```
dispatch(updateWeightPenalty({ title: name, value: 0}));
```

### Where the data is updated

Currently, there are two methods where conflicts are added which are both in FinalExamScheduler.js. The method `weightAllRedux()` handles adding all of the initially generated conflicts, while `weightReduxExamTime()` adds any conflicts caused by manually scheduling an exam. The only method that removes individual conflicts is `unscheduleExam()`, but the `clear()` method makes a call to reset the entire slice. Finally, updating a penalty weight is done in USRow.jsx.

### Where the data is used

Each type of scheduling conflict has its own table that displays information about each instance of that conflict. This data is being taken from redux and is being mapped to those tables. Within USRow.jsx there is the following line of code:

`const reducer = useSelector((state) => state.generatedWeights[name]);`

This code essentially subscribes the React component to a specific section of data within the generated states slice. Whenever the state data in this section is updated, then the component will automatically refresh as if you were updating a local state variable. The variable _name_ is a prop passed into USRow that determines which section of data that the component is subscribing to. The component can then read any data that it has subscribed to. For example, USRow.jsx uses the following code to display the overall weight of a conflict:

`<td>{reducer.instances.length * reducer.penalty}</td>`

As you can see, the component is directly accessing the data from the section of the redux slice it subscribed to. If the penalty of this conflict is updated in redux, the component will be refreshed to reflect that.

USRow.jsx then passes `reducer.instances` to a USInstancesTable component prop where the conflict instances gets mapped to an HTML table. Here is an example of USInstancesTable building it's table headers based on its given data (_data_ is the prop that USRow uses to pass the conflict instances to USInstancesTable):

```
const attributes = data.length > 0 ? Object.keys(data[0]) : [];

<tr>
  {attributes.map((attribute, index) => (
    <th key={index}>{attribute.replace(/_/g, " ")}</th>
   ))}
</tr>
```

## Course Slice

The course state slice (or `courseSlice.js`) is holds all of our courses that should be displayed in the scheduling tables. The data it holds is broken up into a list of currently scheduled courses and unscheduled courses. This data is used by the Scheduling Table react components to display the correct courses in each table.

### Reducers

The course slice has the following reducers:

#### `addCourse`

**Description:** Adds a course to either the scheduled course list or unscheduled course list based on if the given course has a non-null exam time attribute.

**Example call:** 

```
store.dispatch(
  addCourse(
    { id: key, courseObj: value }
  ));
```

#### `scheduleCourse`

**Description:** Removes a course from the unscheduled course list, updates the course with the given new exam information, then adds it to the scheduled courses list.

**Example call:**

```
dispatch(
      scheduleCourse({
        courseId: course.courseCode,
        day: day,
        time: time,
        room: roomNumber,
      }),
    );
```

#### `unscheduleCourse`

**Description:** Removes a course from the scheduled course list, and all removes any crosslisted and common finals that course is linked with from the scheduled course list. Adds all of the courses that were removed from the scheduled course list to the unscheduled course list.

**Example call:**

```
dispatch(unscheduleCourse({ courseId: course.courseCode }));
```

#### `resetCourseSlice`

**Description:** Deletes all courses in the redux slice

**Example call:**

```
store.dispatch(resetCourseSlice());
```

### Where the data is updated

We initially add all of the courses to the redux slice once the service worker has finished scheduling. This is done in the `generateSchedule()` method within FinalExamScheduler.js. The `unscheduleCourse` reducer is only called from ScheduledTable.jsx when the "X" on a course in the scheduled course table is clicked. Finally, the `scheduleCourse` reducer is used within ManualScheduleModal.jsx when the user selects a room to place an exam in.


### Where the data is used

The data in the scheduledCourses list of the redux slice is used by ScheduledTable.jsx to display the currently scheduled courses. The data in the unscheduledCourses list of the redux slice is used by UnscheduledTable.jsx to display the currently unscheduled courses. 


# Overlapping Logic

The main problem with the current redux implementation is overlapping logic with some vanilla js scheduling functions.

## Exam weighting overlap

Currently, the service worker will weight all of the classes to generate a schedule then pass that schedule back to the main JS thread. Once that happens, we call `weightAllRedux()` within FinalExamScheduler.js to add all of the scheduling conflicts to redux. The problem is to do that we first need to reweight all of the courses to find the conflicts that they initially caused so that they can be added to redux. We are essentially doing the same weighting function twice. It would be more efficient for the service worker to store all of the conflicts when scheduling itself then pass those back to the main thread. If that was the case, then we could just add all of the conflicts directly to redux without needing to find them ourselves.

Next, there is the overlap between `weightReduxExamTime()` and `weightExamRoomTime()`. The latter function is used by the ManualScheduleModal to display the conflicts that would be caused by scheduling an exam in a specific room and time. The method `weightReduxExamTime()` is used to add any conflicts found by scheduling an exam at a specific room, day, and time to redux. They technically have slightly different responsibilities but they have a lot of repeated code.

Finally, whenever we schedule or unschedule a room after initial generation we then need to do the same operation on our local course map and our redux courses. 


