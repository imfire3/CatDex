import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { shouldOfferSupportModal } from './supportModal';

describe('shouldOfferSupportModal', () => {
  it('stays hidden before the first capture', () => {
    assert.equal(
      shouldOfferSupportModal({
        ownedCatCount: 0,
        dismissed: false,
        blockingModalVisible: false,
      }),
      false,
    );
  });

  it('opens after a capture when nothing else is blocking', () => {
    assert.equal(
      shouldOfferSupportModal({
        ownedCatCount: 1,
        dismissed: false,
        blockingModalVisible: false,
      }),
      true,
    );
  });

  it('does not stack on top of another map modal', () => {
    assert.equal(
      shouldOfferSupportModal({
        ownedCatCount: 2,
        dismissed: false,
        blockingModalVisible: true,
      }),
      false,
    );
  });

  it('stays dismissed once the player has closed it', () => {
    assert.equal(
      shouldOfferSupportModal({
        ownedCatCount: 4,
        dismissed: true,
        blockingModalVisible: false,
      }),
      false,
    );
  });
});
