import React from 'react';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import BaseImage, { type ImageProps } from '../components/image/BaseImage';

export function verifyBaseImageBehavior() {
  const render = (props: Partial<ImageProps>) => {
    const html = renderToStaticMarkup(
      React.createElement(BaseImage, { src: '/fixture.png', width: 100, height: 80, alt: 'Fixture image', ...props }),
    );
    const image = new JSDOM(html).window.document.querySelector('img');
    assert(image, 'BaseImage must render an image.');
    return image;
  };
  const raster = render({});
  assert.equal(raster.getAttribute('loading'), 'lazy');
  assert.match(raster.getAttribute('src') || '', /^\/_next\/image\?/);
  assert.match(raster.getAttribute('style') || '', /background-image:/, 'Raster blur placeholder is required.');
  assert.equal(raster.getAttribute('alt'), 'Fixture image');
  assert.equal(render({ priority: true }).getAttribute('loading'), 'eager');
  assert.equal(render({ loading: 'eager' }).getAttribute('loading'), 'eager');
  const svg = render({ src: '/fixture.svg' });
  assert.equal(svg.getAttribute('src'), '/fixture.svg', 'SVG must bypass raster optimization.');
  assert.equal(svg.getAttribute('loading'), 'lazy');
  assert(!svg.getAttribute('style')?.includes('background-image:'), 'SVG must not acquire a raster blur.');
  const externalPreview = render({ src: 'https://asset.example/preview.png', unoptimized: true });
  assert.equal(externalPreview.getAttribute('src'), 'https://asset.example/preview.png');
  assert.equal(externalPreview.getAttribute('loading'), 'lazy');
  assert(!render({ placeholder: 'empty' }).getAttribute('style')?.includes('background-image:'));
}
