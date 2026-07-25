// Explicit curriculum contract between the 20 written-theory lessons and the
// normalized C001-C040 concept map. A learning item may appear in more than one
// lesson when its concept is intentionally reviewed from two exam perspectives.
export const bdaLessonConceptMap: Record<string, string[]> = {
  "bda-s1-data-dikw": ["C002"],
  "bda-s1-bigdata-value": ["C001", "C002"],
  "bda-s1-governance-quality": ["C004", "C008", "C040"],
  "bda-s1-methodology-planning": ["C005", "C006"],
  "bda-s1-collection-storage": ["C003", "C007", "C009", "C037"],
  "bda-s2-scales-preprocessing": ["C013", "C014", "C037"],
  "bda-s2-missing-outlier": ["C010", "C011", "C040"],
  "bda-s2-sampling-pca": ["C012", "C017"],
  "bda-s2-statistics-distributions": ["C015", "C016", "C017", "C018"],
  "bda-s2-hypothesis-anova": ["C018", "C019", "C028", "C039"],
  "bda-s3-model-variable": ["C020", "C040"],
  "bda-s3-logistic-tree": ["C021", "C022", "C023"],
  "bda-s3-svm-ann": ["C024", "C029"],
  "bda-s3-ensemble-evaluation": ["C030", "C031", "C038"],
  "bda-s3-cluster-timeseries": ["C025", "C026", "C027", "C028"],
  "bda-s4-regression-classification-metrics": ["C014", "C031", "C038"],
  "bda-s4-crossvalidation-overfit": ["C020", "C032", "C033", "C040"],
  "bda-s4-regularization-optimization": ["C032", "C033"],
  "bda-s4-xai": ["C034", "C040"],
  "bda-s4-visualization-deployment": ["C035", "C036", "C038", "C040"],
};
