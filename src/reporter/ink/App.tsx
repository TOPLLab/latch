import {Box} from 'ink';
import {ReporterSnapshot} from '../ReporterState';
import {Verbosity} from '../index';
import {Header} from './Header';
import {ProgressSummary} from './ProgressSummary';
import {SuiteList} from './SuiteList';
import {LogPanel} from './LogPanel';
import {FinalSummary} from './FinalSummary';
import {showsDebugDetails} from './verbosity';
import {ActiveFailures} from './ActiveFailures';

interface Props {
    snapshot: ReporterSnapshot;
    archive: string;
    verbosity: Verbosity;
    metadata?: Promise<string>[];
    metadataRevision?: number;
}

export function App({snapshot, archive, verbosity, metadata, metadataRevision}: Props) {
    if (snapshot.finished) {
        return (
            <Box flexDirection="column">
                <Header archive={archive} metadata={metadata} metadataRevision={metadataRevision}/>
                <FinalSummary snapshot={snapshot} verbosity={verbosity}/>
                {showsDebugDetails(verbosity) ? <LogPanel logs={snapshot.logs} verbosity={verbosity}/> : null}
            </Box>
        );
    }

    return (
        <Box flexDirection="column">
            <Header archive={archive} metadata={metadata} metadataRevision={metadataRevision}/>
            <SuiteList snapshot={snapshot} verbosity={verbosity}/>
            {verbosity === Verbosity.normal ? <ActiveFailures snapshot={snapshot}/> : null}
            <ProgressSummary snapshot={snapshot}/>
            <LogPanel logs={snapshot.logs} verbosity={verbosity}/>
        </Box>
    );
}
