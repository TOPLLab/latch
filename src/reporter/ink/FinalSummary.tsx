import {Box, Text} from 'ink';
import {ReporterSnapshot} from '../ReporterState';
import {summarizeSnapshot} from '../Summary';
import {Outcome} from '../Outcome';
import {Verbosity} from '../index';
import {alignRight, pad} from './format';
import {StatusBadge} from './StatusBadge';
import {StepClarification} from './StepClarification';
import {Tree, TreeNode} from './Tree';
import {preservesFullHistory, showsActionDetails} from './verbosity';

interface Props {
    snapshot: ReporterSnapshot;
    archive: string;
    verbosity: Verbosity;
}

export function FinalSummary({snapshot, archive, verbosity}: Props) {
    if (!snapshot.finished) {
        return null;
    }

    const summary = summarizeSnapshot(snapshot);
    const failed = summary.suites.failing > 0 || summary.scenarios.failing > 0 || summary.scenarios.errors > 0 || summary.actions.failing > 0 || summary.actions.errors > 0 || summary.actions.timeouts > 0;
    const firstCountWidth = Math.max(
        `${summary.suites.passing}`.length,
        `${summary.scenarios.passing}`.length,
        `${summary.actions.passing}`.length
    );

    return (
        <Box flexDirection="column">
            <Text>
                <StatusBadge outcome={failed ? Outcome.failed : Outcome.succeeded}/>
                <Text> {summary.suites.passing} suites passed · {summary.scenarios.total} scenarios · {summary.actions.total} actions · {snapshot.durationMs?.toFixed(0) ?? 0}ms</Text>
            </Text>
            <Text> </Text>
            {snapshot.completedRuns.map((run) => {
                const scenarios = run.suite.outcomes();
                const visibleScenarios = preservesFullHistory(verbosity)
                    ? scenarios
                    : (verbosity >= Verbosity.normal
                        ? scenarios.filter((scenario) => scenario.outcome === Outcome.failed || scenario.outcome === Outcome.error)
                        : []);
                const scenarioTrees = visibleScenarios.map((scenario): TreeNode => ({
                    label: (
                        <Text>
                            {preservesFullHistory(verbosity) ? <><StatusBadge outcome={scenario.outcome}/><Text> </Text></> : null}
                            <Text>{scenario.name}</Text>
                        </Text>
                    ),
                    children: scenario.outcome === Outcome.error && scenario.clarification && showsActionDetails(verbosity)
                        ? [{label: <Text color="red">{scenario.clarification}</Text>}]
                        : scenario.outcomes()
                            .filter((step) => {
                                if (preservesFullHistory(verbosity)) {
                                    return true;
                                }

                                return showsActionDetails(verbosity) && (step.outcome === Outcome.failed || step.outcome === Outcome.error || step.outcome === Outcome.timedout);
                            })
                            .map((step): TreeNode => ({
                                label: (
                                    <Text>
                                        <StatusBadge outcome={step.outcome}/>
                                        <Text> {step.name}</Text>
                                        {step.clarification || step.actual !== undefined ? <StepClarification step={step}/> : null}
                                    </Text>
                                )
                            }))
                }));

                return (
                    <Box key={run.id} flexDirection="column">
                        <Text>
                            <StatusBadge outcome={run.suite.outcome}/>
                            <Text> {pad(run.suiteTitle, 28)}</Text>
                            <Text color="gray">{pad(`${scenarios.filter((scenario) => scenario.outcome === Outcome.succeeded).length}/${run.plannedScenarios ?? scenarios.length}`, 6)}</Text>
                            <Text color="gray">{run.testeeName}</Text>
                        </Text>
                        {scenarioTrees.map((node, index) => (
                            <Box key={`${run.id}-failed-scenario-${index}`} marginLeft={2}>
                                <Tree node={node} ancestorsLast={[]} isLast={index === scenarioTrees.length - 1} showRootBranch={true}/>
                            </Box>
                        ))}
                    </Box>
                );
            })}
            <Text> </Text>
            <Text><Text bold>Suites</Text>     {alignRight(`${summary.suites.passing}`, firstCountWidth)} passed · {summary.suites.failing} failed</Text>
            <Text><Text bold>Scenarios</Text>  {alignRight(`${summary.scenarios.passing}`, firstCountWidth)} passed · {summary.scenarios.failing} failed · {summary.scenarios.errors} errors · {summary.scenarios.skipped} skipped</Text>
            <Text><Text bold>Actions</Text>    {alignRight(`${summary.actions.passing}`, firstCountWidth)} passed · {summary.actions.failing} failed · {summary.actions.errors} errors · {summary.actions.timeouts} timeouts</Text>
            <Text> </Text>
            <Text><Text bold>Archive</Text>  {archive}</Text>
        </Box>
    );
}
