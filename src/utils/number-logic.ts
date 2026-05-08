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
  if (absN.gte('1e3003')) clubs.push("Infinity Bound");
  else if (absN.gte('1e1000')) clubs.push("Multiversal Club");
  else if (absN.gte('1e308')) clubs.push("Googolplexian Club");
  else if (absN.gte('1e100')) clubs.push("Googol Club");
  else if (absN.gte('1e12')) clubs.push("Universal Club");
  else if (absN.gte('1e9')) clubs.push("Titan Club");
  else if (absN.gte('1e6')) clubs.push("Giant Club");

  return clubs;
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
  
  if (n.isNegative()) description += "It's a negative value, exploring the void below zero. ";
  
  if (clubs.includes("Prime Club")) {
    description += `It is a Prime Number, a fundamental pillar of mathematics. `;
  } else if (clubs.includes("Rectangle Club")) {
    description += `It is a Composite Number, divisible and flexible. `;
  }
  
  if (clubs.includes("Square Club")) {
    description += `It's a Square! A perfect geometric alignment. `;
  }
  
  if (clubs.includes("Infinity Bound")) {
    description += `This value is reaching the theoretical limits of our lab's computing power at 10^3003! `;
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
