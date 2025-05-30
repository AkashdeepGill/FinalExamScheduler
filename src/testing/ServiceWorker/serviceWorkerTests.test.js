import { clean, importAllOnTestStart, generateSchedule } from "../../FinalExamScheduler.js";
import fs from "fs";
import '@vitest/web-worker'
import { vi } from 'vitest';
import Phase2Worker from "../../phase2worker.js?worker";

const testImport_Act = async (folderName, worker) => {
  const e = { encoding: "utf8", flag: "r" };

  // -- Arrange
  await importAllOnTestStart(
      fs.readFileSync(`src/testing/ServiceWorker/TestFiles/${folderName}/courseSchedule.txt`, e),
      fs.readFileSync(`src/testing/ServiceWorker/TestFiles/${folderName}/classList.txt`, e),
      fs.readFileSync(`src/testing/ServiceWorker/TestFiles/${folderName}/rooms.txt`, e),
      fs.readFileSync(`src/testing/ServiceWorker/TestFiles/${folderName}/specialCases.txt`, e),
      fs.readFileSync("src/testing/testingWeights.csv", e),
      worker
  );
  // Act
  generateSchedule();
};

const sleep = (t) =>
    new Promise((r) => {
      setTimeout(r, t);
    });

describe("Redux Weights Testing", function () {
  beforeEach(() => {
    clean();
  });

  it("Service Worker sends progress", async () => {
    // -- Arrange
    const progressUpdates = [];
    const worker = new Phase2Worker();
    worker.onmessage = (e) => {
        progressUpdates.push(e.data);
    };

    // -- Act
    await testImport_Act("WorkerProgress", worker);
    await sleep(100);

    // -- Assert
    expect(progressUpdates[0]).toEqual({
      "type": "progress",
      "data": 0
    });
    expect(progressUpdates[1]).toEqual({
      "type": "progress",
      "data": 33.33333333333333
    });
    expect(progressUpdates[2]).toEqual({
      "type": "progress",
      "data": 66.66666666666666
    });
  });
});