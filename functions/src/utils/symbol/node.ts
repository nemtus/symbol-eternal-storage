export const SYMBOL_NODES = process.env.SYMBOL_NODES ? process.env.SYMBOL_NODES.split(',') : [];

export const selectRandomNode = () => {
  const randomIndex = Math.floor(Math.random() * SYMBOL_NODES.length);
  return SYMBOL_NODES[randomIndex];
};
