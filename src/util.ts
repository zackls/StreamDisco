// mod operator that isnt trash and can handle negative numbers
export const mod = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

export const streamTitleToHashLocation = (name: string) =>
  name.replace(/ /g, "").toLocaleLowerCase();
