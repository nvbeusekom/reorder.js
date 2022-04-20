import { distance as distances } from './distance';

export function dist() {
  let distance = distances.euclidean;

  function dist(vectors,square) {
    const n = vectors.length;

    if(!Array.isArray(vectors[0][0])){
        const res = [];
        for (let i = 0; i < n; i++) {
            const d = [];
            res[i] = d;
            for (let j = 0; j < n; j++) {
              if (j < i) {
                d[j] = (res[j][i]);
              } else if (i === j) {
                d[j] = 0;
              } else {
                if(square){
                    d[j] = distance(vectors[i], vectors[j]) * distance(vectors[i], vectors[j]);
                }
                else{
                    d[j] = distance(vectors[i], vectors[j]);
                }
              }
            }
        }
        return res;
    }
    else{
        var res = [];
        for (var i = 0; i < vectors[0].length; i++) {
            var newrow = [];
            for (var j = 0; j < vectors[0][0].length; j++) {
                newrow.push(0);
            }
            res.push(newrow);
        }
        for (let k = 0; k < n; k++){
            var distMatrix = [];
            const vector = vectors[k];
            const n1 = vector.length;
            for (let i = 0; i < n1; i++) {
                const d = [];
                distMatrix[i] = d;
                for (let j = 0; j < n1; j++) {
                  if (j < i) {
                    d[j] = (distMatrix[j][i]);
                  } else if (i === j) {
                    d[j] = 0;
                  } else {
                    d[j] = distance(vector[i], vector[j]);
                  }
                }
            }
            for (var i = 0; i < distMatrix.length; i++) {
                for (var j = 0; j <distMatrix[0].length; j++) {
                    if(square){
                        res[i][j] += distMatrix[i][j] * distMatrix[i][j];
                    }
                    else{
                        res[i][j] += distMatrix[i][j];
                    }
                }
                
            }
        }
    }
    return res;
  }

  dist.distance = function (x) {
    if (!arguments.length) {
      return distance;
    }
    distance = x;
    return dist;
  };

  return dist;
}

export function distmax(distMatrix) {
  let max = 0;
  const n = distMatrix.length;

  for (let i = 0; i < n; i++) {
    const row = distMatrix[i];
    for (let j = i + 1; j < n; j++) {
      if (row[j] > max) {
        max = row[j];
      }
    }
  }

  return max;
}

export function distmin(distMatrix) {
  let min = Infinity;
  const n = distMatrix.length;

  for (let i = 0; i < n; i++) {
    const row = distMatrix[i];
    for (let j = i + 1; j < n; j++) {
      if (row[j] < min) {
        min = row[j];
      }
    }
  }

  return min;
}

export function dist_remove(dist, n, m = n + 1) {
  dist.splice(n, m - n);
  for (let i = dist.length; i-- > 0; ) {
    dist[i].splice(n, m - n);
  }
  return dist;
}
