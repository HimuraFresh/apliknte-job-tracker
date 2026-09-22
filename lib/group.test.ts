import { test } from "node:test";
import assert from "node:assert/strict";
import { groupBy } from "./group.ts";

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
