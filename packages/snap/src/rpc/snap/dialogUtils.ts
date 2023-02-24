import { divider, heading, panel, Panel, text } from '@metamask/snaps-ui';
import { VerifiableCredential } from '@veramo/core';
import { IDataManagerQueryResult } from 'src/veramo/plugins/verfiable-creds-manager';

/**
 * Function to toggle popups.
 *
 * @param header - Identity snap params.
 * @param prompt - Identity snap params.
 * @param description - Identity snap params.
 * @param vcs - Identity snap params.
 */
export async function generateVCPanel(
  header: string,
  prompt: string,
  description: string,
  vcs: IDataManagerQueryResult[],
): Promise<Panel> {
  const panelToShow = [
    heading(header),
    text(prompt),
    divider(),
    text(description),
  ];
  vcs.forEach((vc, index) => {
    const vcData = vc.data as VerifiableCredential;
    delete vcData.credentialSubject.id;
    delete vcData.credentialSubject.hederaAccountId;
    panelToShow.push(divider());
    panelToShow.push(text(`Credential #${index + 1}`));
    panelToShow.push(divider());
    panelToShow.push(text('ID: '));
    panelToShow.push(text(vc.metadata.id));
    panelToShow.push(text('TYPE:'));
    panelToShow.push(text(JSON.stringify(vcData.type)));
    panelToShow.push(text('SUBJECT:'));
    panelToShow.push(text(JSON.stringify(vcData.credentialSubject)));
    panelToShow.push(text('ISSUANCE DATE:'));
    const issuanceDate = new Date(vcData.issuanceDate as string).toLocaleString(
      undefined,
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      },
    );
    panelToShow.push(text(issuanceDate));
    panelToShow.push(text('EXPIRATION DATE:'));
    const expirationDate = new Date(
      vcData.expirationDate as string,
    ).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    });
    panelToShow.push(text(expirationDate));
  });
  return panel(panelToShow);
}
