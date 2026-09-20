# Acuerdo: gestor de candidaturas de empleo

Confirmado por el usuario el 2026-09-20, tras entrevista.

## Qué es

Un sitio donde registrar cada candidatura en segundos y explorar después el
historial propio, filtrando por lo que se quiera. Sustituye a un Google Sheets.

## Decisiones cerradas

- **Usuario**: para el autor ahora, pero con cuentas desde el día uno, pensado
  para que lo use más gente si funciona.
- **Éxito**: dos semanas de uso real sin volver a abrir el Sheets.
- **Límite**: gratis de partida. Un coste pequeño se evalúa entre los dos antes
  de asumirlo.
- **Login**: correo y contraseña (Supabase). Google se añade después si apetece.
- **Idioma**: español por defecto, inglés disponible, selector al entrar.
- **Avisos**: solo dentro de la app al entrar. Correo y SMS quedan previstos en
  la estructura, pero apagados.

## Pantalla principal

No es un tablero kanban. Es un sitio para **explorar el historial**: un resumen
arriba, agrupación por empresa y por puesto, y filtros por cualquier campo
(fecha, estado, modalidad, versión de CV). Arriba, una franja con los
seguimientos que tocan hoy.

## Datos de cada candidatura

empresa · puesto · vía · URL · modalidad (presencial/híbrido/remoto) ·
rango salarial · fecha en que se aplicó · versión de CV enviada · estado ·
fecha de seguimiento · si ya se hizo · días transcurridos (calculado, no se
guarda).

## Alta rápida

Empresa y puesto con autocompletado: lista fija de ~500 empresas españolas
combinada con lo que el usuario ya haya escrito antes. Modalidad, vía, estado y
CV con botones, sin teclear. La fecha se rellena sola.

## CVs

El usuario sube PDFs. Al terminar la subida se le pregunta "¿Qué tipo de CV
es?" y la etiqueta que escriba queda creada como categoría reutilizable. Al
registrar una candidatura elige cuál envió.

## Fuera de alcance

- Ayudar a aplicar (rellenar formularios, redactar cartas) → otro proyecto.
- Importar el Sheets actual: se empieza de cero a propósito, para probar el
  circuito completo.
- Envío real de correos o SMS.
- Leer ofertas de LinkedIn/Indeed automáticamente: lo bloquean y se rompe.
- Espacio publicitario para empresas: aplazado hasta que exista un anunciante
  real. La estructura de datos no debe estorbarlo, pero no se construye.

## Stack

Next.js + TypeScript en Vercel. Supabase para datos, cuentas y PDFs.
Tailwind + shadcn/ui. Diccionario es/en propio, sin librería de traducción.
