import * as XLSX from 'xlsx';
import ConvertMergesToCellData from './functions/ConvertMergesToCellData';
import GetLocationsAndTime from './functions/GetLocationsAndTime';
import GetLargeCells from './functions/GetLargeCells';
import GetYears from './functions/GetYears';
import hexColorDelta from './functions/hexColorDelta';
import CreatePDF from './functions/CreatePDF';

// DOM elements
const DOM = {
	/** @type {HTMLInputElement | null} */
	inputFile: document.getElementById('inputFile'),
	status: document.getElementById('status'),
	setStatus: (message) => {
		DOM.status.innerText = message;
	}
}

// Events
DOM.inputFile.addEventListener('change', async () => {
	DOM.setStatus('Reading Excel file...');
	const file = DOM.inputFile.files[0];
	const fileArrayBuffer = await file.arrayBuffer();

	const workbook = XLSX.read(fileArrayBuffer, {
		cellStyles: true,
		cellDates: true,
	});

	ConvertMergesToCellData(workbook);
	const parsedSheets = [];

	for (let sheetName of workbook.SheetNames) {
		const locationAndTime = GetLocationsAndTime(
			workbook.Sheets[sheetName]
		);

		const largeCells = GetLargeCells(
			workbook.Sheets[sheetName],
			locationAndTime.locationRow
		);

		const years = GetYears(
			workbook.Sheets[sheetName],
			workbook.Sheets[sheetName]['A1'].range.width
		);

		const subjectsData = [];
		for (let cell of largeCells) {
			const currentCell = workbook.Sheets[sheetName][cell];
			if (
				cell.startsWith('A') ||
				currentCell.w === '.' ||
				currentCell.w.length < 3 ||
				currentCell.s.patternType !== 'solid' // Check if it's colored
			) {
				// Skip cell if it's not a subject
				continue;
			}

			// Start mapping subjects
			let tempYear = years.find(el => el.color === currentCell.s.fgColor.rgb);
			if (!tempYear) {
				// Years colors and cell colors are different shade
				// Find the approximate closest color
				const colorDeltaArray = years.map(el => {
					return hexColorDelta(el.color, currentCell.s.fgColor.rgb);
				});

				const closestColorIndex = colorDeltaArray.indexOf(Math.max(...colorDeltaArray));
				tempYear = years[closestColorIndex];
			}

			const subjectRowOffset = currentCell.range.colStart - 1;
			const subjectLocations = locationAndTime.locations
				.slice(subjectRowOffset, subjectRowOffset + currentCell.range.width);

			const timeRowOffset = currentCell.range.rowStart - locationAndTime.locationRow - 2;
			const subjectTimeRange = locationAndTime.time
				.slice(timeRowOffset, timeRowOffset + currentCell.range.height);

			const subject = {
				name: currentCell.w,
				year: tempYear.year,
				yearColor: tempYear.color,
				locations: Array.from(new Set(subjectLocations)),
				time: subjectTimeRange
			}

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
			fileName: file.name,
		});
	}

	DOM.setStatus('Creating PDF file...');

	CreatePDF({
		fileName: file.name.slice(0, file.name.lastIndexOf('.')),
		parsedSheets,
	});

	DOM.setStatus('Done');
});