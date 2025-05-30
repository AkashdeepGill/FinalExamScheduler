import HeaderMenuBar from "./HeaderMenuBar/HeaderMenuBar";
import './Header.css'
export default function Header({}) {
  return (
    <header id="App-header">
      <span id="Header-Text">Final Exam Scheduler</span>
      <HeaderMenuBar></HeaderMenuBar>
    </header>
  );
}
