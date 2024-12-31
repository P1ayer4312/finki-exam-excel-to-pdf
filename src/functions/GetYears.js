/**
 * Find the years column and store the values
 * @param {TWorkSheet} sheet
 * @returns {TYear[]}
 */
export default function GetYears(sheet) {
  // This seems to break often, so we'll do few checks to try find
  // the years column. If for some reason it breaks again, just ignore
  // the years completely. Can't be bothered with this shit anymore.

  // Check 1: Get the table width from the table header
  const lastTableColLetter = sheet["A1"]?.range?.end?.charCodeAt(0) ?? "A".charCodeAt();
  let cellKeys = Object.keys(sheet)
    .filter((key) => !key.startsWith("!") && key.charCodeAt(0) > lastTableColLetter)
    .filter((cell) => {
      const cellData = sheet[cell];
      return cellData.t == "s" && !isNaN(cellData.w?.trim().charAt(0));
    });

  // Check 2: Try to find the year cells by text value
  if (cellKeys.length !== 4) {
    cellKeys = Object.keys(sheet).filter(
      (key) => !key.startsWith("!") && sheet[key].w?.toLowerCase().includes("годин")
    );
  }

  // Map years
  const years = cellKeys.map((cellKey) => {
    const cell = sheet[cellKey];
    return {
      year: cell.w,
      color: cell.s?.fgColor?.rgb,
    };
  });

  return years;
}
