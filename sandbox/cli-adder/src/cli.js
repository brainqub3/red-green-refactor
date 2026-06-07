#!/usr/bin/env node
import { add } from './add.js';

const [a, b] = process.argv.slice(2).map(Number);
console.log(add(a, b));
