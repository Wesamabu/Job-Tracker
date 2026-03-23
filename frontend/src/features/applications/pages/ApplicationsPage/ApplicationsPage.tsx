import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
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
    Select,
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
import { useEffect, useMemo, useState } from 'react';
import { MdOutlineFilterList } from 'react-icons/md';
import type { Application, ApplicationStatus } from '../../types';
import { NewApplicationModal } from '../../../../shared/components/Modals/NewApplicationModal';
import { NewResumeModal } from '../../../../shared/components/Modals/NewResumeModal';
import { SortableDataTable, type SortableColumn } from '../../../../shared/components/SortableDataTable/SortableDataTable';
import { Pagination } from '../../../../shared/components/Pagination';
import applicationsService from '../../services/applications.service';

type ExtendedApplication = Application & {
    resumeUsed: string;
};

type SortKey = 'jobTitle' | 'company' | 'status' | 'appliedDate' | 'resumeUsed';
type SortDirection = 'asc' | 'desc';

const applicationTableColumns: SortableColumn<SortKey>[] = [
    { key: 'jobTitle', label: 'job title' },
    { key: 'company', label: 'company' },
    { key: 'status', label: 'status' },
    { key: 'appliedDate', label: 'date applied' },
    { key: 'resumeUsed', label: 'resume used' },
];

const initialApplications: ExtendedApplication[] = [
    {
        id: '1',
        jobTitle: 'Frontend Engineer',
        company: 'Google',
        status: 'interviewing',
        appliedDate: '2026-02-20',
        resumeUsed: 'Software Engineer Resume',
        location: 'Mountain View, CA',
        notes: 'Completed recruiter screen.',
    },
    {
        id: '2',
        jobTitle: 'Full Stack Developer',
        company: 'Stripe',
        status: 'applied',
        appliedDate: '2026-03-10',
        resumeUsed: 'Full Stack Developer Resume',
        location: 'Remote',
        notes: 'Submitted through careers page.',
    },
    {
        id: '3',
        jobTitle: 'Software Engineer II',
        company: 'Amazon',
        status: 'rejected',
        appliedDate: '2026-01-15',
        resumeUsed: 'General Resume',
        location: 'Seattle, WA',
        notes: 'Rejected after online assessment.',
    },
];

const statusLabels: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offered: 'Offered',
    rejected: 'Rejected',
    accepted: 'Accepted',
};

const statusColors: Record<ApplicationStatus, string> = {
    applied: 'blue',
    interviewing: 'purple',
    offered: 'orange',
    rejected: 'red',
    accepted: 'green',
};

function ApplicationsPage() {
    const [applications, setApplications] = useState<ExtendedApplication[]>(initialApplications);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState<'status' | 'company' | 'resumeUsed'>('status');
    const [filterValue, setFilterValue] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('appliedDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [openAccordionIndex, setOpenAccordionIndex] = useState<number | number[] | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedApplication, setSelectedApplication] = useState<ExtendedApplication | null>(null);

    const toast = useToast();

    // Sample resumes data - TODO: Replace with actual data from API
    const resumes = [
        { id: 1, name: 'Software Engineer Resume', format: 'PDF' },
        { id: 2, name: 'Full Stack Developer Resume', format: 'DOCX' },
        { id: 3, name: 'General Resume', format: 'PDF' },
    ];

    const {
        isOpen: isViewOpen,
        onOpen: onViewOpen,
        onClose: onViewClose,
    } = useDisclosure();
    const {
        isOpen: isAddOpen,
        onOpen: onAddOpen,
        onClose: onAddClose,
    } = useDisclosure();
    const {
        isOpen: isResumeModalOpen,
        onOpen: onResumeModalOpen,
        onClose: onResumeModalClose,
    } = useDisclosure();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
        setApplications(prevApplications =>
            prevApplications.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        );
    };

    // const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    //     // Optimistically update the UI
    //     const previousApplications = applications;
    //     setApplications(prevApplications =>
    //         prevApplications.map(app =>
    //             app.id === applicationId ? { ...app, status: newStatus } : app
    //         )
    //     );

    //     try {
    //         // Send update to backend
    //         await applicationsService.update(applicationId, { status: newStatus });

    //         toast({
    //             title: 'Status updated',
    //             description: 'Application status has been updated successfully.',
    //             status: 'success',
    //             duration: 3000,
    //             isClosable: true,
    //             position: 'top-right',
    //         });
    //     } catch (error) {
    //         // Revert on error
    //         setApplications(previousApplications);

    //         toast({
    //             title: 'Update failed',
    //             description: 'Failed to update application status. Please try again.',
    //             status: 'error',
    //             duration: 5000,
    //             isClosable: true,
    //             position: 'top-right',
    //         });

    //         console.error('Failed to update application status:', error);
    //     }
    // };

    const filteredApplications = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        let filtered = applications.filter((application) => {
            const matchesSearch =
                application.jobTitle.toLowerCase().includes(normalizedSearch) ||
                application.company.toLowerCase().includes(normalizedSearch) ||
                application.resumeUsed.toLowerCase().includes(normalizedSearch);

            const matchesFilter =
                filterValue === 'all' || application[filterField] === filterValue;

            return matchesSearch && matchesFilter;
        });

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [applications, searchTerm, filterField, filterValue, sortKey, sortDirection]);

    // Get unique companies and resumes
    const uniqueCompanies = useMemo(() => {
        return Array.from(new Set(
            applications.map(app => app.company).filter(Boolean)
        )).sort();
    }, [applications]);

    const uniqueResumes = useMemo(() => {
        return Array.from(new Set(
            applications.map(app => app.resumeUsed).filter(Boolean)
        )).sort();
    }, [applications]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    const handleFilterChange = (field: 'status' | 'company' | 'resumeUsed', value: string) => {
        setCurrentPage(1);
        setFilterField(field);
        setFilterValue(value);
    };

    const handleClearFilter = () => {
        setFilterValue('all');
    };

    const getFilterButtonText = () => {
        if (filterValue === 'all') return 'Filter';
        if (filterField === 'status') {
            return statusLabels[filterValue as ApplicationStatus];
        }
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

    const handleOpenDetails = (application: ExtendedApplication) => {
        setSelectedApplication(application);
        onViewOpen();
    };

    const handleCloseDetails = () => {
        setSelectedApplication(null);
        onViewClose();
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
                            <Heading as="h2" size={{ base: 'md', md: 'lg' }} mb={0.5}>
                                Applications
                            </Heading>
                            <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>
                                Track and manage all your job applications.
                            </Text>
                        </Box>
                        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onAddOpen} size={"sm"}>
                            Add Application
                        </Button>
                    </HStack>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <>
                        {/* Search and Filter Skeleton */}
                        <HStack flexWrap="wrap" gap={2} justifyContent="flex-end">
                            <Skeleton h={10} w={{ base: '100%', md: '420px' }} borderRadius="lg" />
                            <Skeleton h={10} w="100px" borderRadius="md" />
                        </HStack>

                        <Box bg="white" borderRadius="lg" boxShadow="md" overflowX="auto" position="relative" minH="300px">
                            <Table variant="simple" size="sm">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th w="25%">Job Title</Th>
                                        <Th w="20%">Company</Th>
                                        <Th w="15%">Status</Th>
                                        <Th w="20%">Date Applied</Th>
                                        <Th w="20%">Resume Used</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Tr key={index} h="54px">
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                            <Td><Skeleton h={6} /></Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                            <Box
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Spinner size="lg" color="brand.500" thickness="4px" />
                            </Box>
                        </Box>

                        {/* Pagination Skeleton */}
                        <HStack justify="space-between" align="center" pt={4} px={2}>
                            <Skeleton h={8} w="150px" />
                            <Skeleton h={6} w="200px" />
                            <Skeleton h={8} w="200px" />
                        </HStack>
                    </>
                ) : applications.length === 0 ? (
                    /* Empty State */
                    <VStack spacing={6} py={16} align="center" justify="center" bg="gray.50" borderRadius="lg" minH="300px">
                        <Box fontSize="48px">📋</Box>
                        <VStack spacing={2} align="center">
                            <Heading as="h3" size="md" color="gray.700">
                                No applications yet
                            </Heading>
                            <Text color="gray.600" maxW="sm" textAlign="center">
                                Start tracking your job applications by adding your first one. Click the button above to get started!
                            </Text>
                        </VStack>
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="brand"
                            onClick={onAddOpen}
                            mt={4}
                        >
                            Add Your First Application
                        </Button>
                    </VStack>
                ) : (
                    /* Normal State - With filters and table */
                    <>
                        <VStack align="stretch" spacing={2}>
                            <HStack flexWrap="wrap" gap={2} justifyContent="flex-end">
                                <Input
                                    placeholder="Search by job title, company, or resume"
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
                                            <AccordionItem border="none">
                                                <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                    <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">
                                                        Status
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                                <AccordionPanel p={0} maxH="200px" overflowY="auto" bg="gray.50">
                                                    {Object.keys(statusLabels).map((status, index) => (
                                                        <Box key={status}>
                                                            {index > 0 && <MenuDivider my={0} />}
                                                            <MenuItem
                                                                onClick={() => handleFilterChange('status', status)}
                                                                bg={filterField === 'status' && filterValue === status ? 'brand.50' : 'transparent'}
                                                                fontWeight={filterField === 'status' && filterValue === status ? 'semibold' : 'normal'}
                                                                _hover={{ bg: filterField === 'status' && filterValue === status ? 'brand.100' : 'gray.100' }}
                                                            >
                                                                <Badge colorScheme={statusColors[status as ApplicationStatus]} mr={2}>
                                                                    {statusLabels[status as ApplicationStatus]}
                                                                </Badge>
                                                            </MenuItem>
                                                        </Box>
                                                    ))}
                                                </AccordionPanel>
                                            </AccordionItem>
                                            {uniqueCompanies.length > 0 && <MenuDivider my={0} />}
                                            {uniqueCompanies.length > 0 && (
                                                <AccordionItem border="none">
                                                    <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                        <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">
                                                            Company
                                                        </Box>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                    <AccordionPanel p={0} maxH="200px" overflowY="auto" bg="gray.50">
                                                        {uniqueCompanies.map((company, index) => (
                                                            <Box key={company}>
                                                                {index > 0 && <MenuDivider my={0} />}
                                                                <MenuItem
                                                                    onClick={() => handleFilterChange('company', company)}
                                                                    bg={filterField === 'company' && filterValue === company ? 'brand.50' : 'transparent'}
                                                                    fontWeight={filterField === 'company' && filterValue === company ? 'semibold' : 'normal'}
                                                                    _hover={{ bg: filterField === 'company' && filterValue === company ? 'brand.100' : 'gray.100' }}
                                                                >
                                                                    {company}
                                                                </MenuItem>
                                                            </Box>
                                                        ))}
                                                    </AccordionPanel>
                                                </AccordionItem>
                                            )}
                                            {uniqueResumes.length > 0 && <MenuDivider my={0} />}
                                            {uniqueResumes.length > 0 && (
                                                <AccordionItem border="none">
                                                    <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                        <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">
                                                            Resume
                                                        </Box>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                    <AccordionPanel p={0} maxH="200px" overflowY="auto" bg="gray.50">
                                                        {uniqueResumes.map((resume, index) => (
                                                            <Box key={resume}>
                                                                {index > 0 && <MenuDivider my={0} />}
                                                                <MenuItem
                                                                    onClick={() => handleFilterChange('resumeUsed', resume)}
                                                                    bg={filterField === 'resumeUsed' && filterValue === resume ? 'brand.50' : 'transparent'}
                                                                    fontWeight={filterField === 'resumeUsed' && filterValue === resume ? 'semibold' : 'normal'}
                                                                    _hover={{ bg: filterField === 'resumeUsed' && filterValue === resume ? 'brand.100' : 'gray.100' }}
                                                                >
                                                                    {resume}
                                                                </MenuItem>
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
                                columns={applicationTableColumns}
                                items={paginatedApplications}
                                sortKey={sortKey}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                emptyMessage="No applications match your search/filter."
                                renderRow={(application) => (
                                    <Tr key={application.id}>
                                        <Td fontWeight="medium" fontSize="14px">{application.jobTitle}</Td>
                                        <Td fontSize="14px">{application.company}</Td>
                                        <Td fontSize="14px">
                                            <Select
                                                value={application.status}
                                                onChange={(e) => handleStatusChange(application.id, e.target.value as ApplicationStatus)}
                                                size="sm"
                                                minW={{ base: '90px', md: 'auto' }}
                                                borderColor={`${statusColors[application.status]}.300`}
                                                color={`${statusColors[application.status]}.700`}
                                                fontWeight="semibold"
                                                bg="white"
                                                _hover={{ borderColor: `${statusColors[application.status]}.400` }}
                                                cursor="pointer"
                                            >
                                                {Object.entries(statusLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Td>
                                        <Td fontSize="14px">{application.appliedDate}</Td>
                                        <Td fontSize="14px" position="relative" pe="0px">
                                            {application.resumeUsed}
                                            <Menu>
                                                <MenuButton as={Button} bg="gray.200" _hover={{ bg: 'gray.300' }} _active={{ bg: 'gray.400' }} w="8px" h="full" minW="unset" p={0} position="absolute" top="0" right="0" borderRadius="0" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                                                    <Text fontSize="md" fontWeight="bold" letterSpacing="0.1em" whiteSpace="nowrap">⋮</Text>
                                                </MenuButton>
                                                <MenuList>
                                                    <MenuItem onClick={() => handleOpenDetails(application)} fontSize="14px" icon={<ViewIcon />}>
                                                        View Details
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                )}
                            />

                            {filteredApplications.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    setItemsPerPage={setItemsPerPage}
                                    totalItems={filteredApplications.length}
                                    totalPages={totalPages}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                />
                            )}
                        </VStack>
                    </>
                )}

                {/* Shared Application Modal */}
                <NewApplicationModal
                    isOpen={isAddOpen}
                    onClose={onAddClose}
                    resumes={resumes}
                    onResumeModalOpen={onResumeModalOpen}
                />

                {/* Shared Resume Modal */}
                <NewResumeModal
                    isOpen={isResumeModalOpen}
                    onClose={onResumeModalClose}
                />

                <Modal isOpen={isViewOpen} onClose={handleCloseDetails} size={{ base: 'full', md: 'xl' }}>
                    <ModalOverlay />
                    <ModalContent mx={{ base: 0, md: 4 }}>
                        <ModalHeader>Application Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {selectedApplication && (
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Job Title</FormLabel>
                                        <Input
                                            value={selectedApplication.jobTitle}
                                            isReadOnly
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Company</FormLabel>
                                        <Input
                                            value={selectedApplication.company}
                                            isReadOnly
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            value={selectedApplication.status}
                                            isDisabled
                                        >
                                            <option value="applied">Applied</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="offered">Offered</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="accepted">Accepted</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Date Applied</FormLabel>
                                        <Input
                                            type="date"
                                            value={selectedApplication.appliedDate}
                                            isReadOnly
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Resume Used</FormLabel>
                                        <Input
                                            value={selectedApplication.resumeUsed}
                                            isReadOnly
                                        />
                                    </FormControl>
                                </VStack>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" onClick={handleCloseDetails}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </Container>
    );
}

export default ApplicationsPage;
