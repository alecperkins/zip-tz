// The ranges are stored as either a single ZIP code or a pair of start and end codes,
// stored as ints rather than Strings. The code is modestly compressed by storing the
// end of the range as a delta after its start instead of the full value. Additionally,
// the starts are stored as deltas after the first, lowest code, to save a few more bytes.
const MAPPING = {
  "America/New_York":[[501,99],[500,31399],[31955,2],[32100,2402],36353,[36362,1],[36366,3],[36371,1],[36376,1],[36801,2],[36806,5],[36813,3],[36819,3],[36824,1],36828,[36830,2],[36835,2],36840,[36842,1],[36849,1],[36852,1],[36860,3],[36868,4],36876,36878,36880,[36883,2],[36890,2],[36900,99],[37100,121],[37223,276],[39312,297],[39616,1],[39620,18],39641,[39649,1],[39654,14],39674,39676,[39700,1799],41583,41649,41702,41708,41734,41750,[41756,1],[41766,5],[41782,1],41786,41874,41902,[42000,100],[42130,10],[42146,64],[42217,1],[42223,1],[42231,8],42247,[42256,1],[42275,5],[42282,3517],[46000,29],[46035,431],[46469,543],[47015,3],[47020,1],47023,[47026,3],[47031,3],[47040,8],[47052,2],[47056,16],47074,47077,[47079,5],[47089,10],47113,[47159,4],47226,47238,[47240,5],[47300,120],[47422,19],[47443,3],[47448,1],[47451,10],[47464,11],[47479,2020],[56400,99]],
  "America/Puerto_Rico":[[601,199],[300,99]],
  "America/St_Thomas":[[801,99]],
  "America/Chicago":[[32401,54],[58,141],[2603,1849],[4454,7],[4464,1],4470,[4473,2],[4478,422],[4904,1],4912,[4917,1],4923,[4926,1],4929,[4933,1],[4938,1],4941,[4944,4],4951,[4954,5],[4964,3],[4973,2],4977,4979,[4981,1],[4986,3],[4993,6],[5100,99],5322,[5600,1811],[7710,5],[7718,1],[7739,1],[7742,6],[7751,2],[7769,4],7775,[7777,22],[9600,82],[9684,64],[9750,51],[9803,4],[9809,24],[9835,14],[9851,4],[9858,7],[9872,9],[9884,1],[9887,86],[9975,26],[10003,96],[10201,28],[10241,4],[10311,5],[10319,3],[10325,5],[10340,6],[10348,7],[10358,16],10381,[13900,199],[14130,4],[14567,1],[15113,1],15119,15122,[15124,1],15130,[15135,4],[15149,2],15155,15173,[15175,1],15178,[15185,3],[15200,12],[15214,44],[15264,61],[15327,10],15339,[15346,53],15521,15542,15547,15550,[15562,1],[15576,2],[17600,6899],[24600,519],[25121,14],[25137,4],[25143,2],[25147,2],[25154,11],[25167,5],25175,[25178,21],[25230,1],[25245,2],[25600,527],[26129,2],[26134,26],26162,[26164,3],[26169,30],26230,26237,[26300,299],[27600,7731],35333,[35335,4],[35342,14],[35363,71],[35436,19],[35458,18],[35479,1140],36621,[36623,2],[36627,1],36631,[36633,2],[36637,2],[36641,2],[36645,74],[36722,1],36729,36731,[36734,4],[36741,1],36750,[36756,2],36760,[36762,1],[36765,1],[36768,20],[36800,9],[36811,3],36816,[36819,80],[37600,9819],[47429,4],[47441,4],47447,47451,[47453,46]],
  "America/Denver":[57521,16,22,26,[30,3],46,[53,1],[56,1],[80,29],[112,12],[128,351],1008,[1012,1],1041,1043,1048,[1080,29],[1111,5],[1118,61],[1480,999],10212,10214,[10220,1],[10237,5],10315,[10336,1],[10357,1],11500,11502,11506,[11509,1],11512,11516,11520,11524,[11600,1],[11604,4],11610,[11612,1],[11619,1],[11623,6],[11631,4],11639,11641,11644,11647,[11669,10],11690,11695,[11697,1],[11780,699],[22300,8],[22314,6],22326,[22328,2],22332,[22380,3599],26026,[26028,2],[26080,199],[26480,999],28483,28499,28510,28512,28514,[28519,1],[28523,1],[28532,247],[28982,51],[29035,2344],[40380,2],40385,[40387,92]],
  "America/Los_Angeles":[[83501,45],47,[51,48],[300,199],[5400,122],[5524,7675],[13500,899],[14403,1],14406,[14500,1499]],
  "America/Phoenix":[[85001,1002],[1004,14],[1020,9],1031,1033,[1035,3],[1041,1],[1045,6],[1300,201],1554,4023],
  "Pacific/Honolulu":[[96701,97],[100,96]],
  "Pacific/Pago_Pago":[[96799,1]],
  "Pacific/Wake":[[96898,11]],
  "Pacific/Guam":[[96910,28]],
  "Pacific/Palau":[[96939,1]],
  "Pacific/Pohnpei":[96941],
  "Pacific/Chuuk":[[96942,1]],
  "Pacific/Kosrae":[[96944,5]],
  "Pacific/Saipan":[[96950,9]],
  "Pacific/Majuro":[[96960,9]],
  "Pacific/Kwajalein":[[96970,30]],
  "America/Anchorage":[[99501,44],[47,402]],
  "America/Adak":[[99546,1]],
};

const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

export type TZName = keyof typeof MAPPING;

// The decompression of the mapping is a bit expensive so it's memoized.
// The mapping is restructured into a sorted list of ranges and their
// corresponding TZ (indexed in an Array of the TZ names). This way, the
// matching range can be found using a binary search.
let range_list: Array<[range_start: number, range_end: number, tz_name_i: number]>;
const tz_names: Array<TZName> = [];

/**
 * Get the most likely practical time zone for a given ZIP code.
 * @remarks **Stop.** Before using this make sure you understand why it’s _wrong_ to determine time zone from ZIP code.
 * @param {String} zip - a five-digit ZIP code as a string
 * @returns {String} the tz name of the largest canonical time zone applicable to that ZIP code, or null.
 */
export default function zipTZ (zip: string): TZName | null {
  if (!range_list) {
    // Decompress the mapping.
    range_list = [];
    const entries = Object.entries(MAPPING) as Array<[TZName, Array<number | [number, number]>]>;
    entries.forEach((entry, i) => {
      const [tz, ranges] = entry;
      let offset = 0;
      tz_names.push(tz);
      for (const r of ranges) {
        if (typeof r === "number") {
          // Convert a single-ZIP into a range.
          range_list.push([r + offset,r + offset,i]);
        } else {
          const range_start = r[0];
          const range_end_diff = r[1];
          range_list.push([
            range_start + offset,
            range_end_diff + range_start + offset, // When present, the ends are stored as diffs from the start so add it back.
            i,
          ]);
        }
        if (!offset) {
          // The subsequent range starts are all offset down by the value of
          // the first start for that TZ, so after the first range is extracted
          // use its start as an offset.
          offset = typeof ranges[0] === "number" ? ranges[0] : ranges[0][0];
        }
      }
    });
    range_list.sort((a,b) => a[0] - b[0]);
  }

  if (typeof zip !== "string" || !ZIP_REGEX.test(zip)) {
    throw new Error(`Invalid ZIP code format: ${zip}`);
  }

  // We use the ZIP as a number for easy binary searching (since fortunately
  // they are all numeric), but insist on it being passed as a string since
  // post codes should be treated like an opaque blob of bytes rather than a
  // not-really-sequential number.
  const zipN = parseInt(zip);

  // Binary search for the matching range.
  let lower = 0;
  let upper = range_list.length - 1;
  while (lower <= upper) {
    const mid = Math.round((upper - lower) / 2) + lower;
    const [start, end, tz_i] = range_list[mid];
    if (zipN > end) {
      lower = mid + 1;
    } else if (zipN < start) {
      upper = mid - 1;
    } else {
      return tz_names[tz_i];
    }
  }
  return null;
}
