/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'assert/strict';

import Audit from '../../../audits/accessibility/bypass.js';

describe('Accessibility: bypass audit', () => {
  it('generates an audit output', () => {
    const artifacts = {
      Accessibility: {
        violations: [{
          id: 'bypass',
          nodes: [],
          help: 'http://example.com/',
        }],
      },
    };

    const output = Audit.audit(artifacts);
    assert.equal(output.score, 0);
  });

  it('generates an audit output (single node)', () => {
    const artifacts = {
      Accessibility: {
        violations: [{
          id: 'bypass',
          nodes: [{node: {}, relatedNodes: []}],
          help: 'http://example.com/',
        }],
      },
    };

    const output = Audit.audit(artifacts);
    assert.equal(output.score, 0);
  });
});
