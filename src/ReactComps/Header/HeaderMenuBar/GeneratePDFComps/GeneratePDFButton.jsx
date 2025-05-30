import React from "react";
import { useState } from "react";
import { exportCoursesAsPDF } from "../../../../WishTheyWereReactComponents/uiFunction";
import OverlayInput from "../OverlayInput";
import FullPageLoadingIcon from "./FullPageLoadingIcon";
export default function GeneratePDFButton() {
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showPdfOverlay, setShowPdfOverlay] = useState(false);

  function generatePdf(title) {
    setShowPdfOverlay(false);
    setPdfGenerating(true);
    exportCoursesAsPDF(title).finally(() => {
      setPdfGenerating(false);
    });
  }

  return (
    <>
      {showPdfOverlay && (
        <OverlayInput
          onEnter={generatePdf}
          onClose={() => setShowPdfOverlay(false)}
          title={"Exam PDF Title"}
          description={"Exam Schedule Title"}
          forceNumber={false}
        />
      )}
      {pdfGenerating && (
        <FullPageLoadingIcon title={"Your PDF is Generating..."} />
      )}
      <button onClick={() => setShowPdfOverlay(true)}>
        Generate Schedule PDF
      </button>
    </>
  );
}
