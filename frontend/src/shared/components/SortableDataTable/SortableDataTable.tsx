import { Box, HStack, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortableColumn<TSortKey extends string> {
    key: TSortKey;
    label: string;
    sortable?: boolean;
    width?: string;
}

interface SortableDataTableProps<TItem, TSortKey extends string> {
    columns: SortableColumn<TSortKey>[];
    items: TItem[];
    sortKey: TSortKey;
    sortDirection: SortDirection;
    onSort: (key: TSortKey) => void;
    renderRow: (item: TItem, index: number) => ReactNode;
    emptyMessage: string;
    emptyColSpan?: number;
}

export function SortableDataTable<TItem, TSortKey extends string>({
    columns,
    items,
    sortKey,
    sortDirection,
    onSort,
    renderRow,
    emptyMessage,
    emptyColSpan,
}: SortableDataTableProps<TItem, TSortKey>) {
    return (
        <Box bg="white" borderRadius="lg" boxShadow="md" overflowX="auto">
            <Table variant="simple">
                <Thead bg="gray.50">
                    <Tr>
                        {columns.map((column) => (
                            <Th
                                key={column.key}
                                w={column.width}
                                cursor={column.sortable === false ? 'default' : 'pointer'}
                                onClick={column.sortable === false ? undefined : () => onSort(column.key)}
                                userSelect="none"
                            >
                                {column.sortable === false ? (
                                    <Text textTransform="capitalize" fontSize="14px">
                                        {column.label}
                                    </Text>
                                ) : (
                                    <HStack spacing={1} display="inline-flex">
                                        <Text textTransform="capitalize" fontSize="14px">
                                            {column.label}
                                        </Text>
                                        <VStack spacing={0} align="center">
                                            <TriangleUpIcon
                                                w={2}
                                                h={2}
                                                color={sortKey === column.key && sortDirection === 'asc' ? 'black' : 'gray.300'}
                                            />
                                            <TriangleDownIcon
                                                w={2}
                                                h={2}
                                                color={sortKey === column.key && sortDirection === 'desc' ? 'black' : 'gray.300'}
                                            />
                                        </VStack>
                                    </HStack>
                                )}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {items.length === 0 ? (
                        <Tr>
                            <Td colSpan={emptyColSpan ?? columns.length} py={8}>
                                <Text textAlign="center" color="gray.600" fontSize="14px">
                                    {emptyMessage}
                                </Text>
                            </Td>
                        </Tr>
                    ) : (
                        items.map((item, index) => renderRow(item, index))
                    )}
                </Tbody>
            </Table>
        </Box>
    );
}
