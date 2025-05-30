export default function SpecialCasesOverlayColumn(props){
    return (
        <div className={'special-cases-overlay-column'}>
            <span className={'special-cases-overlay-column-title'}>{props.title}</span>
            <div className={'fill-width special-cases-column-container'}>
                {props.courses.map((course, index) => {
                    return (
                        <div key={`${course.courseCode}-${index}`} className={'special-case'}>
                            <span>{course.courseCode}</span>
                            <span onClick={() => props.removeCourse(course)} className={'special-case-trash-icon'}>🗑️</span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}