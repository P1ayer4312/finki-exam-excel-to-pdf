import * as XLSX from "xlsx";
import ConvertMergesToCellData from "./functions/ConvertMergesToCellData";
import GetLocationsAndTime from "./functions/GetLocationsAndTime";
import GetLargeCells from "./functions/GetLargeCells";
import GetYears from "./functions/GetYears";
import CreatePDF from "./functions/CreatePDF";
import ParseUnscheduledSubjects from "./functions/ParseUnscheduledSubjects";
import "./functions/typedefs";
import GetYearByColor from "./functions/GetYearByColor";

// DOM elements
const DOM = {
  /** @type {HTMLInputElement | null} */
  inputFile: document.getElementById("inputFile"),
  /** @type {HTMLSpanElement | null} */
  status: document.getElementById("status"),
  /** @type {HTMLInputElement | null} */
  disableColors: document.getElementById("disableColors"),
  /** @type {HTMLDivElement | null} */
  errorBlock: document.getElementById("errorBlock"),
  setStatus: (message) => {
    DOM.status.innerText = message;
  },
  showError: (message) => {
    DOM.errorBlock.innerHTML = message;
    DOM.errorBlock.style.setProperty("display", "block");
  },
  clearError: () => {
    DOM.errorBlock.innerHTML = "";
    DOM.errorBlock.style.setProperty("display", "none");
  },
};

// Events
DOM.inputFile.addEventListener("change", async () => {
  try {
    DOM.setStatus("Reading Excel file...");
    const file = DOM.inputFile.files[0];
    const fileArrayBuffer = await file.arrayBuffer();

    const workbook = XLSX.read(fileArrayBuffer, {
      cellStyles: true,
      cellDates: true,
    });

    ConvertMergesToCellData(workbook);

    /** @type {TParsedSheets[]} */
    const parsedSheets = [];

    /** @type {TYear | []} */
    let years = null;

    for (let sheetName of workbook.SheetNames) {
      // Set year colors
      if (years === null) {
        years = GetYears(workbook.Sheets[sheetName]);
      }

      // Check if the sheet contains unscheduled subjects
      // This might breaks in the future depending on the sheet cell arrangement
      if (workbook.Sheets[sheetName]["A1"].t !== "z") {
        const unscheduled = ParseUnscheduledSubjects(
          workbook.Sheets[sheetName],
          years
        );

        parsedSheets.push({
          sheetName,
          sheetTitle: [],
          subjects: unscheduled,
        });

        continue;
      }

      const locationAndTime = GetLocationsAndTime(workbook.Sheets[sheetName]);

      const largeCells = GetLargeCells(
        workbook.Sheets[sheetName],
        locationAndTime.locationRow
      );

      const subjectsData = [];
      for (let cell of largeCells) {
        const currentCell = workbook.Sheets[sheetName][cell];
        if (
          cell.startsWith("A") ||
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

        const timeRowOffset =
          currentCell.range.rowStart - locationAndTime.locationRow - 2;
        const subjectTimeRange = locationAndTime.time.slice(
          timeRowOffset,
          timeRowOffset + currentCell.range.height
        );

        const subject = {
          name: currentCell.w,
          year: subjectYear.year,
          yearColor: subjectYear.color,
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

    DOM.setStatus("Creating PDF file...");
    CreatePDF({
      fileName: file.name.slice(0, file.name.lastIndexOf(".")),
      parsedSheets,
      disableColors: DOM.disableColors.checked,
    });

    DOM.setStatus("Done");
    // ===
  } catch (error) {
    console.error(error);
    DOM.setStatus("Error ocurred");
    DOM.showError(error.stack.replaceAll("\n", "<br>"));
  }
});
