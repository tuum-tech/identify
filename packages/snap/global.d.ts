import { MetaMaskInpageProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/snaps-utils';
declare global {
    var ethereum: MetaMaskInpageProvider;
    var snap: SnapsGlobalObject;
}