import {Box, Text} from 'ink';
import {version} from '../../../package.json';

interface Props {
    archive: string;
}

export function RunHeader({archive}: Props) {
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold>Latch</Text>
            <Text color="gray">v{version} · archive {archive}</Text>
        </Box>
    );
}
