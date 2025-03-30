const specialRE = /[.*+?^=!:${}()|[\]/\\-]/g;

/**
 * 编码处理正则表达式
 * @example
 * ```js
 * reEscape('/$')
 * // => '\\/\\$'
 * ```
 * @param {string} string
 * @returns {string}
 */
export function regexpEscape(string: string): string {
  return string.replace(specialRE, '\\$&');
}

// 邮箱
const EMAIL_RE = /^\w+[-+.\w]*@([a-z\d-]+\.)+[a-z]{2,5}$/i;
/**
 * 判断字符串是否为邮箱格式，不对邮箱真实性做验证，如域名是否正确等
 * @param {string} value
 * @returns {boolean}
 */
export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

// 手机号码
const PHONE_RE = /^1\d{10}$/;
/**
 * 判断字符串是否为宽松手机格式，即首位为 1 的 11 位数字都属于手机号
 * @param {string} value
 * @returns {boolean}
 */
export function isPhone(value: string): boolean {
  return PHONE_RE.test(value);
}

// 身份证号码
// http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/
// ["北京市", "天津市", "河北省", "山西省", "内蒙古自治区",
// "辽宁省", "吉林省", "黑龙江省",
// "上海市", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省",
// "河南省", "湖北省", "湖南省", "广东省", "广西壮族自治区", "海南省",
// "重庆市", "四川省", "贵州省", "云南省", "西藏自治区",
// "陕西省", "甘肃省", "青海省","宁夏回族自治区", "新疆维吾尔自治区",
// "台湾省",
// "香港特别行政区", "澳门特别行政区"]
// ["11", "12", "13", "14", "15",
// "21", "22", "23",
// "31", "32", "33", "34", "35", "36", "37",
// "41", "42", "43", "44", "45", "46",
// "50", "51", "52", "53", "54",
// "61", "62", "63", "64", "65",
// "71",
// "81", "82"]
// 91 国外
const IDNO_RE =
  /^(1[1-5]|2[1-3]|3[1-7]|4[1-6]|5[0-4]|6[1-5]|7[1]|8[1-2]|9[1])\d{4}(18|19|20)\d{2}[01]\d[0123]\d{4}[\dxX]$/;
/**
 * 判断字符串是否为身份证号码格式
 * @param {string} value
 * @returns {boolean}
 */
export function isIDNo(value: string): boolean {
  const isSameFormat = IDNO_RE.test(value);

  if (!isSameFormat) return false;

  const year = Number(value.slice(6, 10));
  const month = Number(value.slice(10, 12));
  const date = Number(value.slice(12, 14));
  const d = new Date(year, month - 1, date);
  const isSameDate = d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === date;

  if (!isSameDate) return false;

  // 将身份证号码前面的17位数分别乘以不同的系数；
  // 从第一位到第十七位的系数分别为：7－9－10－5－8－4－2－1－6－3－7－9－10－5－8－4－2
  // 将这17位数字和系数相乘的结果相加；
  // 用加出来和除以11，看余数是多少；
  // 余数只可能有0－1－2－3－4－5－6－7－8－9－10这11个数字；
  // 其分别对应的最后一位身份证的号码为1－0－X－9－8－7－6－5－4－3－2
  // 通过上面得知如果余数是2，就会在身份证的第18位数字上出现罗马数字的Ⅹ。如果余数是10，身份证的最后一位号码就是2。
  const coefficientList = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const residueList = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;

  for (let start = 0; start < 17; start++) {
    sum += Number(value.slice(start, start + 1)) * coefficientList[start];
  }

  return residueList[sum % 11] === value.slice(-1);
}

// url
const URL_RE =
  /^https?:\/\/(([a-z\d-]+\.)+[a-z]{2,5}|(\d{1,3}\.){3}\d{1,3})(:[1-9]\d{0,4})?(\/|\/[\w#!:.?+=&%@'/()-]+)?$/i;
/**
 * 判断字符串是否为 url 格式，仅支持 http 协议，支持域名或者 ipV4
 * @param {string} value
 * @returns {boolean}
 */
export function isURL(value: string): boolean {
  return URL_RE.test(value);
}

// ipv4
const IPV4_RE = /^(?:(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
/**
 * 判断字符串是否为 IPV4 格式，不对 ip 真实性做验证
 * @param {string} value
 * @returns {boolean}
 */
export function isIPV4(value: string): boolean {
  return IPV4_RE.test(value);
}

const INTEGER_RE = /^(-?[1-9]\d*|0)$/;
/**
 * 判断字符串是否为整数（自然数），即 ...,-3,-2,-1,0,1,2,3,...
 * @param {string} value
 * @returns {boolean}
 */
export function isInteger(value: string): boolean {
  return INTEGER_RE.test(value);
}

const FLOAT_RE = /^-?([1-9]\d*|0)\.\d+$/;
/**
 * 判断字符串是否为浮点数，即必须有小数点的有理数
 * @param {string} value
 * @returns {boolean}
 */
export function isFloat(value: string): boolean {
  return FLOAT_RE.test(value);
}

/**
 * 判断字符串是否为正确数值，包括整数和浮点数
 * @param {string} value
 * @returns {boolean}
 */
export function isNumerical(value: string): boolean {
  return isInteger(value) || isFloat(value);
}

const DIGIT_RE = /^\d+$/;
/**
 * 判断字符串是否为数字，例如六位数字短信验证码（093031）
 * @param {string} value
 * @returns {boolean}
 */
export function isDigit(value: string): boolean {
  return DIGIT_RE.test(value);
}
