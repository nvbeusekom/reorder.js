import { range } from './range';
import { inverse_permutation } from './permutation';

export function bandwidth(graph, order) {
  if (!order) order = range(graph.nodes().length);

  var inv = inverse_permutation(order),
    links = graph.links(),
    i,
    e,
    d,
    max = 0;

  for (i = 0; i < links.length; i++) {
    e = links[i];
    d = Math.abs(inv[e.source.index] - inv[e.target.index]);
    max = Math.max(max, d);
  }
  return max;
}
