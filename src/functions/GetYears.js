// eslint-disable-next-line no-unused-vars
import * as XLSX from "xlsx";
/**
 * Find the years column and store the values
 * @param {XLSX.WorkSheet} sheet
 */
export default function GetYears(sheet) {
  // Get last column cell letter with data
  const skipTo = Object.keys(sheet)
    .filter((key) => {
      return Number(key.slice(1)) === 1 && sheet[key]?.t == "s";
    })
    .at(-1)
    .charAt(0);

  // Skip table cells
  const cellKeys = Object.keys(sheet)
    .filter((key) => {
      return !key.startsWith("!") && key.charAt(0) > skipTo;
    })
    /* Return every cell that has color */
    .filter((cellKey) => sheet[cellKey].s?.patternType === "solid");

  const years = cellKeys.map((cellKey) => {
    const cell = sheet[cellKey];
    return {
      year: cell.w,
      color: cell.s.fgColor.rgb,
    };
  });

  return years;
}
