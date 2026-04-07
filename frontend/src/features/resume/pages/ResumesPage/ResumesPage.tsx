import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Badge,
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Portal,
    Skeleton,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdFileUpload, MdOutlineFilterList } from 'react-icons/md';
import type { Resume, ResumeCategory } from '../../types';
import { NewResumeModal } from '../../../../shared/components/Modals/NewResumeModal';
import { SortableDataTable, type SortableColumn } from '../../../../shared/components/SortableDataTable/SortableDataTable';
import { Pagination } from '../../../../shared/components/Pagination';
import apiClient from '@/shared/lib/apiClient';

type SortKey = 'title' | 'category' | 'uploadDate' | 'fileFormat';
type SortDirection = 'asc' | 'desc';

const resumeTableColumns: SortableColumn<SortKey>[] = [
    { key: 'title', label: 'title' },
    { key: 'category', label: 'category' },
    { key: 'fileFormat', label: 'format' },
    { key: 'uploadDate', label: 'upload date' },
];

const categoryLabels: Record<ResumeCategory, string> = {
    general: 'General',
    tech: 'Tech/Engineering',
    management: 'Management',
    internship: 'Internship',
    other: 'Other',
};

const categoryColors: Record<ResumeCategory, string> = {
    general: 'gray',
    tech: 'purple',
    management: 'orange',
    internship: 'blue',
    other: 'cyan',
};

function ResumesPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState<'title' | 'category' | 'fileFormat'>('category');
    const [filterValue, setFilterValue] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('uploadDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [openAccordionIndex, setOpenAccordionIndex] = useState<number | number[] | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const cancelDeleteRef = useRef<HTMLButtonElement>(null);

    const toast = useToast();

    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const fetchResumes = () => {
        setIsLoading(true);
        apiClient.get<{ items: Resume[]; total: number }>('/resumes')
            .then((data) => setResumes(data.items))
            .catch(() => {
                toast({ title: 'Failed to load resumes', status: 'error', duration: 4000, isClosable: true });
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const filteredResumes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        let filtered = resumes.filter((resume) => {
            const matchesSearch = resume.title.toLowerCase().includes(normalizedSearch);
            const matchesFilter =
                filterValue === 'all' ||
                (filterField === 'title' && resume.title === filterValue) ||
                (filterField === 'category' && resume.category === filterValue) ||
                (filterField === 'fileFormat' && resume.fileFormat === filterValue);
            return matchesSearch && matchesFilter;
        });

        filtered.sort((a, b) => {
            const aValue = a[sortKey] ?? '';
            const bValue = b[sortKey] ?? '';
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [resumes, searchTerm, filterField, filterValue, sortKey, sortDirection]);

    const uniqueTitles = useMemo(() =>
        Array.from(new Set(resumes.map((r) => r.title).filter(Boolean))).sort(),
        [resumes]
    );

    const uniqueCategories = useMemo(() =>
        Array.from(new Set(resumes.map((r) => r.category).filter(Boolean))).sort(),
        [resumes]
    );

    const uniqueFormats = useMemo(() =>
        Array.from(new Set(resumes.map((r) => r.fileFormat).filter(Boolean))).sort(),
        [resumes]
    );

    const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResumes = filteredResumes.slice(startIndex, endIndex);

    const handleFilterChange = (field: 'title' | 'category' | 'fileFormat', value: string) => {
        setCurrentPage(1);
        setFilterField(field);
        setFilterValue(value);
    };

    const handleClearFilter = () => setFilterValue('all');

    const getFilterButtonText = () => {
        if (filterValue === 'all') return 'Filter';
        if (filterField === 'category') return categoryLabels[filterValue as ResumeCategory];
        return filterValue;
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleOpenDetails = (resume: Resume) => {
        setSelectedResume(resume);
        onViewOpen();
    };

    const handleCloseDetails = () => {
        setSelectedResume(null);
        onViewClose();
    };

    const handleDeleteClick = (resume: Resume) => {
        setResumeToDelete(resume);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!resumeToDelete) return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/resumes/${resumeToDelete.id}`);
            toast({ title: 'Resume deleted', status: 'success', duration: 3000, isClosable: true });
            onDeleteClose();
            setResumeToDelete(null);
            fetchResumes();
        } catch {
            toast({ title: 'Failed to delete resume', status: 'error', duration: 4000, isClosable: true });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Container maxW="container.xl" py={{ base: 3, md: 6 }} px={{ base: 2, sm: 4 }}>
            <VStack align="stretch" spacing={3}>
                {/* Header */}
                {isLoading ? (
                    <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
                        <Box flex="1">
                            <Skeleton h={8} w="200px" mb={2} />
                            <Skeleton h={4} w="300px" />
                        </Box>
                        <Skeleton h={8} w="150px" />
                    </HStack>
                ) : (
                    <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
                        <Box>
                            <Heading as="h2" size={{ base: 'md', md: 'lg' }} mb={0.5}>Resumes</Heading>
                            <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>
                                Manage and organize your resume versions.
                            </Text>
                        </Box>
                        <Button leftIcon={<MdFileUpload size="1.25em" />} colorScheme="brand" onClick={onAddOpen} size="sm">
                            Upload Resume
                        </Button>
                    </HStack>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <>
                        <HStack flexWrap="wrap" gap={2} justifyContent="flex-end">
                            <Skeleton h={10} w={{ base: '100%', md: '420px' }} borderRadius="lg" />
                            <Skeleton h={10} w="100px" borderRadius="md" />
                        </HStack>
                        <Box bg="white" borderRadius="lg" boxShadow="md" overflowX="auto" position="relative" minH="300px">
                            <Table variant="simple" size="sm">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th w="35%">Title</Th>
                                        <Th w="15%">Category</Th>
                                        <Th w="15%">Format</Th>
                                        <Th w="35%">Upload Date</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Tr key={index} h="54px">
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" display="flex" alignItems="center" justifyContent="center">
                                <Spinner size="lg" color="brand.500" thickness="4px" />
                            </Box>
                        </Box>
                    </>
                ) : resumes.length === 0 ? (
                    <VStack spacing={6} py={16} align="center" justify="center" bg="gray.50" borderRadius="lg" minH="300px">
                        <Box fontSize="48px">📄</Box>
                        <VStack spacing={2} align="center">
                            <Heading as="h3" size="md" color="gray.700">No resumes yet</Heading>
                            <Text color="gray.600" maxW="sm" textAlign="center">
                                Upload your first resume to get started.
                            </Text>
                        </VStack>
                        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onAddOpen} mt={4}>
                            Upload Your First Resume
                        </Button>
                    </VStack>
                ) : (
                    <>
                        <VStack align="stretch" spacing={2}>
                            <HStack flexWrap="wrap" gap={2} justifyContent="flex-end">
                                <Input
                                    placeholder="Search by title"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    maxW={{ base: '100%', md: '420px' }}
                                    bg="white"
                                    size="md"
                                    borderRadius="lg"
                                />
                                <Menu closeOnSelect={true}>
                                    <MenuButton
                                        as={Button}
                                        leftIcon={<MdOutlineFilterList />}
                                        size="md"
                                        bg="white"
                                        borderWidth="1px"
                                        borderColor="gray.200"
                                        _hover={{ bg: 'gray.50' }}
                                        _active={{ bg: 'gray.100' }}
                                        fontWeight={filterValue !== 'all' ? 'semibold' : 'normal'}
                                        color={filterValue !== 'all' ? 'brand.600' : 'gray.700'}
                                    >
                                        {getFilterButtonText()}
                                    </MenuButton>
                                    <MenuList maxH="400px" overflowY="auto" p={2}>
                                        {filterValue !== 'all' && (
                                            <>
                                                <Box display="flex" justifyContent="flex-end">
                                                    <Button onClick={handleClearFilter} fontWeight="semibold" colorScheme="red" size="sm" leftIcon={<DeleteIcon />}>
                                                        Clear
                                                    </Button>
                                                </Box>
                                                <MenuDivider my={2} />
                                            </>
                                        )}
                                        <Accordion index={openAccordionIndex} onChange={setOpenAccordionIndex} allowToggle>
                                            {uniqueTitles.length > 0 && (
                                                <AccordionItem border="none">
                                                    <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                        <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Title</Box>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                    <AccordionPanel p={0} maxH="200px" overflowY="auto" bg="gray.50">
                                                        {uniqueTitles.map((title, index) => (
                                                            <Box key={title}>
                                                                {index > 0 && <MenuDivider my={0} />}
                                                                <MenuItem onClick={() => handleFilterChange('title', title)} fontSize="14px">{title}</MenuItem>
                                                            </Box>
                                                        ))}
                                                    </AccordionPanel>
                                                </AccordionItem>
                                            )}
                                            {uniqueTitles.length > 0 && <MenuDivider my={0} />}
                                            <AccordionItem border="none">
                                                <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                    <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Category</Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                                <AccordionPanel p={0} maxH="200px" overflowY="auto" bg="gray.50">
                                                    {uniqueCategories.map((category, index) => (
                                                        <Box key={category}>
                                                            {index > 0 && <MenuDivider my={0} />}
                                                            <MenuItem onClick={() => handleFilterChange('category', category)} fontSize="14px">
                                                                <Badge colorScheme={categoryColors[category as ResumeCategory] ?? 'gray'} mr={2}>
                                                                    {categoryLabels[category as ResumeCategory] ?? category}
                                                                </Badge>
                                                            </MenuItem>
                                                        </Box>
                                                    ))}
                                                </AccordionPanel>
                                            </AccordionItem>
                                            {uniqueFormats.length > 0 && <MenuDivider my={0} />}
                                            {uniqueFormats.length > 0 && (
                                                <AccordionItem border="none">
                                                    <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                        <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">File Format</Box>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                    <AccordionPanel p={0} maxH="200px" overflowY="auto" bg="gray.50">
                                                        {uniqueFormats.map((format, index) => (
                                                            <Box key={format}>
                                                                {index > 0 && <MenuDivider my={0} />}
                                                                <MenuItem onClick={() => handleFilterChange('fileFormat', format)} fontSize="14px">{format}</MenuItem>
                                                            </Box>
                                                        ))}
                                                    </AccordionPanel>
                                                </AccordionItem>
                                            )}
                                        </Accordion>
                                    </MenuList>
                                </Menu>
                            </HStack>

                            <SortableDataTable
                                columns={resumeTableColumns}
                                items={paginatedResumes}
                                sortKey={sortKey}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                emptyMessage="No resumes match your search/filter."
                                renderRow={(resume) => (
                                    <Tr key={resume.id}>
                                        <Td fontWeight="medium" fontSize="14px" cursor="pointer" onClick={() => handleOpenDetails(resume)}>
                                            <HStack spacing={2}>
                                                <Text>{resume.title}</Text>
                                                {resume.isPrimary && <Badge colorScheme="green" fontSize="xs">Primary</Badge>}
                                            </HStack>
                                        </Td>
                                        <Td fontSize="14px">
                                            <Badge colorScheme={categoryColors[resume.category] ?? 'gray'}>
                                                {categoryLabels[resume.category] ?? resume.category}
                                            </Badge>
                                        </Td>
                                        <Td fontSize="14px">{resume.fileFormat}</Td>
                                        <Td fontSize="14px" position="relative" pe="0px">
                                            {resume.uploadDate}
                                            <Menu>
                                                <MenuButton as={Button} bg="gray.200" _hover={{ bg: 'gray.300' }} _active={{ bg: 'gray.400' }} w="8px" h="full" minW="unset" p={0} position="absolute" top="0" right="0" borderRadius="0" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                                                    <Text fontSize="md" fontWeight="bold" letterSpacing="0.1em" whiteSpace="nowrap">⋮</Text>
                                                </MenuButton>
                                                <Portal>
                                                    <MenuList>
                                                        <MenuItem onClick={() => handleOpenDetails(resume)} fontSize="14px" icon={<ViewIcon />}>
                                                            View Details
                                                        </MenuItem>
                                                        <MenuItem onClick={() => handleDeleteClick(resume)} fontSize="14px" icon={<DeleteIcon />} color="red.500">
                                                            Delete
                                                        </MenuItem>
                                                    </MenuList>
                                                </Portal>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                )}
                            />

                            {filteredResumes.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    setItemsPerPage={setItemsPerPage}
                                    totalItems={filteredResumes.length}
                                    totalPages={totalPages}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                />
                            )}
                        </VStack>
                    </>
                )}

                <NewResumeModal isOpen={isAddOpen} onClose={onAddClose} onResumeAdded={fetchResumes} />

                <AlertDialog
                    isOpen={isDeleteOpen}
                    leastDestructiveRef={cancelDeleteRef}
                    onClose={onDeleteClose}
                    isCentered
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Delete Resume
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Are you sure you want to delete <strong>{resumeToDelete?.title}</strong>? This action cannot be undone.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelDeleteRef} onClick={onDeleteClose} isDisabled={isDeleting}>
                                    Cancel
                                </Button>
                                <Button colorScheme="red" onClick={handleDeleteConfirm} isLoading={isDeleting} ml={3}>
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>

                <Modal isOpen={isViewOpen} onClose={handleCloseDetails} size={{ base: 'full', md: 'xl' }} isCentered scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent mx={{ base: 0, md: 4 }}>
                        <ModalHeader>Resume Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {selectedResume && (
                                <VStack spacing={4} align="stretch">
                                    <FormControl>
                                        <FormLabel>Title</FormLabel>
                                        <Input value={selectedResume.title} isReadOnly />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Category</FormLabel>
                                        <Input value={categoryLabels[selectedResume.category] ?? selectedResume.category} isReadOnly />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>File Name</FormLabel>
                                        <Input value={selectedResume.fileName} isReadOnly />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>File Format</FormLabel>
                                        <Input value={selectedResume.fileFormat} isReadOnly />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Upload Date</FormLabel>
                                        <Input value={selectedResume.uploadDate} isReadOnly />
                                    </FormControl>
                                </VStack>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" onClick={handleCloseDetails}>Close</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </Container>
    );
}

export default ResumesPage;
