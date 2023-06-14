// eslint-disable-next-line no-unused-vars
import * as XLSX from 'xlsx';
/**
 * Find the years column and store the values
 * @param {XLSX.WorkSheet} sheet 
 * @param {Number} skipTo
 */
export default function GetYears(sheet, skipTo) {
	// Skip table cells
	const cellKeys = Object.keys(sheet)
		.filter(key => {
			return (
				!key.startsWith('!') &&
				key.charAt(0) > String.fromCharCode(skipTo + 65)
			)
		})
		/* Return every cell that has color */
		.filter(cellKey => sheet[cellKey].s?.patternType === "solid");
	
	const years = cellKeys.map(cellKey => {
		const cell = sheet[cellKey];
		return {
			year: cell.w,
			color: cell.s.fgColor.rgb,
		}
	})

	return years;
}