import {Box, Text} from 'ink';
import {ReporterRunState} from '../ReporterState';
import {Verbosity} from '../index';
import {Outcome} from '../Outcome';
import {StatusBadge} from './StatusBadge';
import {StepClarification} from './StepClarification';
import {duration, pad, plural} from './format';
import {Tree, TreeNode} from './Tree';
import {preservesFullHistory, showsActionDetails} from './verbosity';

interface Props {
    run: ReporterRunState;
    active: boolean;
    verbosity: Verbosity;
}

export function SuiteView({run, active, verbosity}: Props) {
    const scenarios = active ? run.scenarios : run.suite.outcomes();
    const showFailureDetails = !active && run.suite.outcome !== Outcome.succeeded;
    const failedScenarios = scenarios.filter((scenario) => scenario.outcome === Outcome.failed || scenario.outcome === Outcome.error);
    const currentScenario = run.activeScenario ?? scenarios[scenarios.length - 1];
    const visibleScenarios = active
        ? (showsActionDetails(verbosity) ? scenarios : (currentScenario ? [currentScenario] : []))
        : (preservesFullHistory(verbosity) ? scenarios : (showFailureDetails && verbosity >= Verbosity.normal ? failedScenarios : []));
    const actions = scenarios.flatMap((scenario) => scenario.outcomes());
    const completed = !active && run.suite.outcome === Outcome.succeeded && verbosity <= Verbosity.normal;
    const scenarioProgress = `${scenarios.filter((scenario) => scenario.outcome === Outcome.succeeded).length}/${run.plannedScenarios ?? scenarios.length}`;
    const scenarioTrees = visibleScenarios.map((scenario): TreeNode => ({
        label: <Text>{scenario.name}{scenario.outcomes().length > 0 ? <Text color="gray"> {scenario.outcomes().length}{active && scenario === run.activeScenario ? '' : `/${scenario.outcomes().length}`}</Text> : null}</Text>,
        children: scenario.outcome === Outcome.error && scenario.clarification
            ? [{label: <Text color="red">{scenario.clarification}</Text>}]
            : scenario.outcomes()
                .filter((step) => {
                    if (preservesFullHistory(verbosity)) {
                        return true;
                    }

                    if (active) {
                        return showsActionDetails(verbosity) && scenario === currentScenario;
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
        <Box flexDirection="column">
            <Text>
                <StatusBadge outcome={run.suite.outcome}/>
                <Text> {pad(run.suiteTitle, 28)}</Text>
                {completed ? (
                    <Text color="gray">{pad(scenarioProgress, 6)}{run.testeeName} · {plural(actions.length, 'action')} · {duration(run)}ms</Text>
                ) : (
                    <Text color="gray">{pad(scenarioProgress, 6)}{run.testeeName}</Text>
                )}
            </Text>
            {scenarioTrees.map((node, index) => active ? (
                <Box key={`${run.id}-scenario-${index}`} flexDirection="column" marginLeft={2}>
                    <Text>{node.label}</Text>
                    {node.children?.map((child, childIndex) => (
                        <Box key={`${run.id}-scenario-${index}-step-${childIndex}`} marginLeft={2}>
                            <Text>{child.label}</Text>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box key={`${run.id}-scenario-${index}`} marginLeft={2}>
                    <Tree node={node} ancestorsLast={[]} isLast={index === scenarioTrees.length - 1} showRootBranch={true}/>
                </Box>
            ))}
        </Box>
    );
}
