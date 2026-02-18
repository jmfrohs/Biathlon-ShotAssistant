/** @jest-environment jsdom */
/*
MIT License

Copyright (c) 2026 jmfrohs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * Test Suite for Shooting Module
 * Tests shooting functionality and calculations
 */


const fs = require('fs');
const path = require('path');

// Load the script
const shootingCode = fs.readFileSync(path.resolve(__dirname, '../src-old/js/modules/shooting.js'), 'utf8');

// Mock ShootingPage constructor dependencies
const mockElements = {
  'biathlon-target': document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
  'shotsGroup': document.createElementNS('http://www.w3.org/2000/svg', 'g'),
  'ghostShotsGroup': document.createElementNS('http://www.w3.org/2000/svg', 'g'),
  'shot-stats': document.createElement('div'),
  'save-btn': document.createElement('button'),
  'undo-btn': document.createElement('button'),
  'reset-btn': document.createElement('button'),
  'active-athlete-name': document.createElement('span'),
  'active-athlete-info': document.createElement('span'),
  'session-name-display': document.createElement('h1'),
  'series-count-badge': document.createElement('span'),
  'shooting-timer': document.createElement('span'),
  'voice-indicator': document.createElement('div'),
};



const vm = require('vm');

document.getElementById = jest.fn((id) => mockElements[id] || document.createElement('div'));
window.bootstrap = { Modal: jest.fn(() => ({ show: jest.fn(), hide: jest.fn() })) };

// Execute the script in the window context
const context = {
  window,
  document,
  navigator,
  console,
  localStorage,
  sessionStorage,
  setTimeout,
  setInterval,
  clearTimeout,
  clearInterval,
  bootstrap: window.bootstrap,
  ShootingPage: null
};
vm.runInNewContext(shootingCode, context);

// Promote ShootingPage from context to global if needed by tests
global.ShootingPage = context.ShootingPage;



describe('Shooting Module', () => {
  let page;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    page = new ShootingPage();
  });

  test('getRingFromDistance should return correct rings', () => {
    expect(page.getRingFromDistance(5)).toBe(10);
    expect(page.getRingFromDistance(15)).toBe(9);
    expect(page.getRingFromDistance(95)).toBe(1);
    expect(page.getRingFromDistance(150)).toBe(0);
  });

  test('getDirectionFromCoords should return correct directions', () => {
    // Center is (100, 100)
    expect(page.getDirectionFromCoords(100, 100)).toBe('zentrum');
    expect(page.getDirectionFromCoords(100, 50)).toBe('oben');
    expect(page.getDirectionFromCoords(100, 150)).toBe('unten');
    expect(page.getDirectionFromCoords(50, 100)).toBe('links');
    expect(page.getDirectionFromCoords(150, 100)).toBe('rechts');
    expect(page.getDirectionFromCoords(150, 50)).toBe('rechts hoch');
  });

  test('getCoordsFromRingDirection should return valid coordinates', () => {
    const coords = page.getCoordsFromRingDirection(10, 'zentrum');
    expect(coords.x).toBeCloseTo(100, 0);
    expect(coords.y).toBeCloseTo(100, 0);
    
    const topCoords = page.getCoordsFromRingDirection(5, 'oben');
    expect(topCoords.x).toBe(100);
    expect(topCoords.y).toBeLessThan(100);
  });

  test('addHit should update shots array', () => {
    page.addHit(10, 'zentrum', 100, 100);
    expect(page.shots.length).toBe(1);
    expect(page.shots[0].ring).toBe(10);
    expect(page.shots[0].isHit).toBe(true);
  });
});

