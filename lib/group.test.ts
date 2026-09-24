import { test } from "node:test";
import assert from "node:assert/strict";
import { groupBy, dupKey } from "./group.ts";

test("junta sin mirar mayusculas, tildes ni espacios, y pone primero los grupos grandes", () => {
  const rows = [
    { company: "Telefónica" },
    { company: "Indra" },
    { company: "telefonica " },
    { company: "indra" },
    { company: "INDRA" },
  ];
  assert.deepEqual(
    groupBy(rows, "company").map((g) => [g[0].company, g.length]),
    [
      ["Indra", 3],
      ["Telefónica", 2],
    ],
  );
});

test("la misma empresa y puesto el mismo dia es la misma candidatura", () => {
  const a = { company: "Indra", role: "Data Analyst", applied_on: "2026-09-20" };
  assert.equal(dupKey(a), dupKey({ ...a, company: " INDRA " }));
  assert.equal(dupKey(a), dupKey({ ...a, role: "data analyst" }));
  // otra fecha es otra candidatura: se puede volver a aplicar meses despues
  assert.notEqual(dupKey(a), dupKey({ ...a, applied_on: "2026-12-01" }));
});
