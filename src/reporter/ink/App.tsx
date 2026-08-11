import {Box} from 'ink';
import {ReporterSnapshot} from '../ReporterState';
import {Verbosity} from '../index';
import {RunHeader} from './RunHeader';
import {ProgressSummary} from './ProgressSummary';
import {SuiteList} from './SuiteList';
import {LogPanel} from './LogPanel';
import {FinalSummary} from './FinalSummary';
import {showsDebugDetails} from './verbosity';

interface Props {
    snapshot: ReporterSnapshot;
    archive: string;
    verbosity: Verbosity;
}

export function App({snapshot, archive, verbosity}: Props) {
    if (snapshot.finished) {
        return (
            <Box flexDirection="column">
                {showsDebugDetails(verbosity) ? <RunHeader archive={archive}/> : null}
                <FinalSummary snapshot={snapshot} archive={archive} verbosity={verbosity}/>
                {showsDebugDetails(verbosity) ? <LogPanel logs={snapshot.logs} verbosity={verbosity}/> : null}
            </Box>
        );
    }

    return (
        <Box flexDirection="column">
            <RunHeader archive={archive}/>
            <SuiteList snapshot={snapshot} verbosity={verbosity}/>
            <ProgressSummary snapshot={snapshot}/>
            <LogPanel logs={snapshot.logs} verbosity={verbosity}/>
        </Box>
    );
}
