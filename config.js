"use strict";
/**
 * Entry point to the project config.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + '/.env' });
exports.default = Object.assign(process.env, { sourceDir: __dirname });
