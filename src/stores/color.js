export const isColorDark = (color) => {
  const [r, g, b] = color.match(/\d+/g).map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 200
};