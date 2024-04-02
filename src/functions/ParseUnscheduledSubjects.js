import "./typedefs";
import GetYearByColor from "./GetYearByColor";
/**
 * Parse unscheduled subjects
 * @param {TWorkSheet} sheet
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

      if (!subjects[index] && typeof item.s?.fgColor?.rgb === "string") {
        const subjectYear = GetYearByColor(years, item.s.fgColor.rgb);
        subjects[index] = {
          name: item.v,
          locations: [],
          time: null,
          year: subjectYear?.year ?? "-",
          yearColor: subjectYear?.color ?? "FFFFFF",
        };
      } else if (subjects[index] && item.v) {
        subjects[index].locations.push(item.v);
      }
    });

  // Remove first placeholder item
  subjects.shift();
  return subjects;
}

export default ParseUnscheduledSubjects;
