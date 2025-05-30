import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TopMenuBar from "../../ReactComps/Body/MenuBar/TopMenuBar.jsx";
import { vi } from 'vitest';
import chai from "chai";
import chaiWaitFor from "chai-wait-for";

chai.use(chaiWaitFor);
const waitFor = chaiWaitFor.bindWaitFor({
  // If no assertion attempt succeeds before this time elapses (in milliseconds), the waitFor will fail.
  timeout: 4000,
  // If an assertion attempt fails, it will retry after this amount of time (in milliseconds)
  retryInterval: 100,
});


test("Generate Schedule Clicked", async () => {
  const mockGenClick = vi.fn();

  // render(<onGenerateClickSpy onGenerateClick={mockGenClick} />);
  // const generateScheduleButton = screen.getByTestId("generateScheduleButton");
  // await userEvent.click(generateScheduleButton);
  //
  // expect(onGenerateClickSpy).toHaveBeenCalledWith(mockGenClick);
});