import Decimal from 'decimal.js';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NumberFact {
  title: string;
  description: string;
}

export function getClubs(nValue: number | string | Decimal): string[] {
  const n = new Decimal(nValue);
  const clubs: string[] = [];
  
  if (n.isZero()) {
    clubs.push("Zero Club");
    return clubs;
  }
  
  if (n.isNegative()) clubs.push("Negative Club");
  
  const absN = n.abs();
  
  // Basic properties (only for numbers within reasonable range for integer checks)
  if (absN.lte(Number.MAX_SAFE_INTEGER)) {
    const num = absN.toNumber();
    
    // Nice Club
    if (num === 69) clubs.push("Nice Club");
    
    // Tweak -15
    if (num === 15 && n.isNegative()) clubs.push("Cursed Fifteen");

    if (num % 2 === 0) clubs.push("Even Club");
    else clubs.push("Odd Club");
    
    // Square
    const sqrt = Math.round(Math.sqrt(num));
    if (sqrt * sqrt === num) clubs.push("Square Club");
    
    // Cube
    const cbrt = Math.round(Math.pow(num, 1/3));
    if (cbrt * cbrt * cbrt === num) clubs.push("Cube Club");
    
    // Triangle (Step Squad)
    const triangleRoot = (-1 + Math.sqrt(1 + 8 * num)) / 2;
    if (triangleRoot === Math.floor(triangleRoot)) clubs.push("Step Squad");
    
    // Prime
    if (isPrime(num)) clubs.push("Prime Club");
    else if (num > 1) clubs.push("Rectangle Club");
    
    // Fibonacci
    if (isFibonacci(num)) clubs.push("Fibonacci Club");

    // Lucky numbers (contains 7)
    if (num.toString().includes("7")) clubs.push("Lucky Club");
  } else {
    // For astronomical numbers, simpler checks
    if (absN.mod(2).isZero()) clubs.push("Even Club");
    else clubs.push("Odd Club");

    // Perfect Square for Decimals
    const sqrt = absN.sqrt().trunc();
    if (sqrt.pow(2).equals(absN)) clubs.push("Square Club");
  }
  
  // Super large scale
  const exponent = absN.e;
  if (exponent >= 19 && exponent <= 21) clubs.push("Planet 100");

  if (absN.gte('1e3000003')) clubs.push("Infinity Bound");
  else if (absN.gte('1e1000')) clubs.push("Multiversal Club");
  else if (absN.gte('1e308')) clubs.push("Googolplexian Club");
  else if (absN.gte('1e100')) clubs.push("Googol Club");
  else if (absN.gte('1e81')) clubs.push("Cosmic Club");
  else if (absN.gte('1e50')) clubs.push("Galactic Club");
  else if (absN.gte('1e24')) clubs.push("Yotta Club");
  else if (absN.gte('1e12')) clubs.push("Universal Club");
  else if (absN.gte('1e9')) clubs.push("Titan Club");
  else if (absN.gte('1e6')) clubs.push("Giant Club");

  return clubs;
}

export function formatForSpeech(n: Decimal): string {
  if (n.isZero()) return "Zero";
  
  const absN = n.abs();
  const prefix = n.isNegative() ? "Negative " : "";
  
  if (absN.lt(1e12)) {
    return prefix + absN.toNumber().toLocaleString();
  }
  
  if (absN.gte('1e3000003')) return prefix + "Infinity Bound";
  
  const exponent = absN.e;
  const mantissa = absN.div(new Decimal(10).pow(exponent)).toSignificantDigits(3).toString();
  
  if (exponent === 100) return prefix + "One Googol";
  if (exponent === 3000) return prefix + "One Millinillion";

  return `${prefix} ${mantissa} times ten to the power of ${exponent}`;
}

function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i = i + 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function isFibonacci(n: number): boolean {
  const res1 = 5 * n * n + 4;
  const res2 = 5 * n * n - 4;
  const s1 = Math.round(Math.sqrt(res1));
  const s2 = Math.round(Math.sqrt(res2));
  return (s1 * s1 === res1 || s2 * s2 === res2);
}

export function getNumberInfo(nValue: number | string | Decimal): NumberFact {
  const n = new Decimal(nValue);
  const clubs = getClubs(n);
  
  if (n.isZero()) return { title: "Hero of Nothing", description: "Zero is the additive identity. It represents nothingness but is vital for all mathematics!" };
  
  let description = `Value: ${formatDecimal(n)}. `;
  
  if (n.isNegative()) {
    if (n.abs().gte('1e12')) {
      description += "A negative colossus, exerting gravitational pull from the anti-universe. ";
    } else {
      description += "It exists in the mirror realm, south of zero where values are cool and relative. ";
    }
  }
  
  if (clubs.includes("Prime Club")) {
    description += `It is a Prime Number, a fundamental atomic building block of mathematics. `;
  } else if (clubs.includes("Rectangle Club")) {
    description += `It is a Composite Number, divisible into harmonious geometric patterns. `;
  }
  
  if (clubs.includes("Square Club")) {
    description += `It's a Perfect Square! A geometric masterpiece of alignment. `;
  }

  if (clubs.includes("Nice Club")) {
    description += `Nice. `;
  }

  if (n.equals(-15)) {
    description += `The Cursed Fifteen. A value of mysterious dread in the lab. `;
  }
  
  if (clubs.includes("Planet 100")) {
    description += `You've reached Planet 100! A legendary zone of Heroes With Zeroes. `;
  }
  
  if (clubs.includes("Infinity Bound")) {
    description += `Warning: This value is approaching the absolute theoretical event horizon of our laboratory (10^3000003)! `;
  } else if (clubs.includes("Googol Club")) {
    description += `You've reached a Googol! This is more than the number of atoms in the observable universe. `;
  }

  return {
    title: `Observation: ${n.toSignificantDigits(6).toString()}`,
    description: description.trim()
  };
}

export function formatDecimal(n: Decimal): string {
  if (n.abs().lt(1e6) && n.abs().gt(1e-4) || n.isZero()) {
    return n.toNumber().toLocaleString();
  }
  return n.toExponential(4);
}
