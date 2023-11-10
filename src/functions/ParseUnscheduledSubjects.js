// eslint-disable-next-line no-unused-vars
import * as XLSX from "xlsx";
import "./typedefs";
import GetYearByColor from "./GetYearByColor";
/**
 * Parse unscheduled subjects
 * @param {XLSX.WorkSheet} sheet
 * @param {TYear[]} years
 * @returns {TSubject[]}
 */
function ParseUnscheduledSubjects(sheet, years) {
  // This will most likely break in the future, since
  // the tables style tends to change sometimes depending
  // on how the person who makes them feels

  /** @type {TSubject[]} */
  const subjects = [null];

  Object.keys(sheet)
    .filter((key) => {
      return key.charAt(0) !== "!";
    })
    .forEach((key) => {
      const index = Number(key.slice(1));
      const item = sheet[key];

      if (!subjects[index]) {
        const subjectYear = GetYearByColor(years, item.s.fgColor.rgb);
        subjects[index] = {
          name: item.v,
          locations: null,
          time: null,
          year: subjectYear.year,
          yearColor: subjectYear.color,
        };
      } else if (subjects[index]) {
        subjects[index].locations = [item.v];
      }
    });

  // Remove first placeholder item
  subjects.shift();
  return subjects;
}

export default ParseUnscheduledSubjects;
