import { SnapsGlobalObject } from '@metamask/snaps-types';

export const getMetamaskVersion = async (
  snap: SnapsGlobalObject
): Promise<string> =>
  (await snap.request({
    method: 'web3_clientVersion',
    params: [],
  })) as string;

export const isNewerVersion = (
  current: string,
  comparingWith: string
): boolean => {
  if (current === comparingWith) {
    return false;
  }

  const regex = /[^\d.]/gu;
  const currentFragments = current.replace(regex, '').split('.');
  const comparingWithFragments = comparingWith.replace(regex, '').split('.');

  const length =
    currentFragments.length > comparingWithFragments.length
      ? currentFragments.length
      : comparingWithFragments.length;
  for (let i = 0; i < length; i++) {
    if (
      (Number(currentFragments[i]) || 0) ===
      (Number(comparingWithFragments[i]) || 0)
    ) {
      continue;
    }
    return (
      (Number(comparingWithFragments[i]) || 0) >
      (Number(currentFragments[i]) || 0)
    );
  }

  return true;
};
