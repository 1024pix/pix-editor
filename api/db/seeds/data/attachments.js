import { cycle } from './utils.js';

const iterForData = cycle([
  {
    filename: 'SEEDS_poireau.png',
    mimeType: 'image/png',
    size: 7155,
    urlForTypeIllustration:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385540690/SEEDS_poireau.png',
    urlForTypeAttachment:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385541460/UHQVGOKEDI.png',
  },
  {
    filename: 'SEEDS_olive.png',
    mimeType: 'image/png',
    size: 2189,
    urlForTypeIllustration:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385614972/SEEDS_olive.png',
    urlForTypeAttachment:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385615325/GHJYVAKPZU.png',
  },
  {
    filename: 'SEEDS_brocoli.jpeg',
    mimeType: 'image/jpeg',
    size: 4498,
    urlForTypeIllustration:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385881871/SEEDS_brocoli.jpeg',
    urlForTypeAttachment:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385882781/KVSUGQBUQQ.jpeg',
  },
  {
    filename: 'SEEDS_carotte.png',
    mimeType: 'image/png',
    size: 3470,
    urlForTypeIllustration:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385957127/SEEDS_carotte.png',
    urlForTypeAttachment:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747385957448/NCGRJRKLVF.png',
  },
  {
    filename: 'SEEDS_cerise.png',
    mimeType: 'image/png',
    size: 3869,
    urlForTypeIllustration:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747386024743/SEEDS_cerise.png',
    urlForTypeAttachment:
      'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-lcms-attachments-review/1747386025148/RRXILBIXHL.png',
  },
]);

export function buildAttachment({ challengeId, localizedChallengeId, type, databaseBuilder, locale }) {
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challengeId}.illustrationAlt`,
    locale: locale,
    value: `value ${locale} for illustrationAlt`,
  });
  const attachmentData = iterForData.next().value;
  return databaseBuilder.factory.buildAttachment({
    id: `attachment${localizedChallengeId.split('challenge')[1]}`.replaceAll('-', ''),
    filename: attachmentData.filename,
    mimeType: attachmentData.mimeType,
    size: attachmentData.size,
    type,
    url: type === 'illustration' ? attachmentData.urlForTypeIllustration : attachmentData.urlForTypeAttachment,
    challengeId,
    localizedChallengeId,
  });
}
