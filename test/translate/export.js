export function A() {}
export var X;

function B() {}
export B;

function C() {}
export C;
export C as D;
export B from E.A;

export * from Z;
export * from "Z.js";