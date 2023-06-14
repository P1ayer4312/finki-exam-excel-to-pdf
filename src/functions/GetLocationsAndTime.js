import * as XLSX from 'xlsx';
/**
 * @param {XLSX.WorkSheet} sheet
 * @returns {{locations: Array.<String>, time: Array.<String>, locationRow: Number}}
 */
export default function GetLocationsAndTime(sheet) {
	const sheetJson = XLSX.utils.sheet_to_json(
		sheet,
		{ header: 1, defval: 'EMPTY', raw: false }
	);

	// - We fetch locations and times by first finding the empty cell on the first row.
	// - We use 'locationsRowFound' to check if we hit a cell with an 'EMPTY' value. Once
	// the row is found, patch it by replacing empty items with the value of the previous.
	// - For fetching times we do something similar, iterate through all rows, store the
	// first item, do this until we hit an 'EMPTY' cell.

	let locationsRowFound = false;
	let locations = [];
	let locationRow = 0;
	let time = [];
	for (let row of sheetJson) {
		// Find the locations array
		if (!locationsRowFound && row[0] === 'EMPTY') {
			const rowPatched = row;

			// Fill empty spots with previous location, skip the first one
			for (let n = 1; n < rowPatched.length - 2; ++n) {
				if (rowPatched[n + 1] === "EMPTY") {
					rowPatched[n + 1] = rowPatched[n];
				}
			}
			locationsRowFound = true;
			locations = rowPatched;
			continue;
		} else if (!locationsRowFound) {
			// Skip the title
			locationRow += 1;
			continue;
		} else if (row[0] === 'EMPTY') {
			break;
		}
		// Store the first element of the coming arrays until we reach an 'EMPTY' cell
		time.push(row[0]);
	}

	return { locations, time, locationRow };
}