/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

const float32ArraySupported = typeof Float32Array === 'function';

function A(aA1: number, aA2: number) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1: number, aA2: number) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1: number) {
  return 3.0 * aA1;
}

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT: number, aA1: number, aA2: number) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT: number, aA1: number, aA2: number) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX: number, aA: number, aB: number, mX1: number, mX2: number) {
  let currentX: number;
  let currentT: number;
  let i = 0;
  let aBFinal = aB;
  let aAFinal = aA;

  do {
    currentT = aAFinal + (aBFinal - aAFinal) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aBFinal = currentT;
    } else {
      aAFinal = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(aX: number, aGuessT: number, mX1: number, mX2: number) {
  let aGuessTFinal = aGuessT;
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(aGuessTFinal, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessTFinal;
    }
    const currentX = calcBezier(aGuessTFinal, mX1, mX2) - aX;
    aGuessTFinal -= currentX / currentSlope;
  }
  return aGuessTFinal;
}

function LinearEasing(x: number) {
  return x;
}

/**
 * 创建一个基于贝塞尔曲线的缓动函数。
 *
 * @param mX1 - 贝塞尔曲线的第一个控制点的 X 坐标，必须在 [0, 1] 范围内。
 * @param mY1 - 贝塞尔曲线的第一个控制点的 Y 坐标，必须在 [0, 1] 范围内。
 * @param mX2 - 贝塞尔曲线的第二个控制点的 X 坐标，必须在 [0, 1] 范围内。
 * @param mY2 - 贝塞尔曲线的第二个控制点的 Y 坐标，必须在 [0, 1] 范围内。
 * @returns 返回一个缓动函数，该函数接受一个参数 x（范围在 0 到 1 之间），并返回相应的缓动值。
 * @throws 如果 mX1 或 mX2 不在 [0, 1] 范围内，则抛出错误。
 */
export function createEasingFn(mX1: number, mY1: number, mX2: number, mY2: number) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // Precompute samples table
  const sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (let i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX(aX: number) {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;
    const initialSlope = getSlope(guessForT, mX1, mX2);

    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    }

    if (initialSlope === 0.0) {
      return guessForT;
    }

    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
  }

  /**
   * 贝塞尔曲线方程
   * @param x {number} 0~1
   */
  return function easingFunc(x: number) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0 || x === 1) {
      return x;
    }

    return calcBezier(getTForX(x), mY1, mY2);
  };
}

export const easingEase = createEasingFn(0.25, 0.1, 0.25, 1);
export const easingLinear = createEasingFn(0, 0, 1, 1);
export const easingSnap = createEasingFn(0, 1, 0.5, 1);
export const easingIn = createEasingFn(0.42, 0, 1, 1);
export const easingOut = createEasingFn(0, 0, 0.58, 1);
export const easingInOut = createEasingFn(0.42, 0, 0.58, 1);
export const easingInQuad = createEasingFn(0.55, 0.085, 0.68, 0.53);
export const easingInCubic = createEasingFn(0.55, 0.055, 0.675, 0.19);
export const easingInQuart = createEasingFn(0.895, 0.03, 0.685, 0.22);
export const easingInQuint = createEasingFn(0.755, 0.05, 0.855, 0.06);
export const easingInSine = createEasingFn(0.47, 0, 0.745, 0.715);
export const easingInExpo = createEasingFn(0.95, 0.05, 0.795, 0.035);
export const easingInCirc = createEasingFn(0.6, 0.04, 0.98, 0.335);
export const easingInBack = createEasingFn(0.6, -0.28, 0.735, 0.045);
export const easingOutQuad = createEasingFn(0.25, 0.46, 0.45, 0.94);
export const easingOutCubic = createEasingFn(0.215, 0.61, 0.355, 1);
export const easingOutQuart = createEasingFn(0.165, 0.84, 0.44, 1);
export const easingOutQuint = createEasingFn(0.23, 1, 0.32, 1);
export const easingOutSine = createEasingFn(0.39, 0.575, 0.565, 1);
export const easingOutExpo = createEasingFn(0.19, 1, 0.22, 1);
export const easingOutCirc = createEasingFn(0.075, 0.82, 0.165, 1);
export const easingOutBack = createEasingFn(0.175, 0.885, 0.32, 1.275);
export const easingInOutQuart = createEasingFn(0.77, 0, 0.175, 1);
export const easingInOutQuint = createEasingFn(0.86, 0, 0.07, 1);
export const easingInOutSine = createEasingFn(0.445, 0.05, 0.55, 0.95);
export const easingInOutExpo = createEasingFn(1, 0, 0, 1);
export const easingInOutCirc = createEasingFn(0.785, 0.135, 0.15, 0.86);
export const easingInOutBack = createEasingFn(0.68, -0.55, 0.265, 1.55);
