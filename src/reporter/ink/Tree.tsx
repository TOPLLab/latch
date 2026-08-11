import React from 'react';
import {Box, Text} from 'ink';

export interface TreeNode<T = React.ReactNode> {
    label: T;
    children?: TreeNode<T>[];
}

export function prefix(ancestorsLast: boolean[], isLast: boolean): string {
    const ancestors = ancestorsLast
        .map(last => last ? '   ' : '│  ')
        .join('');

    return ancestors + (isLast ? '└─ ' : '├─ ');
}

export function renderTreeLines(node: TreeNode<string>, ancestorsLast: boolean[] = [], isLast = true): string[] {
    const indent = ancestorsLast
        .map(last => last ? '   ' : '│  ')
        .join('');

    const branch = ancestorsLast.length === 0
        ? ''
        : isLast ? '└─ ' : '├─ ';

    return [
        `${indent}${branch}${node.label}`,
        ...(node.children ?? []).flatMap((child, index) =>
            renderTreeLines(
                child,
                [...ancestorsLast, isLast],
                index === (node.children ?? []).length - 1
            )
        )
    ];
}

interface TreeProps {
    node: TreeNode;
    ancestorsLast?: boolean[];
    isLast?: boolean;
    showRootBranch?: boolean;
}

export function Tree({node, ancestorsLast = [], isLast = true, showRootBranch = false}: TreeProps) {
    const indent = ancestorsLast
        .map(last => last ? '   ' : '│  ')
        .join('');

    const branch = ancestorsLast.length === 0 && !showRootBranch
        ? ''
        : isLast ? '└─ ' : '├─ ';

    return (
        <Box flexDirection="column">
            <Text>
                <Text color="gray">{indent}{branch}</Text>
                {node.label}
            </Text>
            {node.children?.map((child, index) => (
                <Tree
                    key={index}
                    node={child}
                    ancestorsLast={[...ancestorsLast, isLast]}
                    isLast={index === node.children!.length - 1}
                    showRootBranch={false}
                />
            ))}
        </Box>
    );
}
