import './GeneratePDFComps.css'
export default function FullPageLoadingIcon(props) {
  return (
    <div className="scroll-container">
      <div className="scroll-icon">&#8595;</div>
      <div className="text">{props.title}</div>
    </div>
  );
}
