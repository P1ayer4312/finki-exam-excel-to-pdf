import "./typedefs";
/**
 * Find the years column and store the values
 * @param {TWorkSheet} sheet
 * @returns {TYear[]}
 */
export default function GetYears(sheet) {
  // Get the letter of the last column
  const lastColLetterCharCode = sheet["!ref"].split(":")[1].charCodeAt(0);
  const lastColLetter = String.fromCharCode(lastColLetterCharCode - 1);

  // Get last column cells
  const cellKeys = Object.keys(sheet)
    .filter((key) => key.startsWith(lastColLetter))
    /* Return every cell that has color */
    .filter((cellKey) => sheet[cellKey].s?.patternType === "solid");

  // Map years
  const years = cellKeys.map((cellKey) => {
    const cell = sheet[cellKey];
    return {
      year: cell.w,
      color: cell.s.fgColor.rgb,
    };
  });

  return years;
}
