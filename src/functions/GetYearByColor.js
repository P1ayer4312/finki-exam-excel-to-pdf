import hexColorDelta from "./hexColorDelta.js";

/**
 * Find appropriate year based on color
 * @param {TYear[]} years
 * @param {string} color
 * @returns {TYear}
 */
function GetYearByColor(years, color) {
  let tempYear = years.find((el) => el.color === color);
  if (!tempYear) {
    // Years colors and cell colors are different shade
    // Find the approximate closest color
    const colorDeltaArray = years.map((el) => {
      return hexColorDelta(el.color, color);
    });

    const closestColorIndex = colorDeltaArray.indexOf(Math.max(...colorDeltaArray));
    tempYear = years[closestColorIndex];
  }

  return tempYear;
}

export default GetYearByColor;
