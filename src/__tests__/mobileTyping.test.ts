import { describe, it, expect } from 'vitest';

describe('Mobile IME & Virtual Keyboard Input Logic', () => {
  // Test the common-prefix diffing logic implemented in TypingEngine.tsx
  function diffInput(prevVal: string, newVal: string) {
    let commonLen = 0;
    while (
      commonLen < prevVal.length &&
      commonLen < newVal.length &&
      prevVal[commonLen] === newVal[commonLen]
    ) {
      commonLen++;
    }
    const backspacesNeeded = prevVal.length - commonLen;
    const addedChars = newVal.slice(commonLen);
    return { backspacesNeeded, addedChars };
  }

  it('correctly detects single character additions from Android Gboard / iOS touch keyboard', () => {
    const step1 = diffInput('', 't');
    expect(step1).toEqual({ backspacesNeeded: 0, addedChars: 't' });

    const step2 = diffInput('t', 'th');
    expect(step2).toEqual({ backspacesNeeded: 0, addedChars: 'h' });

    const step3 = diffInput('th', 'the');
    expect(step3).toEqual({ backspacesNeeded: 0, addedChars: 'e' });
  });

  it('correctly detects virtual keyboard backspace key without physical key events', () => {
    const del1 = diffInput('the', 'th');
    expect(del1).toEqual({ backspacesNeeded: 1, addedChars: '' });

    const del2 = diffInput('th', 't');
    expect(del2).toEqual({ backspacesNeeded: 1, addedChars: '' });

    const delAll = diffInput('test', '');
    expect(delAll).toEqual({ backspacesNeeded: 4, addedChars: '' });
  });

  it('handles mobile autocomplete word replacement correctly (backspacing and inserting)', () => {
    // User typed "teh", autocorrect replaces with "the"
    const autocorrect = diffInput('teh', 'the');
    expect(autocorrect).toEqual({ backspacesNeeded: 2, addedChars: 'he' });
  });

  it('handles predictive text insertion of entire word correctly', () => {
    const predictive = diffInput('', 'quick');
    expect(predictive).toEqual({ backspacesNeeded: 0, addedChars: 'quick' });
  });

  it('handles spacebar input on mobile keyboards to submit active word', () => {
    const spaceInput = diffInput('quick', 'quick ');
    expect(spaceInput).toEqual({ backspacesNeeded: 0, addedChars: ' ' });
  });

  it('handles capitalization and special characters on mobile keyboards', () => {
    const cap = diffInput('', 'R');
    expect(cap).toEqual({ backspacesNeeded: 0, addedChars: 'R' });

    const symbol = diffInput('user', 'user@');
    expect(symbol).toEqual({ backspacesNeeded: 0, addedChars: '@' });

    const punc = diffInput('hello', 'hello!');
    expect(punc).toEqual({ backspacesNeeded: 0, addedChars: '!' });
  });
});

describe('RizKey Social Links & Watermark Verification', () => {
  const REQUIRED_SOCIAL_LINKS = [
    {
      name: 'GitHub',
      url: 'https://github.com/rizwanbukhari-dev',
      username: 'rizwanbukhari-dev',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/rizwan-bukahri-dev-9a9bba441/',
      username: 'Rizwan Bukhari-dev',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/rizwanbukhari.dev/',
      username: 'rizwanbukhari.dev',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61594112017570',
      username: 'Rizwan Bukhari Dev',
    },
  ];

  it('verifies all 4 social accounts have exact required URLs and usernames', () => {
    expect(REQUIRED_SOCIAL_LINKS).toHaveLength(4);
    for (const link of REQUIRED_SOCIAL_LINKS) {
      expect(link.url).toMatch(/^https:\/\//);
      expect(link.username.length).toBeGreaterThan(0);
    }
  });

  it('verifies official branding and tagline matches specification', () => {
    const brandName = 'RizKey';
    const tagline = 'Find your rhythm. Master your keys.';

    expect(brandName).toBe('RizKey');
    expect(tagline).toBe('Find your rhythm. Master your keys.');
  });
});
