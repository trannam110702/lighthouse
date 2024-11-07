import * as TraceEngine from '../../packages/trace_engine/index.js';

import {polyfillDOMRect} from './polyfill-dom-rect.js';

/** @typedef {import('../../packages/trace_engine').Types.TraceEvents.SyntheticLayoutShift} SyntheticLayoutShift */
/** @typedef {SyntheticLayoutShift & {args: {data: NonNullable<SyntheticLayoutShift['args']['data']>}}} SaneSyntheticLayoutShift */

polyfillDOMRect();

const TraceProcessor = TraceEngine.Processor.TraceProcessor;
const TraceHandlers = TraceEngine.Handlers.ModelHandlers;
const RootCauses = TraceEngine.RootCauses.RootCauses.RootCauses;

export {TraceProcessor, TraceHandlers, RootCauses};
