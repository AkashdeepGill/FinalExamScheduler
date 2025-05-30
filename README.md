# Final Exam Scheduling Tool (FEST)

This project is intended to provide a software tool to the Registrar's Office to help them create final exam schedules.

The tool:

- Helps the Registrar's Office produce optimized exam schedules.
- Is available via a website hosted through GitLab
- Data loaded in the program should remains on the user's local machine and is not transmitted elsewhere.
- Complies with MSOE policies and practices regarding final exam scheduling

## Catalog Information

### Culminating Assessments

A culminating assessment is required in every course. The type of culminating assessment should correspond with what is specified in the departmental course outline and be announced to the class at the beginning of the term. Final examinations must occur in the two-hour block that has been assigned by the Registrar's Office. For specific courses, a final presentation, project, or other summative assessment may be substituted for a final examination, as determined by the program, and approved by the chair. The chair will notify the Registrar's Office which courses will not be utilizing a final examination period. Undergraduate culminating assessments may not count for more than 40 percent of the final grade.

The final examination period will be Monday-Friday of the sixteenth week during the fall and spring semesters, the seventh week of summer subterms 1 and 2, and the thirteenth week of the full summer subterm. Graduate subterms will include an optional exam week in week 8.

Final exams will be held between 8 a.m. and 10:00 p.m. with, in general, 60 minutes between each final exam period:

- 8:00 - 10:00 a.m.
- 11:00 a.m. - 1:00 p.m.
- 2:00 - 4:00 p.m.
- 5:30 - 7:30 p.m.
- 8:00 - 10:00 p.m.

Exams for classes meeting only on Saturday will be held on Saturday of the sixteenth week. No undergraduate classes will be held during the exam week. Voluntary (optional) class review sessions may be held during the exam week. Students are required to be available for their scheduled exam times as published on the MSOE website.

Students who have conflicting final exams are responsible for contacting the instructors and resolving the issue as soon as they are aware of the issue, but no later than ten working days prior to the start of exam week (the end of week 13).

If local or national emergencies prevent the university from being open on one or more days of exam week, the exams on those days may be cancelled, rescheduled, or moved to a different modality. When possible, the campus community will be notified of a university closure by 5:45 a.m. on the day of the closure or by 3:00 pm for exams beginning at 5:00 p.m. or later.

### More Than Two Final Exams in One Day

If a student has more than two final examinations scheduled on one day, students may request to reschedule an exam. Some requests may not be able to be accommodated. The request must be made at least ten working days prior to the start of exam week (by the end of week 13). The student must reach out to the Registrar's Office, who will verify the exam schedule and notify the affected faculty, copying the student. The student and faculty are expected to work together to resolve the issue, but if the situation cannot be resolved, the student should petition the chair(s) of the school or department overseeing the courses.

## Additional Info

- If a course meets at least three days a week at the same time, the final exam will be scheduled based on the following matrix. The left side is the time it meets during the week and the right side is the exam time and day. Courses that meet 2 days a week at the same time are also attempted to be scheduled at the same time. They can not always as a class that meets 3+ times takes priority:
    - 8 a.m. -> 8 a.m.-10 a.m. Monday
    - 9 a.m. -> 8 a.m.-10 a.m. Tuesday
    - 10 a.m. -> 8 a.m.-10 a.m. Wednesday
    - 11 a.m. -> 8 a.m.-10 a.m. Thursday
    - noon -> 8 a.m.-10 a.m. Friday
    - 1 p.m. -> 2 p.m.-4 p.m. Monday
    - 2 p.m. -> 2 p.m.-4 p.m. Tuesday
    - 3 p.m. -> 2 p.m.-4 p.m. Wednesday
    - 4 p.m. -> 2 p.m.-4 p.m. Thursday
- If the course meets in the same room at least three days a week, then the exam will be scheduled in that room, otherwise a different room may need to be identified (since a room the class meets in may not be a room acceptable for examination).
- The 11 a.m. - 1 p.m. timeslot is for final exams that don't meet the above scheduling criteria or for classes where that have been identified as having a common final exam time across all sections of the course. Note: as needed, the 5:30 p.m.-7:30 p.m. times lot may also be used.
- Friday 5:30 p.m. - 7:30 p.m. should not be used.
- Friday 11 a.m. - 1 p.m. should be avoided, if possible.

## Data Files

This section describes the file formats for this tool. There are a total of four files that can be uploaded:

- **Room Capacities** - specifies the number of students each room can accommodate. A room's capacity is 0 if it is not suitable for examination.
- **Special Treatment Courses** - specifies which courses have no final, are a common final, are cross-listed, or are a priority exam
- **Course Schedule** - specifies the room in which each course is scheduled, and what days and times
- **Class List** - list of all students registered in sections of courses

The first two files are stored in the repo and will default to the stored files if no file is uploaded by the user.
The last two files will always be uploaded by the user.

All these files will contain lines of tab-separated values. The first line contains the column names.

In addition, there is a fifth file for the weights. This contains a list of weight names and their values comma seperated.

### Room Capacities

This file specifies the number of students that can fit in each room. In addition to specify each physical room, it includes entries for virtual rooms that are combinations of physical rooms.

- `room_nm` - Room name
- `capacity` - Number of students that can fit
- `room_dep1` - First room dependency (if applicable)
- `room_dep2` - Second room dependency (if applicable)
- `room_dep3` - Third room dependency (if applicable)

Example:

```
room_nm	capacity	room_dep1	room_dep2	room_dep3
DH110	32
L308	24
L309	42
L308/309	66	L308	L309
```

The first three entries are physical rooms and do not have room dependency entries. The `L308/309` room is a combination of `L308` and `L309`. FEST ensures that if `L308/309` is scheduled, `L308` and `L309` can not be scheduled at the same time. The reverse is also true.

### Special Treatment Courses

This file specifies which courses have no final exam or a common final exam.

- `crs_cdes` - Comma separated list of Section/Course codes
    - If no section number is present, then this entry applies to all sections being offered
    - If multiple sections/courses should be combined, they can be placed in a comma separated list (SWE 3710 011,SWE 3720 011)
- `final_type` - Type of final exam (optional)
- `yr_cde` - Academic year (optional)
- `trm_cde` - Term (optional)
- `isPriority` - 1 in this column if it is a priority exam (optional)

The `final_type` column will contain the following values:

- `c` or `common` - indicates the course should have a common final exam scheduled. You can force multiple classes to have common finals at the same time.
- `n` or `none` - indicates the course should not have a final exam scheduled
- `x` or `crosslisted` - indicates the multiple sections/courses should be scheduled at the same time. This is different than a common final since it may be possible to schedule the final at the standard time.
- If the entry is blank, then the final exams for the course should be scheduled in the standard way

Note that the `yr_cde` and `trm_cde` columns may not be contained in the file at all. Even if they are present, specific rows may have blanks for the year or term.

- If the `yr_cde` is not specified, then the course should have a common final scheduled regardless of year
- If the `trm_cde` is not specified, then the course should have a common final scheduled regardless of term

Example:

```
crs_cdes	final_type	yr_cde	trm_cde   isPriority
CSC  1110	common
SWE  2410	c	2024	S1
CSC  3320	common		S2
CSC  4601 111,CSC  5601 301	crosslisted
SWE  3710 111,SWE  3720 111	x
SWE  3710 121,SWE  3720 121	x
SWE  4901	n
SWE  3020 121       1
MA   110, MA   110A common 2024 S1
```

Here

- CSC1110 should always have a common final scheduled.
- SWE2410 should only have a common final scheduled if you are creating the final exam schedule for Fall 2024.
- CSC3320 should only have a common final scheduled if you are creating the final exam schedule for a Spring term.
- Section 111 of CSC4601 and section 301 of CSC5601 are cross-listed courses. The two courses meet at essentially the same time and should be treated as if they are the same course.
- Section 111 of SWE3710 and SWE3720 are cross-listed courses.
- Section 121 of SWE3710 and SWE3720 are cross-listed courses.
- SWE4901 should never have a final exam scheduled.
- SWE 3020 121 should be treated as a priority exam

### Course Schedule

The room schedule file is and input file, but portions are included in the output file.

- `yr_cde` - Academic year
- `trm_cde` - Term
- `crs_cde` - Section code
- `room_cde` - Room where class is scheduled
- `monday_cde` - Blank if doesn't meet that day
- `tuesday_cde` - Blank if doesn't meet that day
- `wednesday_cde` - Blank if doesn't meet that day
- `thursday_cde` - Blank if doesn't meet that day
- `friday_cde` - Blank if doesn't meet that day
- `saturday_cde` - Blank if doesn't meet that day
- `sunday_cde` - Blank if doesn't meet that day
- `begin_tim` - Beginning time for section meeting
- `end_tim` - Ending time for section meeting
- `examRoom` - Typically blank for input and used to specify the room for the exam when output file generated (see below)
- `examDay` - Typically blank for input and used to specify day of exam when output file generated (see below)
- `examTime` - Typically blank for input and used to specify time of exam when output file generated (see below)
- `forceTime` - Used to force a particular exam time for a section (see below)

Valid values for `examDay` are `M`, `T`, `W`, `R`, `F`, `S` (Saturday), and `N` (no final). Valid values for `examTime` are `08:00`, `11:00`, `14:00`, `17:30`, `20:00`, and `N` or blank (no final).

It is common for a section to require multiple lines to specify all of the meeting times/locations. For example:

```
yr_cde	trm_cde	room_cde	crs_cde	monday_cde	tuesday_cde	wednesday_cde	thursday_cde	friday_cde	saturday_cde	sunday_cde	begin_tim	end_tim
2022	Q1	DH110	SE   3821 011	M			R	F			1/1/1900 11:00:00	1/1/1900 11:50:00
2022	Q1	DH110	SE   3821 011			W					1/1/1900 11:00:00	1/1/1900 12:50:00
```

Also, keep in mind that multiple sections may share the same room at times. For example:

```
yr_cde	trm_cde	room_cde	crs_cde	monday_cde	tuesday_cde	wednesday_cde	thursday_cde	friday_cde	saturday_cde	sunday_cde	begin_tim	end_tim
2022	Q1	DH110	SE   3821 012			W					1/1/1900 08:00:00	1/1/1900 09:50:00
2022	Q1	DH110	SE   3821 012	M			R	F			1/1/1900 11:00:00	1/1/1900 11:50:00
```

Here SE3821-011 and SE3821-012 share the same lecture time/room but have different lab meeting times.

```
yr_cde	trm_cde	room_cde	crs_cde	monday_cde	tuesday_cde	wednesday_cde	thursday_cde	friday_cde	saturday_cde	sunday_cde	begin_tim	end_tim
2022	Q1	CC121	ME   1601 011			W					1/1/1900 08:00:00	1/1/1900 09:50:00
2022	Q1	CC121	ME   1601 011	M				F			1/1/1900 08:00:00	1/1/1900 08:50:00
2022	Q1	CC121	ME   1601 012	M				F			1/1/1900 08:00:00	1/1/1900 08:50:00
2022	Q1	CC121	ME   1601 012				R				1/1/1900 08:00:00	1/1/1900 09:50:00
```

#### Forcing Specific Exam Times

The `forceTime` column can be used by a user to signal that a specific exam time should be used for a given section. In order to "hardcode" a specific exam time for a section, the `forceTime` field must contain a `1` and the `examDay` and `examTime` fields must have valid entries for all lines in the input file related to the section. If the exam time is "hardcoded" and the `examRoom` is non-blank, the exam should be scheduled in the specified room.

#### Course Schedule Output File

The output of FEST is a new Room Schedule file that contains entries for `courseCode`, `instructor`, `examDay`, `examTime`, `examRoom` that specify where and when the final exam for that section is scheduled. These columns have the same specifications as the course schedule input file. This is a condensed version that does not include details the registrar does not need.

### Class List

The class list file contains a line for each student enrolled in each section of a course. The `lead_instructor` and `crs_enrollment` values are duplicated in every line for a given section of a course, and you can assume that the value is consistent for all lines representing a section of a course.

- `id_num` - student ID (599899)
- `yr_cde` - Academic year (2024)
- `trm_cde` - Term (Q1, Q2, Q3, Q4, S1, S2, S3)
- `crs_cde` - Section code (AC 1103 001)
- `lead_instructr_id` - instructor ID (261327)
- `crs_enrollment` - number of students enrolled in section

```
id_num  yr_cde  trm_cde crs_cde lead_instructr_id       crs_enrollment
111111  2022    Q1      AC   1103 001   261327  20
122222  2022    Q1      AC   1103 001   261327  20
123333  2022    Q1      AC   1103 001   261327  20
124442  2022    Q1      AC   1103 001   261327  20
...
122444  2022    Q1      AC   1103 001   261327  20
144411  2022    Q1      AC   1103 001   261327  20
111444  2022    Q1      AC   1103 001   261327  20
114441  2022    Q1      AC   1103 001   261327  20
888111  2022    Q1      AC   1103 001   261327  20
188811  2022    Q1      AC   4204 001   590312  13
111888  2022    Q1      AC   4204 001   590312  13
```

## Determing the best Schedule

In order to evaluate how good a given final exam schedule is, different scenarios are weighted. These values are summed up to find the schedule with the lowest weight. These cases are defined in `weights.csv`.

To see exactly how this process works, see the Scheduling Algorithim page of the wiki.  
https://gitlab.com/msoe.edu/sdl/sdl/stat-group/final-exam-scheduler/-/wikis/Scheduling-Algorithim

## Testing Framework

Because the weights in `weights.csv` are subject to change, tests all pull weights from `testingWeights.csv` to ensure tests will pass even when weights change.

A testing pipeline is set up. This is done through `.gitlab-ci.yml`. By including this file in the project, GitLab will automatically start using the pipeline.

Every time code is pushed, wether or not it is in a merge request, the pipeline will run. It runs every file labeled as a test and every test in those files. If a test fails, the code will still merge, but the pipeline will show as failing. You can look at which tests failed from GitLab. It is important that these tests always pass, as they insure exisiting functionality is not lost.

Note: `App.test.js` was removed as there were not tests. This is a file React geneartes when creating an application.

## Redux Configuration

### Reducer Name Abbreviations

| Redux Abbreviation     | Undesirable Scenario                  |
| ---------------------- | ------------------------------------- |
| noAvailableTime        | No Available Time                     |
| roomDoubleBooked       | Room Time Double Booked               |
| roomTooSmall           | Room Too Small                        |
| instructorDoubleBooked | Instructor Double Booked              |
| studentDoubleBooked    | Student Double Booked                 |
| threeSameDayExams      | Student Has 3 Exams Same Day          |
| sameDayPriorityExams   | Student has 2 Priority Exams Same Day |
| lateCommonFinal        | Common Final at 5:30                  |
| fridayCommonFinal      | Common Final on Friday                |

### Reducer Configuration

#### Attributes

`fullName`: The unabbreviated version of the scenario name<br>
`penalty`: The point penalty for each instance of this scenario<br>
`instances`: An array of each instance for this scenario where each object contains relevant information

## Deployment

`.gitlab-ci.yml` contains details on deployment. By including this file in the project, GitLab will automatically attempt to deploy the web page.

`package.json` specifies a "homepage" attribute. This is the url to reach the deployed site. Currently, it is set to "https://msoe.edu.gitlab.io/sdl/sdl/stat-group/final-exam-scheduler". This url is also specficed in the settings in GitLab. To access, you need permissions to see and edit. The settings pages also contains additonal domain info and cerfticate info.

## Additional Documentation
[Class Diagram](docs/ClassDiagram.md)

[Deployment Process](docs/DeploymentProcess.md)

[Testing Documentation](docs/Testing.md)

[Redux Documentation & Tech Debt](docs/ReduxDebt.md)

[Sequence Diagrams](docs/SequenceDiagrams.md)

[Project Dependencies](docs/ProjectDependencies.md)