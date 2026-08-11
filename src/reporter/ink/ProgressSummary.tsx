import {Box, Text} from 'ink';
import {ReporterSnapshot} from '../ReporterState';
import {summarizeSnapshot} from '../Summary';

interface Props {
    snapshot: ReporterSnapshot;
}

export function ProgressSummary({snapshot}: Props) {
    const summary = summarizeSnapshot(snapshot);
    const plannedScenarios = snapshot.activeRuns.concat(snapshot.completedRuns).reduce((total, run) => total + (run.plannedScenarios ?? run.suite.outcomes().length), 0);
    const plannedActions = snapshot.activeRuns.concat(snapshot.completedRuns).reduce((total, run) => total + (run.plannedActions ?? run.suite.outcomes().flatMap((scenario) => scenario.outcomes()).length), 0);
    const completedScenarios = summary.scenarios.passing + summary.scenarios.failing + summary.scenarios.errors + summary.scenarios.skipped;

    return (
        <Box marginTop={1}>
            <Text>
                <Text bold>Progress</Text>  {snapshot.completedRuns.length}/{summary.suites.total} suites · {completedScenarios}/{plannedScenarios} scenarios · {summary.actions.total}/{plannedActions} actions
            </Text>
        </Box>
    );
}
