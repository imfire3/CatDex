import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isPublicAuthPath, shouldRedirectToWelcome } from './authRoutes';

describe('isPublicAuthPath', () => {
  it('allows welcome, login, signup and the site root', () => {
    assert.equal(isPublicAuthPath('/'), true);
    assert.equal(isPublicAuthPath('/welcome'), true);
    assert.equal(isPublicAuthPath('/login'), true);
    assert.equal(isPublicAuthPath('/signup'), true);
    assert.equal(isPublicAuthPath('/(auth)/welcome'), true);
    assert.equal(isPublicAuthPath('/auth/callback'), true);
  });

  it('sends map and the rest of the app to the auth gate', () => {
    assert.equal(isPublicAuthPath('/map'), false);
    assert.equal(isPublicAuthPath('/(tabs)/map'), false);
    assert.equal(isPublicAuthPath('/catdex'), false);
    assert.equal(isPublicAuthPath('/profile'), false);
    assert.equal(isPublicAuthPath('/settings'), false);
    assert.equal(isPublicAuthPath('/scanner'), false);
    assert.equal(isPublicAuthPath('/intro'), false);
    assert.equal(isPublicAuthPath('/map?tab=1'), false);
    assert.equal(isPublicAuthPath('/welcome/'), true);
  });

  it('sends a hard refresh without an account to welcome', () => {
    assert.equal(shouldRedirectToWelcome(false, null, '/map'), false);
    assert.equal(shouldRedirectToWelcome(true, null, '/map'), true);
    assert.equal(shouldRedirectToWelcome(true, null, '/welcome'), false);
    assert.equal(shouldRedirectToWelcome(true, { id: 'u1' }, '/map'), false);
  });
});
