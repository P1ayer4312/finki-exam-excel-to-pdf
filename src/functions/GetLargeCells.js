// eslint-disable-next-line no-unused-vars
import * as XLSX from 'xlsx';
/**
 * Returns starting points of large cells in a sheet from !mergers
 * @param {XLSX.WorkSheet} sheet 
 * @param {Number} locationRow
 */
export default function GetLargeCells(sheet, locationRow) {
	const merges = sheet['!merges'];
	const cells = [];

	for (let cell of merges) {
		if (cell.s.r === locationRow) {
			continue;
		}
		const startLetter = String.fromCharCode(cell.s.c + 65);
		cells.push(`${startLetter}${cell.s.r + 1}`);
	}

	return cells;
}