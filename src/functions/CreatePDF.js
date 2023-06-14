import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

/**
 * Generate PDF
 * @param {{
 *  fileName: String,
 * 	parsedSheets: Array.<Object>
 * }} data 
 */
export default function CreatePDF(data) {
	// eslint-disable-next-line no-import-assign
	pdfMake.vfs = pdfFonts.pdfMake.vfs;
	const fileName = data.fileName;
	const parsedSheets = data.parsedSheets;
	const subjectsRows = []
	parsedSheets.forEach(el => {
		subjectsRows.push(
			[{ text: el.sheetTitle.join('\n'), style: "dayRow", colSpan: 4, alignment: 'center' }, {}, {}, {}]
		);

		el.subjects.forEach(subject => {
			const time = subject.time.length > 1 ?
				`${subject.time.at(0)}-${subject.time.at(-1)}` :
				subject.time[0];

			subjectsRows.push(
				[
					{ text: subject.name, style: 'subject', unbreakable: true },
					{ text: subject.year, style: 'subject', fillColor: `#${subject.yearColor}`, unbreakable: true },
					{ text: time, style: 'subject', unbreakable: true },
					{ text: subject.locations.length ? subject.locations.join(', ') : 'kurac', style: 'subject', unbreakable: true }
				]
			);
		});
	});

	const docDefinition = {
		content: [
			{
				table: {
					widths: [200, 35, 45, 195],
					dontBreakRows: true,
					body: [
						[{ text: "Факултет за информатички науки и компјутерско инженерство", colSpan: 4, style: 'title' }, {}, {}, {}],
						[{ text: fileName, colSpan: 4, style: 'documentTitle' }, {}, {}, {}],
						// ==
						[{ text: "Предмет", style: 'infoHeader' }, { text: "Година", style: 'infoHeader' }, { text: "Термин", style: 'infoHeader' }, { text: "Простории", style: 'infoHeader' }],
						// ==
						...subjectsRows
					]
				},
			},
		],
		styles: {
			title: {
				alignment: 'center',
				bold: true,
				margin: [5, 5],
				fontSize: 10
			},
			documentTitle: {
				alignment: 'center',
				bold: true,
				fontSize: 10
			},
			dayRow: {
				fontSize: 8,
				fillColor: 'lightgray',
				bold: true,
			},
			infoHeader: {
				alignment: 'center',
				fontSize: 8,
				bold: true
			},
			subject: {
				fontSize: 8
			}
		}
	}

	// Create and download pdf file
	pdfMake
		.createPdf(docDefinition)
		.download(`${fileName.trim()}.pdf`);

	// Debug pdf, open in new window instead of downloading
	// let win = window.open('', '_blank');
	// pdfMake.createPdf(docDefinition).open({}, win);
}