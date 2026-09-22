/**
 * Fuzzy string matching utility for literature duplicate detection
 * Uses clean tokenization and Dice's Coefficient (bigram similarity).
 */

function cleanText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getBigrams(str: string): Set<string> {
  const s = cleanText(str);
  const bigrams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.substring(i, i + 2));
  }
  return bigrams;
}

/**
 * Calculates similarity between two strings from 0.0 (completely different) to 1.0 (identical)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = cleanText(str1);
  const s2 = cleanText(str2);

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) {
    return s1 === s2 ? 1.0 : 0.0;
  }

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);

  let intersection = 0;
  for (const bg of bigrams1) {
    if (bigrams2.has(bg)) {
      intersection++;
    }
  }

  return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
}

/**
 * Checks whether a new paper title is a duplicate of any existing titles in the project.
 * Returns the matching item and similarity score if similarity >= threshold (default 0.70).
 */
export function findDuplicateTitle<T extends { title: string }>(
  newTitle: string,
  existingItems: T[],
  threshold = 0.7
): { isDuplicate: boolean; match?: T; score: number } {
  let highestScore = 0;
  let matchedItem: T | undefined;

  for (const item of existingItems) {
    const score = calculateStringSimilarity(newTitle, item.title);
    if (score > highestScore) {
      highestScore = score;
      matchedItem = item;
    }
  }

  if (highestScore >= threshold && matchedItem) {
    return {
      isDuplicate: true,
      match: matchedItem,
      score: Math.round(highestScore * 100),
    };
  }

  return { isDuplicate: false, score: Math.round(highestScore * 100) };
}
