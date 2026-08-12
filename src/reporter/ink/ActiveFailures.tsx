import {Box, Text} from 'ink';
import {ReporterSnapshot} from '../ReporterState';
import {Outcome} from '../Outcome';
import {Result, ScenarioResult} from '../Results';
import {StatusBadge} from './StatusBadge';

interface Props {
    snapshot: ReporterSnapshot;
}

const failed = (outcome: Outcome): boolean => outcome === Outcome.failed || outcome === Outcome.error || outcome === Outcome.timedout;

interface FailureRow {
    scenario: ScenarioResult;
    step?: Result;
}

const failureRows = (scenarios: ScenarioResult[]): FailureRow[] => scenarios.flatMap<FailureRow>((scenario): FailureRow[] => {
    const steps = scenario.outcomes().filter((step) => failed(step.outcome));
    return steps.length === 0 ? [{scenario}] : steps.map((step) => ({scenario, step}));
});

export function ActiveFailures({snapshot}: Props) {
    const failures = snapshot.activeRuns.map((run) => ({
        run,
        scenarios: run.scenarios.filter((scenario) => failed(scenario.outcome))
    })).filter(({scenarios}) => scenarios.length > 0);

    if (failures.length === 0) {
        return null;
    }

    return (
        <Box flexDirection="column" marginTop={1}>
            {failures.map(({run, scenarios}) => (
                <Box key={`${run.id}-failures`} flexDirection="column">
                    <Text>
                        <StatusBadge outcome={Outcome.failed}/>
                        <Text> {run.suiteTitle}</Text>
                        <Text color="gray"> ({scenarios.length}/{run.plannedScenarios ?? run.scenarios.length})</Text>
                    </Text>
                    {failureRows(scenarios).map(({scenario, step}) => (
                        <Box key={`${run.id}-failure-${scenario.name}-${step?.name ?? 'scenario'}`} marginLeft={5}>
                            <Text>
                                <Text color="gray">TEST</Text>
                                <Text> {scenario.name}</Text>
                                {step ? <Text color="gray"> · {step.name}</Text> : null}
                            </Text>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}
