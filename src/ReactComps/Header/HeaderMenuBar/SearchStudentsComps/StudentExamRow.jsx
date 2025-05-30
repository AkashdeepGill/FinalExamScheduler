import React from "react";

class StudentExamRow extends React.Component {
  render() {
    return (
      <>
        <td>
          <p>{this.props.data[0][0]}</p>
          <p>{this.props.data[0][1]}</p>
        </td>
        <td>
          <p>{this.props.data[1][0]}</p>
          <p>{this.props.data[1][1]}</p>
        </td>
        <td>
          <p>{this.props.data[2][0]}</p>
          <p>{this.props.data[2][1]}</p>
        </td>
        <td>
          <p>{this.props.data[3][0]}</p>
          <p>{this.props.data[3][1]}</p>
        </td>
        <td>
          <p>{this.props.data[4][0]}</p>
          <p>{this.props.data[4][1]}</p>
        </td>
      </>
    );
  }
}

export default StudentExamRow;
