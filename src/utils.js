import simplify from 'simplify-js';

const nonNumericRows = {
  player: true,
  pname: true,
  year: true
};

// reformats input csv so that each row has details about the corresponding player
// and an array of points describing that players record
export function cleanData(data) {
  return data.map(row => {
    // extract all of the columns for this row that update that players score
    const gameData = Object.keys(row)
      .filter(key => !nonNumericRows[key] && row[key] !== 'NA')
      .map((key, x) => ({x, y: Number(row[key])}));

    // return a formatted object to manipulate
    return {
      player: row.player,
      pname: row.pname,
      year: row.year,
      height: gameData[gameData.length - 1],
      gameData
    };
  });
}

export function getDataDomain(data) {
  const {min, max} = data.reduce((acc, player) => {
    return player.gameData.reduce((mem, row) => {
      return {
        min: Math.min(mem.min, row.y),
        max: Math.max(mem.max, row.y)
      };
    }, acc);

  }, {min: Infinity, max: -Infinity});
  return [min, max];
}

export function buildVoronoiPoints(data) {
  return data.reduce((acc, {player, pname, year, gameData}) => {
    return acc.concat({
      player,
      pname,
      year,
      x: 41,
      y: gameData[gameData.length - 1].y
    });
  }, []);
}

/* eslint-disable max-len */
const onlyStephCurryRecord = [{x: 0, y: 5}, {x: 1, y: 9}, {x: 2, y: 17}, {x: 3, y: 21}, {x: 4, y: 28}, {x: 5, y: 36}, {x: 6, y: 38}, {x: 7, y: 41}, {x: 8, y: 44}, {x: 9, y: 52}, {x: 10, y: 57}, {x: 11, y: 62}, {x: 12, y: 68}, {x: 13, y: 71}, {x: 14, y: 74}, {x: 15, y: 78}, {x: 16, y: 87}, {x: 17, y: 90}, {x: 18, y: 94}, {x: 19, y: 102}, {x: 20, y: 111}, {x: 21, y: 116}, {x: 22, y: 119}, {x: 23, y: 125}, {x: 24, y: 127}, {x: 25, y: 129}, {x: 26, y: 131}, {x: 27, y: 133}, {x: 28, y: 134}, {x: 29, y: 140}, {x: 30, y: 141}, {x: 31, y: 146}, {x: 32, y: 150}, {x: 33, y: 154}, {x: 34, y: 162}, {x: 35, y: 166}, {x: 36, y: 171}, {x: 37, y: 179}, {x: 38, y: 186}, {x: 39, y: 193}, {x: 40, y: 196}, {x: 41, y: 204}, {x: 42, y: 210}, {x: 43, y: 213}, {x: 44, y: 218}, {x: 45, y: 221}, {x: 46, y: 232}, {x: 47, y: 233}, {x: 48, y: 240}, {x: 49, y: 245}, {x: 50, y: 252}, {x: 51, y: 255}, {x: 52, y: 260}, {x: 53, y: 266}, {x: 54, y: 276}, {x: 55, y: 288}, {x: 56, y: 293}, {x: 57, y: 294}, {x: 58, y: 301}, {x: 59, y: 304}, {x: 60, y: 311}, {x: 61, y: 318}, {x: 62, y: 322}, {x: 63, y: 330}, {x: 64, y: 336}, {x: 65, y: 337}, {x: 66, y: 339}, {x: 67, y: 343}, {x: 68, y: 348}, {x: 69, y: 350}, {x: 70, y: 356}, {x: 71, y: 361}, {x: 72, y: 369}, {x: 73, y: 378}, {x: 74, y: 382}, {x: 75, y: 385}, {x: 76, y: 388}, {x: 77, y: 392}, {x: 78, y: 402}];
/* eslint-enable max-len */
export const betterThanCurryLine = simplify(onlyStephCurryRecord, 0.5).map(({x, y}) =>
    ({x, y: y + 20, pname: 'Stephen Curry', year: 2016}));

const SIMPLICATION = 3;
export function buildVoronoiPointsWithSimplification(data) {
  return data.reduce((acc, {player, pname, year, gameData}) => {
    return acc.concat(
      simplify(gameData, SIMPLICATION).map(({x, y}) => ({player, pname, year, x, y}))
    );
  }, betterThanCurryLine);
}
