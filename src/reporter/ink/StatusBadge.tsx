import {Text} from 'ink';
import {Outcome} from '../describers/Describer';

interface Props {
    outcome: Outcome;
}

export function StatusBadge({outcome}: Props) {
    switch (outcome) {
        case Outcome.succeeded:
            return <Text color="green" bold>PASS</Text>;
        case Outcome.skipped:
            return <Text color="yellow" bold>SKIP</Text>;
        case Outcome.timedout:
            return <Text color="red" bold>TIMEOUT</Text>;
        case Outcome.error:
            return <Text color="red" bold>ERROR</Text>;
        case Outcome.failed:
            return <Text color="red" bold>FAIL</Text>;
        case Outcome.uncommenced:
        default:
            return <Text color="cyan" bold>RUN</Text>;
    }
}
