import {Text} from 'ink';
import {StepOutcome} from '../Results';

interface Props {
    step: StepOutcome;
}

export function StepClarification({step}: Props) {
    if (!step.clarification && step.actual === undefined) {
        return null;
    }

    return (
        <Text color="red">
            {' '}{step.clarification}{step.actual !== undefined ? <Text bold> {step.actual}</Text> : null}
        </Text>
    );
}
