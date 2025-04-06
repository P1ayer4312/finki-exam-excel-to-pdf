import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import "./typedefs";
/**
 * Generate PDF
 * @param {TPdfProps} data
 */
export default function CreatePDF(data) {
  // eslint-disable-next-line no-import-assign
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  const fileName = data.fileName;
  const parsedSheets = data.parsedSheets;
  const subjectsRows = [];
  parsedSheets.forEach((el) => {
    const dayRowTitle = el.sheetTitle.length > 0 ? el.sheetTitle.join("\n") : el.sheetName;

    subjectsRows.push([
      {
        text: dayRowTitle,
        style: "dayRow",
        colSpan: 4,
        alignment: "center",
      },
      {},
      {},
      {},
    ]);

    el.subjects
      .sort((a, b) => Number(a.year.charAt(0)) - Number(b.year.charAt(0)))
      .forEach((subject) => {
        let time = null;
        if (subject.time !== null) {
          time = subject.time.length > 1 ? `${subject.time.at(0)}-${subject.time.at(-1)}` : subject.time[0];
        }

        const subjectBuilder = [
          { text: subject.name, style: "subject", unbreakable: true },
          {
            text: subject.year,
            style: "subject",
            fillColor: data.disableColors ? undefined : `#${subject.yearColor}`,
            unbreakable: true,
          },
        ];

        if (time !== null) {
          subjectBuilder.push({
            text: time,
            style: "subject",
            unbreakable: true,
          });
        }

        subjectBuilder.push({
          text: subject.locations.join(", ") || "",
          style: "subject",
          unbreakable: true,
          colSpan: time === null ? 2 : undefined,
        });

        subjectsRows.push(subjectBuilder);
      });
  });

  /** @type {TDocumentDefinitions} */
  const docDefinition = {
    content: [
      {
        table: {
          widths: [200, 35, 45, 195],
          dontBreakRows: true,
          body: [
            [
              {
                text: "Факултет за информатички науки и компјутерско инженерство",
                colSpan: 4,
                style: "title",
              },
              {},
              {},
              {},
            ],
            [{ text: fileName, colSpan: 4, style: "documentTitle" }, {}, {}, {}],
            // ==
            [
              { text: "Предмет", style: "infoHeader" },
              { text: "Година", style: "infoHeader" },
              { text: "Термин", style: "infoHeader" },
              { text: "Простории", style: "infoHeader" },
            ],
            // ==
            ...subjectsRows,
          ],
        },
      },
    ],
    footer: (currentPage, pageCount) => {
      if (currentPage === pageCount) {
        return {
          columns: [
            {
              text: "Conversion tool",
              link: "https://p1ayer4312.github.io/exam-excel-to-pdf/",
              alignment: "left",
              marginLeft: 40,
              fontSize: 10,
              color: "#0000FF",
            },
          ],
        };
      }

      return null;
    },
    styles: {
      title: {
        alignment: "center",
        bold: true,
        margin: [5, 5],
        fontSize: 10,
      },
      documentTitle: {
        alignment: "center",
        bold: true,
        fontSize: 10,
      },
      dayRow: {
        fontSize: 8,
        fillColor: "lightgray",
        bold: true,
      },
      infoHeader: {
        alignment: "center",
        fontSize: 8,
        bold: true,
      },
      subject: {
        fontSize: 8,
      },
    },
  };

  // Create and download pdf file
  pdfMake.createPdf(docDefinition).download(`${fileName.trim()}.pdf`);

  // Debug pdf, open in new window instead of downloading
  // let win = window.open("", "_blank");
  // pdfMake.createPdf(docDefinition).open({}, win);
}
