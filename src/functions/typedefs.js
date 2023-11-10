/**
 * @typedef {object} TSubject
 * @prop {string} name
 * @prop {string} year
 * @prop {string} yearColor
 * @prop {string[]} locations
 * @prop {string[]} time
 *
 * @typedef {object} TParsedSheets
 * @prop {string} sheetName
 * @prop {string[]} sheetTitle
 * @prop {TSubject[]} subjects
 *
 * @typedef {object} TLocationsAndTime
 * @prop {string[] | null} locations
 * @prop {string[] | null} time
 * @prop {number} locationRow
 *
 * @typedef {object} TYear
 * @prop {string} year
 * @prop {string} color
 *
 * @typedef {object} TPdfProps
 * @prop {string} fileName
 * @prop {TParsedSheets[]} parsedSheets
 * @prop {boolean} disableColors
 */
