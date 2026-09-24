import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, mapRows, readDate } from "./importar.ts";

test("lee un CSV con punto y coma, comillas y separador dentro del texto", () => {
  const table = parse('Empresa;Puesto;Notas\r\n"Acme; SL";Analista;"dijo ""ya te llamamos"""\r\n');
  assert.deepEqual(table, [
    ["Empresa", "Puesto", "Notas"],
    ["Acme; SL", "Analista", 'dijo "ya te llamamos"'],
  ]);
});

test("se traga la marca invisible que Excel pone al principio", () => {
  assert.deepEqual(parse("﻿Empresa;Puesto\nIndra;Data Analyst"), [
    ["Empresa", "Puesto"],
    ["Indra", "Data Analyst"],
  ]);
});

test("lee celdas pegadas de Excel, que vienen con tabuladores", () => {
  assert.deepEqual(parse("Empresa\tPuesto\nIndra\tData Analyst"), [
    ["Empresa", "Puesto"],
    ["Indra", "Data Analyst"],
  ]);
});

test("fechas en los formatos que escriben Excel y Sheets", () => {
  assert.equal(readDate("20/09/2026"), "2026-09-20");
  assert.equal(readDate("2026-9-5"), "2026-09-05");
  assert.equal(readDate("5-9-26"), "2026-09-05");
  assert.equal(readDate("03/15/2026", true), "2026-03-15");
  assert.equal(readDate("no es una fecha"), null);
  assert.equal(readDate("20/20/2026"), null);
});

test("reconoce las columnas se llamen como se llamen y traduce los valores", () => {
  const { drafts, columns, ignored } = mapRows(
    parse(
      [
        "Compañía;Cargo;Situación;Modo;Salario mínimo;Fecha de aplicación;Contactado;Link;Color favorito",
        "Indra;Data Analyst;Rechazada;Teletrabajo;25000;20/09/2026;Sí;https://indra.es/1;azul",
        "Alsea;BI Junior;2ª entrevista;Híbrido;30;01/09/2026;no;javascript:alert(1);verde",
      ].join("\n"),
    ),
    [],
    "2026-09-24",
  );

  assert.equal(drafts.length, 2);
  assert.equal(columns.company, "0");
  assert.deepEqual(ignored, ["Color favorito"]);

  assert.deepEqual(drafts[0], {
    company: "Indra",
    role: "Data Analyst",
    status: "rechazado",
    work_mode: "remoto",
    source: null,
    salary_min: 25000,
    salary_max: null,
    applied_on: "2026-09-20",
    follow_up_on: null,
    followed_up: true,
    url: "https://indra.es/1",
    notes: null,
    cv_version_id: null,
  });

  assert.equal(drafts[1].status, "entrevista_2");
  assert.equal(drafts[1].work_mode, "hibrido");
  // 30 son 30.000 €, como en el formulario
  assert.equal(drafts[1].salary_min, 30000);
  assert.equal(drafts[1].followed_up, false);
  // un enlace que no es navegable no se guarda
  assert.equal(drafts[1].url, null);
});

test("sin empresa o sin puesto, la fila se queda fuera", () => {
  const { drafts } = mapRows(parse("Empresa;Puesto\nIndra;\n;Analista\nAlsea;BI"), [], "2026-09-24");
  assert.deepEqual(
    drafts.map((d) => d.company),
    ["Alsea"],
  );
});

test("sin fecha, la de hoy; y el CV se enlaza por su nombre", () => {
  const { drafts } = mapRows(
    parse("Empresa;Puesto;CV\nIndra;Data Analyst;CV Data"),
    [{ id: "abc", label: "CV Data" }],
    "2026-09-24",
  );
  assert.equal(drafts[0].applied_on, "2026-09-24");
  assert.equal(drafts[0].cv_version_id, "abc");
});

test("una plantilla inglesa: fechas mm/dd, sueldo en rango y columnas en ingles", () => {
  const hoja = [
    "Company Name,Job Title,Date Applied,Application Status,Salary Range,Job Posting URL,Follow-up date,Contacted?,Notes",
    "Acme Corp,Data Analyst,03/15/2026,Rejected,45000,https://acme.com/1,04/01/2026,Yes,nada aun",
  ].join("\n");
  const { drafts, ignored } = mapRows(parse(hoja), [], "2026-09-24");

  assert.deepEqual(ignored, []);
  assert.equal(drafts[0].role, "Data Analyst");
  assert.equal(drafts[0].url, "https://acme.com/1");
  // 03/15 no puede ser el mes 15: la hoja esta en mm/dd, y la otra fecha tambien
  assert.equal(drafts[0].applied_on, "2026-03-15");
  assert.equal(drafts[0].follow_up_on, "2026-04-01");
  assert.equal(drafts[0].salary_min, 45000);
  assert.equal(drafts[0].status, "rechazado");
  assert.equal(drafts[0].followed_up, true);
});

test("una hoja casera: nombres raros de columna y el sueldo en una sola celda", () => {
  const hoja = [
    "Nombre de la empresa;Vacante;¿Cuándo apliqué?;Sueldo;Web;Modalidad",
    "Telefónica;Analista;12/09/2026;30.000 - 35.000 €;https://tele.es/1;Remoto",
  ].join("\n");
  const { drafts, ignored } = mapRows(parse(hoja), [], "2026-09-24");

  assert.deepEqual(ignored, []);
  assert.equal(drafts[0].applied_on, "2026-09-12");
  assert.equal(drafts[0].salary_min, 30000);
  assert.equal(drafts[0].salary_max, 35000);
  assert.equal(drafts[0].work_mode, "remoto");
  assert.equal(drafts[0].url, "https://tele.es/1");
});

test("una columna de enlaces no se queda con el puesto aunque se llame job_url", () => {
  const hoja = [
    "company;job_url;job_title",
    "AILTENT IT;https://infojobs.net/1;Data Analytics Engineer",
  ].join("\n");
  const { drafts } = mapRows(parse(hoja));

  assert.equal(drafts[0].role, "Data Analytics Engineer");
  assert.equal(drafts[0].url, "https://infojobs.net/1");
});

test("el maximo no se confunde con el minimo", () => {
  const { drafts } = mapRows(parse("Empresa,Puesto,Min salary,Max salary\nAlsea,BI,25000,35000"));
  assert.equal(drafts[0].salary_min, 25000);
  assert.equal(drafts[0].salary_max, 35000);
});

test("la fecha de seguimiento no se queda con la de aplicacion", () => {
  const { drafts } = mapRows(
    parse("Empresa;Puesto;Fecha;Fecha de seguimiento\nIndra;BI;01/09/2026;20/09/2026"),
  );
  assert.equal(drafts[0].applied_on, "2026-09-01");
  assert.equal(drafts[0].follow_up_on, "2026-09-20");
});
