import {Box, Text} from 'ink';
import {memo, useEffect, useState} from 'react';
import {version} from '../../../package.json';
import {Meta} from '../../testbeds/Testbed';

interface Props {
    archive: string;
    metadata?: Promise<string>[];
    metadataRevision?: number;
}

interface PlatformOverviewProps {
    metadata?: Promise<string>[];
    metadataRevision?: number;
}

const metadataPlaceholder = 'name [architecture] · vversion';
const headerLabelWidth = 'Testbeds'.length;

export const PlatformOverview = memo(function PlatformOverview({metadata = [], metadataRevision = 0}: PlatformOverviewProps) {
    const [details, setDetails] = useState<string[]>([]);

    useEffect(() => {
        let mounted = true;
        setDetails(previous => metadata.map((_, index) => previous[index] ?? metadataPlaceholder));

        metadata.forEach((entry, index) => {
            entry.then(raw => {
                const meta = JSON.parse(raw) as Record<string, unknown>;
                const values = [meta[Meta.Name], meta[Meta.Architecture], meta[Meta.Version]];

                if (mounted && values.every((value): value is string => typeof value === 'string')) {
                    const [name, architecture, version] = values;
                    const detail = `${name} [${architecture}] · v${version}`;
                    setDetails(previous => previous.map((current, detailIndex) => detailIndex === index ? detail : current));
                }
            }).catch(() => undefined);
        });

        return () => {
            mounted = false;
        };
    }, [metadataRevision]);

    const overview = Array.from(details.reduce((groups, detail) => {
        groups.set(detail, (groups.get(detail) ?? 0) + 1);
        return groups;
    }, new Map<string, number>()).entries()).map(([detail, count]) =>
        `${detail} · ${count} suite${count === 1 ? '' : 's'}`
    );

    const rows = overview.length > 0 ? overview : [metadataPlaceholder];

    return (
        <Box flexDirection="column">
            {rows.map((row, index) => (
                <Box key={row}>
                    <Text bold>{index === 0 ? 'Testbeds' : ''.padEnd(headerLabelWidth)}</Text>
                    <Text color="gray">  {row}</Text>
                </Box>
            ))}
        </Box>
    );
}, (previous, next) => previous.metadataRevision === next.metadataRevision);

export const Header = memo(function Header({archive, metadata, metadataRevision}: Props) {
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Box>
                <Text bold>{'Latch'.padEnd(headerLabelWidth)}</Text>
                <Text color="gray">  v{version} · archive {archive}</Text>
            </Box>
            <PlatformOverview metadata={metadata} metadataRevision={metadataRevision}/>
        </Box>
    );
}, (previous, next) => previous.archive === next.archive && previous.metadataRevision === next.metadataRevision);
