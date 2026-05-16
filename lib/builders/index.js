import * as enterpriseMasterProfile from './enterprise-master-profile.js';
import * as v3 from './v3.js';
import * as v3ElixaxLast from './v3-elixax-last.js';
import * as freelance from './freelance.js';
import * as freelanceSlim from './freelance-slim.js';

export const builders = {
  [enterpriseMasterProfile.meta.id]: enterpriseMasterProfile,
  [v3.meta.id]: v3,
  [v3ElixaxLast.meta.id]: v3ElixaxLast,
  [freelance.meta.id]: freelance,
  [freelanceSlim.meta.id]: freelanceSlim,
};

// Order matters — the home page renders cards in this order. The Enterprise
// Master Profile leads because it's the deepest, most consulting-oriented
// artifact; the four 2-page variants follow for general / freelance use.
export const variants = [
  enterpriseMasterProfile.meta,
  v3.meta,
  v3ElixaxLast.meta,
  freelance.meta,
  freelanceSlim.meta,
];
