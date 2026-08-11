import {Box, Text} from 'ink';
import {ReporterLog} from '../ReporterState';
import {Verbosity} from '../index';
import {showsDebugDetails} from './verbosity';

interface Props {
    logs: ReporterLog[];
    verbosity: Verbosity;
}

export function LogPanel({logs, verbosity}: Props) {
    const visible = showsDebugDetails(verbosity) ? logs : logs.filter((log) => log.level !== 'debug');
    const recent = visible.slice(-8);

    if (recent.length === 0) {
        return null;
    }

    return (
        <Box flexDirection="column" marginTop={1}>
            <Text bold>Logs</Text>
            {recent.map((log, index) => (
                <Text key={`${log.timestamp}-${index}`} color={log.level === 'error' ? 'red' : log.level === 'debug' ? 'gray' : undefined}>
                    {log.level}: {log.text}
                </Text>
            ))}
        </Box>
    );
}
