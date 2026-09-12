import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canImportGalleryPhotos,
  isAdminEmail,
  isStagingHost,
} from './adminAccess';

describe('isStagingHost', () => {
  it('recognizes the Netlify staging alias', () => {
    assert.equal(isStagingHost('staging--catdex-beta.netlify.app'), true);
  });

  it('rejects production', () => {
    assert.equal(isStagingHost('catdex-beta.netlify.app'), false);
  });

  it('allows local web', () => {
    assert.equal(isStagingHost('localhost'), true);
  });
});

describe('canImportGalleryPhotos', () => {
  it('always allows the admin account', () => {
    assert.equal(canImportGalleryPhotos('admin@gmail.com'), true);
  });

  it('does not treat a random production user as admin', () => {
    assert.equal(isAdminEmail('qa@example.com'), false);
  });
});
