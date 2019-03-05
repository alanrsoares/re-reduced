"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSnakeCase = (s) => /^([A-Z]_*)+$/g.test(s);
exports.toPascalCase = (s) => s.toLowerCase().replace(/_(\w)/g, match => `${match[1].toUpperCase()}`);
exports.toSnakeCase = (s) => s.replace(/(([a-z])([A-Z]))/g, ([a, b]) => `${a}_${b}`).toUpperCase();
