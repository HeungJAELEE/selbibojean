export function isValidSequencePermutation(
  submittedIds: string[],
  canonicalIds: string[],
) {
  if (submittedIds.length !== canonicalIds.length) return false;
  if (new Set(submittedIds).size !== submittedIds.length) return false;
  const expected = new Set(canonicalIds);
  return submittedIds.every((id) => expected.has(id));
}

export function isCorrectSequence(
  submittedIds: string[],
  canonicalIds: string[],
) {
  return (
    isValidSequencePermutation(submittedIds, canonicalIds) &&
    submittedIds.every((id, index) => id === canonicalIds[index])
  );
}

export function moveSequenceItem(
  ids: string[],
  fromIndex: number,
  toIndex: number,
) {
  if (
    fromIndex < 0 ||
    fromIndex >= ids.length ||
    toIndex < 0 ||
    toIndex >= ids.length ||
    fromIndex === toIndex
  ) {
    return ids;
  }
  const next = [...ids];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function shuffleSequence(
  ids: string[],
  random: () => number = Math.random,
) {
  const next = [...ids];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }
  if (
    next.length > 1 &&
    next.every((id, index) => id === ids[index])
  ) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}
