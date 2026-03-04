import {
    Button,
    HStack,
    Select,
    Text,
    VStack,
} from '@chakra-ui/react';

interface PaginationProps {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (itemsPerPage: number) => void;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
}

export function Pagination({
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
}: PaginationProps) {
    if (totalItems === 0) {
        return null;
    }

    return (
        <VStack align="stretch" spacing={{ base: 2, md: 3 }} pt={4}>
            <HStack
                justify="space-between"
                align="center"
                px={{ base: 0, sm: 2 }}
                flexWrap={{ base: 'wrap', md: 'nowrap' }}
                gap={2}
            >
                <HStack spacing={2} order={{ base: 0, md: 0 }} w={{ base: 'auto', md: 'auto' }} justify={{ base: 'flex-start', md: 'auto' }}>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" whiteSpace="nowrap" display={{ base: 'none', md: 'inline' }}>
                        Items per page:
                    </Text>
                    <Select
                        w={{ base: '70px', md: '80px' }}
                        size="sm"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </Select>
                </HStack>

                <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="gray.600"
                    whiteSpace="nowrap"
                    order={{ base: 2, md: 1 }}
                    w={{ base: 'full', md: 'auto' }}
                    textAlign="center"
                >
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems}
                </Text>

                <HStack spacing={1} order={{ base: 1, md: 2 }} justify={{ base: 'flex-start', md: 'flex-end' }} w={{ base: 'auto', md: 'auto' }}>
                    <Button
                        size="sm"
                        isDisabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <HStack spacing={{ base: 0, md: 1 }} display={{ base: 'none', lg: 'flex' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                size="sm"
                                variant={currentPage === page ? 'solid' : 'outline'}
                                colorScheme={currentPage === page ? 'brand' : 'gray'}
                                onClick={() => setCurrentPage(page)}
                                w="32px"
                            >
                                {page}
                            </Button>
                        ))}
                    </HStack>
                    <Button
                        size="sm"
                        isDisabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </HStack>
            </HStack>
        </VStack>
    );
}
