import {Box, Text} from 'ink';
import {ReporterSnapshot} from '../ReporterState';
import {Verbosity} from '../index';
import {SuiteView} from './SuiteView';

interface Props {
    snapshot: ReporterSnapshot;
    verbosity: Verbosity;
}

export function SuiteList({snapshot, verbosity}: Props) {
    return (
        <Box flexDirection="column">
            {snapshot.completedRuns.map((run) => <SuiteView key={run.id} run={run} active={false} verbosity={verbosity}/>)}
            {snapshot.activeRuns.map((run) => <SuiteView key={run.id} run={run} active={true} verbosity={verbosity}/>)}
        </Box>
    );
}
