export const sliceChunksByNumber = (chunks: string[], number: number): string[][] => {
  const length = Math.ceil(chunks.length / number);
  const array: string[][] = new Array(length).fill([]);
  array.map((_, i) => {
    chunks.slice(i * number, (i + 1) * number);
  });
  return array;
};

export const stringToChunks = (originalString: string, chunkSize: number): string[] => {
  const chunks = [];
  for (let i = 0; i < originalString.length; i += chunkSize) {
    chunks.push(originalString.slice(i, i + chunkSize));
  }
  return chunks;
};
