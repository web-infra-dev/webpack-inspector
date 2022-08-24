export const BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3333';

export async function getModuleList() {
  const res = await fetch(`${BASE_URL}/module-list`);
  return res.json();
}

export async function getTransformInfo(id: string) {
  const res = await fetch(`${BASE_URL}/transform-list?id=${id}`);
  return res.json();
}

export async function getLoaderInfo() {
  const res = await fetch(`${BASE_URL}/loader-list`);
  return res.json();
}

export async function getWebpackConfig() {
  const res = await fetch(`${BASE_URL}/config`);
  return res.json();
}

export async function getOutputFiles() {
  const res = await fetch(`${BASE_URL}/output`);
  return res.json();
}
