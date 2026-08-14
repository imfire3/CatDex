import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { funnyCatName, isGenericCatName, withFunnyCatName } from './funnyCatName';
import type { CatAnalysis } from '../types/cat';

function analysis(partial: Partial<CatAnalysis>): CatAnalysis {
  return {
    color: '',
    breed: '',
    coat: '',
    description: '',
    ...partial,
  };
}

describe('funnyCatName', () => {
  it('builds a ginger Pokémon-style nickname from coat', () => {
    const name = funnyCatName(
      analysis({
        color: 'Roux',
        breed: 'Européen',
        description: 'Chat roux assis calmement sur un muret.',
        tags: ['calme'],
      }),
    );
    assert.match(name, /Flambyx|Papriko|Tikkax|Curryon|Braizor/);
    assert.ok(!/\s/.test(name));
    assert.ok(name.length <= 14);
    assert.equal(isGenericCatName(name), false);
  });

  it('uses a tuxedo coat for black-and-white cats', () => {
    const name = funnyCatName(
      analysis({
        color: 'Noir et blanc',
        coatPattern: 'bicolor',
        description: 'Chat noir et blanc allongé en sieste.',
      }),
    );
    assert.match(name, /Oreon|Domix|Pianor|Yinette|Cookix/);
  });

  it('is stable for the same traits', () => {
    const input = analysis({
      color: 'Gris',
      breed: 'Chartreux',
      description: 'Chat gris curieux qui guette la rue.',
      tags: ['curieux'],
    });
    assert.equal(funnyCatName(input), funnyCatName(input));
    assert.equal(isGenericCatName(funnyCatName(input)), false);
  });
});

describe('isGenericCatName', () => {
  it('rejects plain and boring legacy names', () => {
    assert.equal(isGenericCatName('Grisou'), true);
    assert.equal(isGenericCatName('Noir Escalade'), true);
    assert.equal(isGenericCatName('Roux Balcon'), true);
    assert.equal(isGenericCatName('Brume Radar'), true);
    assert.equal(isGenericCatName('Oreo Sieste'), true);
    assert.equal(isGenericCatName('Flambyx'), false);
  });
});

describe('withFunnyCatName', () => {
  it('replaces generic Vision names', () => {
    const result = withFunnyCatName(
      analysis({
        suggestedName: 'Minou',
        color: 'Blanc',
        description: 'Chat blanc caché dans une boite.',
      }),
    );
    assert.notEqual(result.suggestedName, 'Minou');
    assert.equal(isGenericCatName(result.suggestedName), false);
  });

  it('keeps an already coined Vision name', () => {
    const result = withFunnyCatName(
      analysis({
        suggestedName: 'Flambyx',
        color: 'Roux',
        description: 'Chat roux assis.',
      }),
    );
    assert.equal(result.suggestedName, 'Flambyx');
  });

  it('replaces a name that is just the coat color', () => {
    const result = withFunnyCatName(
      analysis({
        suggestedName: 'Roux',
        color: 'Roux',
        description: 'Chat roux assis.',
      }),
    );
    assert.notEqual(result.suggestedName, 'Roux');
  });

  it('replaces Color + noun labels like Noir Escalade', () => {
    const result = withFunnyCatName(
      analysis({
        suggestedName: 'Noir Escalade',
        color: 'Noir',
        description: 'Chat noir sur une clôture.',
      }),
    );
    assert.notEqual(result.suggestedName, 'Noir Escalade');
    assert.ok(!/\s/.test(result.suggestedName ?? ''));
  });

  it('leaves rejected photos unchanged', () => {
    const rejected = analysis({
      notACat: true,
      suggestedName: 'Chat',
      description: 'Pas un chat',
    });
    assert.equal(withFunnyCatName(rejected).suggestedName, 'Chat');
  });
});
