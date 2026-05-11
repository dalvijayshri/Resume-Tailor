import * as v3 from './v3.js';
import * as v3ElixaxLast from './v3-elixax-last.js';
import * as freelance from './freelance.js';
import * as freelanceSlim from './freelance-slim.js';

export const builders = {
  [v3.meta.id]: v3,
  [v3ElixaxLast.meta.id]: v3ElixaxLast,
  [freelance.meta.id]: freelance,
  [freelanceSlim.meta.id]: freelanceSlim,
};

export const variants = [
  v3.meta,
  v3ElixaxLast.meta,
  freelance.meta,
  freelanceSlim.meta,
];
