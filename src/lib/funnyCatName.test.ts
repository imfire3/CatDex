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
  it('builds a ginger sitting nickname from coat and pose', () => {
    const name = funnyCatName(
      analysis({
        color: 'Roux',
        breed: 'Européen',
        description: 'Chat roux assis calmement sur un muret.',
        tags: ['calme'],
      }),
    );
    assert.match(name, / /);
    assert.match(name, /Paprika|Carotte|Flamby|Tikka|Curry/);
    assert.match(name, /Zen|Buddha|Pause/);
    assert.ok(name.length <= 22);
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
    assert.match(name, /Oreo|Domino|Yin|Piano|Cookie/);
  });

  it('is stable for the same traits', () => {
    const input = analysis({
      color: 'Gris',
      breed: 'Chartreux',
      description: 'Chat gris curieux qui guette la rue.',
      tags: ['curieux'],
    });
    assert.equal(funnyCatName(input), funnyCatName(input));
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

  it('keeps an already funny Vision name', () => {
    const result = withFunnyCatName(
      analysis({
        suggestedName: 'Paprika Zen',
        color: 'Roux',
        description: 'Chat roux assis.',
      }),
    );
    assert.equal(result.suggestedName, 'Paprika Zen');
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

  it('leaves rejected photos unchanged', () => {
    const rejected = analysis({
      notACat: true,
      suggestedName: 'Chat',
      description: 'Pas un chat',
    });
    assert.equal(withFunnyCatName(rejected).suggestedName, 'Chat');
  });
});
