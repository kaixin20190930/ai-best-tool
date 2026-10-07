import assert from 'node:assert/strict';

export function validateVideoUrl(slug: string, videoUrl?: string) {
  if (videoUrl === undefined) {
    assert.notEqual(slug, 'elicit', 'elicit: official video URL is required');
    return;
  }
  const video = new URL(videoUrl);
  assert.equal(video.protocol, 'https:', `${slug}: video must use HTTPS`);
  assert.equal(video.hostname, 'www.youtube-nocookie.com', `${slug}: video must use privacy-enhanced YouTube embed`);
  assert.match(video.pathname, /^\/embed\/[A-Za-z0-9_-]{11}$/, `${slug}: video must be an embed URL`);
  assert.equal(video.search, '', `${slug}: video embed query is not allowed`);
}

export function assertVideoReadback(slug: string, expected: string | undefined, actual: string | null) {
  if (expected) assert.equal(actual, expected, `${slug}: video URL readback mismatch`);
}
