"use strict";

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "idols.json");

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  fail(`invalid JSON — ${error.message}`);
}

if (!Array.isArray(data)) {
  fail("the root value must be an array");
}

const required = ["name", "group", "agency", "gender", "dob", "cat"];
const seen = new Set();

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

data.forEach((record, index) => {
  const row = index + 1;

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail(`record ${row} must be an object`);
  }

  required.forEach((key) => {
    if (!(key in record)) fail(`record ${row} is missing "${key}"`);
    if (typeof record[key] !== "string") {
      fail(`record ${row} field "${key}" must be a string`);
    }
  });

  if (!record.name.trim()) fail(`record ${row} has an empty name`);
  if (!record.group.trim()) fail(`record ${row} has an empty group`);
  if (!["M", "F"].includes(record.gender)) {
    fail(`record ${row} gender must be M or F`);
  }
  if (!validDate(record.dob)) {
    fail(`record ${row} has an invalid dob: ${record.dob}`);
  }

  const duplicateKey = `${record.name.trim()}::${record.group.trim()}`;
  if (seen.has(duplicateKey)) {
    fail(`duplicate name + group: ${record.name} / ${record.group}`);
  }
  seen.add(duplicateKey);
});

console.log(`Validation passed: ${data.length} records`);
