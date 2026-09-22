import { test } from "node:test";
import assert from "node:assert/strict";
import { toEuros } from "./money.ts";

test("por debajo de 200 son miles; desde 200, euros tal cual", () => {
  assert.equal(toEuros("25"), 25000);
  assert.equal(toEuros("25.5"), 25500);
  assert.equal(toEuros("300"), 300); // beca mensual de practicas
  assert.equal(toEuros("0.3"), 300); // lo guardado con el truco anterior sigue igual
  assert.equal(toEuros("25000"), 25000);
  assert.equal(toEuros(""), null);
  assert.equal(toEuros(null), null);
});
