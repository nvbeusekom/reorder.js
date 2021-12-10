# Simultaneous Matrix Reorderings
[This repository](https://github.com/nvbeusekom/reorder.js/) is forked from the [Reorder.js](https://github.com/jdfekete/reorder.js/) library to show examples of how existing methods can be adapted to make simultaneous reorderings.
This code is referenced and used in the paper Simultaneous Matrix Orderings for Graph Collections. Nathan van Beusekom, Wouter Meulemans, Bettina Speckmann (IEEE VIS 2021, to appear).  

## Functionality
The application allows one to run the ten algorithms described in the paper on several datasets and examples.
At the top, you can select a dataset. FLT, SCH and VIS are described in the paper. Additionally four matrices are available which are used to compare algorithms in the survey 
Matrix Reordering Methods for Table and Network Visualization. Michael Behrisch, Benjamin Bach, Nathalie Henry Riche, Tobias Schreck, Jean-Daniel Fekete (2016).
Finally, there is an option to reproduce the example from Figure 1 of our paper.

After choosing a dataset, one of the algorithms can be chosen to run on the dataset. The algorithms are described in the paper.
Some of the algorithms are only called on one timestep (Gx), which can be chosen in the top row.
In case of a leaf order algorithm, the user can optionally choose to square the distances.
Note that all matrices will always have the same order.

At the bottom of the page, after running an algorithm, a summary of statistics is displayed. 


Below is the original README with instructions on running the example and credits to the original library.


# Reorder.js (Original README)

[Reorder.js](https://github.com/jdfekete/reorder.js/) is a JavaScript library for reordering matrices, i.e. either tables, graphs vertices, or parallel coordinates axes.

Want to learn more? [See the wiki.](https://github.com/jdfekete/reorder.js/wiki)


## Development

To develop Reordering.js, you need to have [Node.js](http://www.nodejs.org)
and [NPM](http://www.npmjs.org) installed. Once you have done that, run the
following from the root directory of this repository to install the development
dependencies:

```
npm install
```

## Testing

To run the tests in the distribution, use the following command:

```
npm run test
```
## Examples

To run the examples, use the following command:

```
npm run dev
```

It should open a web browser but if does not, open a web page and connect to: `http://localhost:3004/`.

## References

The library is used by several systems, including [Bertifier](https://www.aviz.fr/bertifier), [The Vistorian](https://vistorian.net/), and [Compadre](https://renecutura.eu/compadre/).

## Thanks

Thanks to [Curran Kelleher @curran](https://github.com/curran) for adapting the library to modern JavaScript modules.

Thanks to [Philippe Rivière @fil](https://github.com/fil) for porting the "Les Misérables" example to [observablehq](https://observablehq.com/@fil/hello-reorder-js)

Thanks to [Renaud Blanch](http://iihm.imag.fr/blanch/) for giving me his implementation of the 'Optimal Leaf Ordering' algorithm. He has improved it and the distribution is available as [ordering](https://bitbucket.org/rndblnch/ordering).

I originally started this in order to add a reordering module to
[D3.js](http://mbostock.github.com/d3/).

The project structure and Makefile is based on that of D3, so a big thank you
goes to [Mike Bostock](http://bost.ocks.org/mike/) for this.
