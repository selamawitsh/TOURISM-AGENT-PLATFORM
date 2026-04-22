package embeddings

import (
    "math"
)

func Cosine(a, b []float64) float64 {
    if len(a) != len(b) || len(a) == 0 {
        return 0
    }
    var dot, na, nb float64
    for i := range a {
        dot += a[i] * b[i]
        na += a[i] * a[i]
        nb += b[i] * b[i]
    }
    if na == 0 || nb == 0 {
        return 0
    }
    return dot / (math.Sqrt(na) * math.Sqrt(nb))
}

// Recommend returns indices of top N most similar vectors to query.
func Recommend(vectors [][]float64, query []float64, topN int) []int {
    type pair struct{ idx int; score float64 }
    ps := make([]pair, 0, len(vectors))
    for i, v := range vectors {
        ps = append(ps, pair{i, Cosine(v, query)})
    }
    // simple selection sort for topN (small N)
    res := make([]int, 0, topN)
    for k := 0; k < topN && k < len(ps); k++ {
        best := k
        for j := k+1; j < len(ps); j++ {
            if ps[j].score > ps[best].score { best = j }
        }
        ps[k], ps[best] = ps[best], ps[k]
        res = append(res, ps[k].idx)
    }
    return res
}
