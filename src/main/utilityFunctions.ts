import {parsePageFromUrl} from 'Main/pageParser';
import {get} from 'Main/client';
import {WistiaAsset, WistiaMedia} from 'MainTypes/types';
import {Resolution} from 'Types/types';

// TODO think of a better name for this file

export async function getMediaOptionsForVideo(url: string) {
  const videoParsed = await parsePageFromUrl(url, 'video');

  const mediaJson = await get(videoParsed[0].nextUrl);

  const wistiaMedia = JSON.parse(mediaJson) as WistiaMedia;

  return wistiaMedia.media.assets.filter(x => x.ext === 'mp4' || x.slug === 'original' || x.type === 'still_image');
}

export function getClosestQuality(assets: WistiaAsset[], resolution: Resolution) {
  const exactMatch = assets.find(x => x.height === resolution.height && x.width === resolution.width);

  if (exactMatch) {
    return exactMatch;
  }

  const referenceAsset = {
    width: resolution.width,
    height: resolution.height,
    bitrate: 0,
    ext: '',
    display_name: '',
    type: '',
    size: 0,
    codec: '',
    url: '',
    slug: ''
  };

  assets.push(referenceAsset);

  assets = assets.sort((a, b) => {
    return (a.height * a.width) - (b.height * b.width);
  });

  const insertedPosition = assets.indexOf(referenceAsset);
  const isAtTop = insertedPosition === assets.length - 1;

  return isAtTop ? assets[assets.length - 2] : assets[insertedPosition + 1];
}
