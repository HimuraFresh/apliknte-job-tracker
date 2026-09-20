import { test } from "node:test";
import assert from "node:assert/strict";
import { daysUntil, daysSince, plusDays, toISODate } from "./dates.ts";

// Una tarde cualquiera: la hora no debe influir en el conteo de dias.
const tarde = new Date("2026-09-20T18:30:00");

test("hoy es cero dias, no uno", () => {
  assert.equal(daysUntil("2026-09-20", tarde), 0);
  assert.equal(daysSince("2026-09-20", tarde), 0);
});

test("futuro positivo, pasado negativo", () => {
  assert.equal(daysUntil("2026-09-25", tarde), 5);
  assert.equal(daysUntil("2026-09-18", tarde), -2);
  assert.equal(daysSince("2026-09-18", tarde), 2);
});

test("el seguimiento cae 15 dias despues, cruzando de mes", () => {
  assert.equal(plusDays("2026-09-20", 15), "2026-10-05");
  assert.equal(plusDays("2026-12-25", 15), "2027-01-09");
});

test("fechas invalidas no revientan", () => {
  assert.equal(plusDays("", 15), "");
  assert.equal(daysUntil("no-es-fecha", tarde), 0);
});

test("toISODate usa la fecha local, no UTC", () => {
  // A las 00:30 en Espana (UTC+2) toISOString daria el dia anterior.
  assert.equal(toISODate(new Date("2026-09-20T00:30:00")), "2026-09-20");
});
