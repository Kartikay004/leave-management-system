const { calculateWorkingDays } = require("./src/utils/dateUtils");

console.log("--- TEST DATE CALCULATION LOGIC ---");

// Test 1: Mon to Fri (5 working days, 0 weekend days)
const res1 = calculateWorkingDays("2026-10-05", "2026-10-09");
console.log("Test 1 (Mon-Fri):", res1.workingDays === 5 && res1.weekendDays === 0 ? "PASSED" : "FAILED", res1);

// Test 2: Fri to Mon (2 working days, 2 weekend days)
const res2 = calculateWorkingDays("2026-10-09", "2026-10-12");
console.log("Test 2 (Fri-Mon):", res2.workingDays === 2 && res2.weekendDays === 2 ? "PASSED" : "FAILED", res2);

// Test 3: Sat to Sun (0 working days, 2 weekend days)
const res3 = calculateWorkingDays("2026-10-10", "2026-10-11");
console.log("Test 3 (Sat-Sun):", res3.workingDays === 0 && res3.weekendDays === 2 ? "PASSED" : "FAILED", res3);

// Test 4: Single Working Day (Wed to Wed)
const res4 = calculateWorkingDays("2026-10-07", "2026-10-07");
console.log("Test 4 (Wed-Wed):", res4.workingDays === 1 && res4.weekendDays === 0 ? "PASSED" : "FAILED", res4);

// Test 5: Single Weekend Day (Sat to Sat)
const res5 = calculateWorkingDays("2026-10-10", "2026-10-10");
console.log("Test 5 (Sat-Sat):", res5.workingDays === 0 && res5.weekendDays === 1 ? "PASSED" : "FAILED", res5);

console.log("--- ALL DATE TESTS COMPLETED ---");
