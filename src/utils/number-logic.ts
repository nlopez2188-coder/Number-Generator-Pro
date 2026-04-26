/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NumberFact {
  title: string;
  description: string;
}

export function getClubs(n: number): string[] {
  const clubs: string[] = [];
  if (n === 0) {
    clubs.push("Zero Club");
    return clubs;
  }
  
  if (n < 0) clubs.push("Negative Club");
  
  const absN = Math.abs(n);
  
  if (absN % 2 === 0) clubs.push("Even Club");
  else clubs.push("Odd Club");
  
  // Square
  const sqrt = Math.round(Math.sqrt(absN));
  if (sqrt * sqrt === absN) clubs.push("Square Club");
  
  // Cube
  const cbrt = Math.round(Math.pow(absN, 1/3));
  if (cbrt * cbrt * cbrt === absN) clubs.push("Cube Club");
  
  // Triangle (Step Squad)
  // (n * (n+1)) / 2 = absN  => n^2 + n - 2*absN = 0
  const triangleRoot = (-1 + Math.sqrt(1 + 8 * absN)) / 2;
  if (triangleRoot === Math.floor(triangleRoot)) clubs.push("Step Squad");
  
  // Prime
  if (isPrime(absN)) clubs.push("Prime Club");
  else if (absN > 1) clubs.push("Rectangle Club");
  
  // Super large
  if (absN >= 1000000000000) clubs.push("Universal Club");
  else if (absN >= 1000000000) clubs.push("Titan Club");
  else if (absN >= 1000000) clubs.push("Giant Club");
  
  // Fibonacci
  if (isFibonacci(absN)) clubs.push("Fibonacci Club");

  // Lucky numbers (contains 7)
  if (absN.toString().includes("7")) clubs.push("Lucky Club");

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
  // A number is Fibonacci if and only if one or both of (5*n2 + 4) or (5*n2 – 4) is a perfect square
  const res1 = 5 * n * n + 4;
  const res2 = 5 * n * n - 4;
  const s1 = Math.round(Math.sqrt(res1));
  const s2 = Math.round(Math.sqrt(res2));
  return (s1 * s1 === res1 || s2 * s2 === res2);
}

export function getNumberInfo(n: number): NumberFact {
  const absN = Math.abs(n);
  const clubs = getClubs(n);
  
  let description = `Number ${n} is a unique value. `;
  
  if (n === 0) return { title: "Hero of Nothing", description: "Zero is the additive identity. It represents nothingness but is vital for all mathematics!" };
  if (n < 0) description += "It's a negative number, living on the left side of zero. ";
  
  if (clubs.includes("Prime Club")) {
    description += `It is a Prime Number, meaning it only has two factors: 1 and itself. `;
  } else if (absN > 1) {
    description += `It is a Composite Number, which can be shared into many equal rectangles. `;
  }
  
  if (clubs.includes("Square Club")) {
    const s = Math.sqrt(absN);
    description += `It's a Square! Specifically, ${s} by ${s}. `;
  }
  
  if (clubs.includes("Step Squad")) {
    description += `It's a Triangle Number, which means it can be arranged in a staircase shape. `;
  }

  return {
    title: `Fact Sheet: ${n}`,
    description: description.trim()
  };
}
