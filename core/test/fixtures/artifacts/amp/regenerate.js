/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {startFlow} from '../../../../index.js';
import {updateTestFixture} from '../update-test-fixture.js';

/**
 * @param {import('puppeteer').Page} page
 */
async function runUserFlow(page) {
  const flow = await startFlow(page);

  await flow.navigate('https://elsoberano.org/');

  return flow;
}

/**
 * @param {LH.Artifacts} artifacts
 */
function verify(artifacts) {
  const {traceEvents} = artifacts.Trace;

  if (!traceEvents.find(e => e.name === 'firstMeaningfulPaintCandidate')) {
    throw new Error('missing firstMeaningfulPaintCandidate');
  }

  if (!traceEvents.find(e => e.name === 'LargestTextPaint::Candidate')) {
    throw new Error('missing LargestTextPaint::Candidate');
  }

  if (!traceEvents.find(e => e.name === 'LayoutInvalidationTracking')) {
    throw new Error('missing LayoutInvalidationTracking');
  }
}

await updateTestFixture({
  name: 'amp',
  about: 'A page using AMP',
  saveTrace: true,
  saveDevtoolsLog: true,
  runUserFlow,
  verify,
});
