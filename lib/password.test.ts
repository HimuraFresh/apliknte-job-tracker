import { test } from "node:test";
import assert from "node:assert/strict";
import { passwordOk, passwordRules } from "./password.ts";

test("la contrasena de Emilio (Hola3/si) cumple todo: la / es simbolo valido", () => {
  assert.equal(passwordOk("Hola3/si"), true);
});

test("detecta que falta cada requisito", () => {
  assert.equal(passwordRules("Hola3sii").symbol, false);
  assert.equal(passwordRules("hola3/si").upper, false);
  assert.equal(passwordRules("HOLA3/SI").lower, false);
  assert.equal(passwordRules("Hola/sii").digit, false);
  assert.equal(passwordRules("Ho3/s").length, false);
});

test("como Supabase, la ñ y las tildes no cuentan como minuscula", () => {
  assert.equal(passwordRules("AÑÓ3/XYZ").lower, false);
  assert.equal(passwordOk("Añejo3/x"), true); // tiene j, e, o, x
});

test("un espacio no es un simbolo", () => {
  assert.equal(passwordRules("Hola3 si").symbol, false);
});
