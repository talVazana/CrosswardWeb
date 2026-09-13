export const getPlayerColor = (id: string) => {
  const colors = ['#fca5a5', '#fdba74', '#fcd34d', '#bef264', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % colors.length;
  return colors[h];
};
