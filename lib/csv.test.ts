import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv.ts";

test("entrecomilla solo cuando hace falta", () => {
  const csv = toCsv([
    ["Empresa", "Nota"],
    ["Indra", "todo bien"],
    ["Acme; SL", 'dijo "ya te llamamos"'],
    ["Ahorramas", "linea 1\nlinea 2"],
  ]);
  const lines = csv.replace("\uFEFF", "").split("\r\n");
  assert.equal(lines[0], "Empresa;Nota");
  assert.equal(lines[1], "Indra;todo bien");
  assert.equal(lines[2], '"Acme; SL";"dijo ""ya te llamamos"""');
  assert.ok(lines[3].startsWith('Ahorramas;"linea 1'));
});

test("empieza por la marca que necesita Excel para las tildes", () => {
  assert.ok(toCsv([["Vía"]]).startsWith("\uFEFF"));
});
