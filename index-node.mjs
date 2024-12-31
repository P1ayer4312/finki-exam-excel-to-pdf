import * as XLSX from "xlsx";
import * as fs from "node:fs/promises";
import ConvertMergesToCellData from "./src/functions/ConvertMergesToCellData.js";
import GetYears from "./src/functions/GetYears.js";
import ParseUnscheduledSubjects from "./src/functions/ParseUnscheduledSubjects.js";
import GetLocationsAndTime from "./src/functions/GetLocationsAndTime.js";
import GetLargeCells from "./src/functions/GetLargeCells.js";
import GetYearByColor from "./src/functions/GetYearByColor.js";
import CreatePDF from "./src/functions/CreatePDF.js";

try {
  console.log("Reading Excel....");
  let disableColors = false;

  const fileArrayBuffer = await fs.readFile("./excel-file.xlsx");

  const workbook = XLSX.read(fileArrayBuffer, {
    cellStyles: true,
    cellDates: true,
  });

  ConvertMergesToCellData(workbook);

  /** @type {TParsedSheets[]} */
  const parsedSheets = [];

  /** @type {TYear[]} */
  let years = null;

  for (let sheetName of workbook.SheetNames) {
    // Set year colors
    if (years === null) {
      years = GetYears(workbook.Sheets[sheetName]);
    }

    // Check if the sheet contains unscheduled subjects
    // This might breaks in the future depending on the sheet cell arrangement
    const firstCell = workbook.Sheets[sheetName]["A1"];
    if (firstCell.t !== "z" && isNaN(sheetName.charAt(0))) {
      const unscheduled = ParseUnscheduledSubjects(workbook.Sheets[sheetName], years);

      parsedSheets.push({
        sheetName,
        sheetTitle: [],
        subjects: unscheduled,
      });

      continue;
    }

    const locationAndTime = GetLocationsAndTime(workbook.Sheets[sheetName]);

    const largeCells = GetLargeCells(workbook.Sheets[sheetName], locationAndTime.locationRow);

    const subjectsData = [];
    for (let cell of largeCells) {
      const currentCell = workbook.Sheets[sheetName][cell];
      if (
        cell.startsWith("A") ||
        !currentCell.w ||
        currentCell.w === "." ||
        currentCell.w.length < 3 ||
        currentCell.s.patternType !== "solid" // Check if it's colored
      ) {
        // Skip cell if it's not a subject
        continue;
      }

      // Start mapping subjects
      const subjectYear = GetYearByColor(years, currentCell.s.fgColor.rgb);

      const subjectRowOffset = currentCell.range.colStart - 1;
      const subjectLocations = locationAndTime.locations.slice(
        subjectRowOffset,
        subjectRowOffset + currentCell.range.width
      );

      const timeRowOffset = currentCell.range.rowStart - locationAndTime.locationRow - 2;
      const subjectTimeRange = locationAndTime.time.slice(
        timeRowOffset,
        timeRowOffset + currentCell.range.height
      );

      const subject = {
        name: currentCell.w,
        year: subjectYear?.year ?? "-",
        yearColor: subjectYear?.color ?? "FFFFFF",
        locations: Array.from(new Set(subjectLocations)),
        time: subjectTimeRange,
      };

      subjectsData.push(subject);
    }

    const sheetTitle = [];
    for (let n = 1; n <= locationAndTime.locationRow; n++) {
      sheetTitle.push(workbook.Sheets[sheetName][`A${n}`].w);
    }

    parsedSheets.push({
      sheetName,
      sheetTitle,
      subjects: subjectsData,
    });
  }

  console.log("Creating PDF file...");
  const pdfData = await CreatePDF({
    fileName: "PDF_NAME",
    parsedSheets,
    disableColors: disableColors,
  });

  await fs.writeFile("file.pdf", pdfData);

  // ===
} catch (error) {
  console.error(error);
}
