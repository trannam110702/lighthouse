// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Core from '../core/core.js';
import * as Graph from '../graph/graph.js';
import {BLOCKING_TIME_THRESHOLD, calculateTbtImpactForEvent} from './TBTUtils.js';

class Metric {
  static get coefficients() {
    throw new Core.LanternError('coefficients unimplemented!');
  }

  static getScriptUrls(dependencyGraph, treatNodeAsRenderBlocking) {
    const scriptUrls = new Set();
    dependencyGraph.traverse(node => {
      if (node.type !== Graph.BaseNode.types.NETWORK) {
        return;
      }
      if (node.request.resourceType !== 'Script') {
        return;
      }
      if (treatNodeAsRenderBlocking?.(node)) {
        scriptUrls.add(node.request.url);
      }
    });
    return scriptUrls;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Returns the coefficients, scaled by the throttling settings if needed by the metric.
   * Some lantern metrics (speed-index) use components in their estimate that are not
   * from the simulator. In this case, we need to adjust the coefficients as the target throttling
   * settings change.
   */
  static getScaledCoefficients(rttMs) {
    return this.coefficients;
  }

  static getOptimisticGraph(dependencyGraph, processedNavigation) {
    throw new Core.LanternError('Optimistic graph unimplemented!');
  }

  static getPessimisticGraph(dependencyGraph, processedNavigation) {
    throw new Core.LanternError('Pessmistic graph unimplemented!');
  }

  static getEstimateFromSimulation(simulationResult, extras) {
    return simulationResult;
  }

  static getTopLevelEvents(nodeTimings, minDurationMs) {
    throw new Error('Unimplemented');
  }

  /* eslint-enable @typescript-eslint/no-unused-vars */
  static compute(data, extras) {
    const {simulator, graph, processedNavigation} = data;
    const metricName = this.name.replace('Lantern', '');
    const optimisticGraph = this.getOptimisticGraph(graph, processedNavigation);
    const pessimisticGraph = this.getPessimisticGraph(graph, processedNavigation);
    let simulateOptions = {label: `optimistic${metricName}`};
    const optimisticSimulation = simulator.simulate(optimisticGraph, simulateOptions);
    simulateOptions = {label: `pessimistic${metricName}`};
    const pessimisticSimulation = simulator.simulate(pessimisticGraph, simulateOptions);
    const optimisticEstimate = this.getEstimateFromSimulation(optimisticSimulation, {...extras, optimistic: true});
    const pessimisticEstimate = this.getEstimateFromSimulation(pessimisticSimulation, {...extras, optimistic: false});
    const coefficients = this.getScaledCoefficients(simulator.rtt);
    // Estimates under 1s don't really follow the normal curve fit, minimize the impact of the intercept
    const interceptMultiplier = coefficients.intercept > 0 ? Math.min(1, optimisticEstimate.timeInMs / 1000) : 1;
    const timing = coefficients.intercept * interceptMultiplier +
      coefficients.optimistic * optimisticEstimate.timeInMs + coefficients.pessimistic * pessimisticEstimate.timeInMs;
    let avadaScriptData = null;
    if (metricName === 'TotalBlockingTime') {
      const optimisticFcp = extras.fcpResult.optimisticEstimate.timeInMs;
      const pessimisticFcp = extras.fcpResult.pessimisticEstimate.timeInMs;
      const optimisticInteractive = extras.interactiveResult.optimisticEstimate.timeInMs;
      const pessimisticInteractive = extras.interactiveResult.pessimisticEstimate.timeInMs;
      const events = this.getTopLevelEvents(pessimisticSimulation.nodeTimings, BLOCKING_TIME_THRESHOLD).map(event => {
        const optimisticBlockingTime = calculateTbtImpactForEvent(event, optimisticFcp, optimisticInteractive);
        const pessimisticBlockingTime = calculateTbtImpactForEvent(event, pessimisticFcp, pessimisticInteractive);
        const blockingTime = coefficients.optimistic * optimisticBlockingTime + coefficients.pessimistic * pessimisticBlockingTime;
        return {...event, blockingTime};
      });
      avadaScriptData = this.formatScriptData(events);
    }
    return {
      timing,
      avadaScriptData,
      optimisticEstimate,
      pessimisticEstimate,
      optimisticGraph,
      pessimisticGraph
    };
  }

  static formatScriptData(scriptData) {
    return scriptData.reduce((acc, script) => {
      const {evaluateScriptUrls} = script;
      if (evaluateScriptUrls.length) {
        acc.push(script);
      }
      return acc;
    }, []);
  }
}

export {Metric};
//# sourceMappingURL=Metric.js.map
