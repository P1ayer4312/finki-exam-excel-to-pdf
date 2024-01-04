import "./typedefs";
/**
 * Convert merges to get informations about cell width and height,
 * start and end cell; and add them to the original cells
 * @param {TWorkBook} workbook
 */
export default function ConvertMergesToCellData(workbook) {
  for (let sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const merges = sheet["!merges"] ?? [];
    merges.forEach((cell) => {
      const startLetter = String.fromCharCode(cell.s.c + 65);
      const endLetter = String.fromCharCode(cell.e.c + 65);
      const width = cell.e.c - cell.s.c + 1;
      const height = cell.e.r - cell.s.r + 1;
      const startCell = `${startLetter}${cell.s.r + 1}`;

      if (sheet[startCell]) {
        sheet[startCell].range = {
          start: startCell,
          end: `${endLetter}${cell.e.r + 1}`,
          width,
          height,
          colStart: cell.s.c + 1,
          colEnd: cell.e.c + 1,
          rowStart: cell.s.r + 1,
          rowEnd: cell.e.r + 1,
        };
      }
    });
  }
}
