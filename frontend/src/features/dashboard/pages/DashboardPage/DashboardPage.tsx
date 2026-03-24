import {
    Container,
    Heading,
    SimpleGrid,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    VStack,
    HStack,
    Text,
    Divider,
    Button,
    Skeleton,
    SkeletonText,
    Icon,
    Flex,
    useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { MdFileUpload } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { NewApplicationModal } from '../../../../shared/components/Modals/NewApplicationModal';
import { NewResumeModal } from '../../../../shared/components/Modals/NewResumeModal';
import { dashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../types';

function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalApplications: 0,
        active: 0,
        interviews: 0,
        offers: 0,
    });
    const [refreshKey, setRefreshKey] = useState(0);

    const { isOpen: isApplicationModalOpen, onOpen: onApplicationModalOpen, onClose: onApplicationModalClose } = useDisclosure();
    const { isOpen: isResumeModalOpen, onOpen: onResumeModalOpen, onClose: onResumeModalClose } = useDisclosure();

    useEffect(() => {
        setIsLoading(true);
        dashboardService.getStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [refreshKey]);

    const handleApplicationAdded = () => {
        setRefreshKey(k => k + 1);
    };

    const hasData = stats.totalApplications > 0;

    const statCards = [
        { label: 'Total Applications', value: stats.totalApplications, helpText: 'All time', color: 'blue.500' },
        { label: 'Active', value: stats.active, helpText: 'In progress', color: 'green.500' },
        { label: 'Interviews', value: stats.interviews, helpText: 'Scheduled', color: 'purple.500' },
        { label: 'Offers', value: stats.offers, helpText: 'Received', color: 'orange.500' },
    ];

    return (
        <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 2, sm: 4 }}>
            <VStack align="stretch" spacing={8}>
                {/* Header with Quick Actions */}
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'stretch', md: 'center' }}
                    gap={4}
                >
                    <Box>
                        <Heading as="h2" size={{ base: 'lg', md: 'xl' }} mb={2}>
                            Dashboard
                        </Heading>
                        <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                            Overview of your job application activity
                        </Text>
                    </Box>
                    <HStack spacing={3} flexWrap="wrap" justify={{ base: 'stretch', md: 'flex-end' }}>
                        <Button
                            onClick={onApplicationModalOpen}
                            leftIcon={<AddIcon />}
                            colorScheme="brand"
                            size="sm"
                            flex={{ base: '1', sm: 'initial' }}
                        >
                            New Application
                        </Button>
                        <Button
                            onClick={onResumeModalOpen}
                            leftIcon={<MdFileUpload size="1.25em" />}
                            variant="outline"
                            colorScheme="brand"
                            size="sm"
                            flex={{ base: '1', sm: 'initial' }}
                        >
                            New Resume
                        </Button>
                    </HStack>
                </Flex>

                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
                    {statCards.map((card) => (
                        <Box
                            key={card.label}
                            p={{ base: 4, md: 6 }}
                            bg="white"
                            borderRadius="lg"
                            boxShadow="md"
                            borderTop="4px solid"
                            borderTopColor={card.color}
                            transition="all 0.2s"
                            _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                        >
                            {isLoading ? (
                                <VStack align="stretch" spacing={2}>
                                    <Skeleton height="14px" width="60%" />
                                    <Skeleton height="36px" width="80%" />
                                    <Skeleton height="12px" width="40%" />
                                </VStack>
                            ) : (
                                <Stat>
                                    <StatLabel color="gray.600" fontSize="sm">{card.label}</StatLabel>
                                    <StatNumber fontSize="3xl" fontWeight="bold">{card.value}</StatNumber>
                                    <StatHelpText color="gray.500" fontSize="xs">{card.helpText}</StatHelpText>
                                </Stat>
                            )}
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Empty State or Content */}
                {!isLoading && !hasData ? (
                    <Box p={{ base: 8, md: 12 }} bg="white" borderRadius="lg" boxShadow="md" textAlign="center">
                        <VStack spacing={4}>
                            <Icon as={AddIcon} boxSize={12} color="gray.400" />
                            <Heading size={{ base: 'sm', md: 'md' }} color="gray.700">
                                Welcome to Job Tracker!
                            </Heading>
                            <Text color="gray.600" maxW="md" fontSize={{ base: 'sm', md: 'md' }}>
                                Start by adding your first job application or uploading your resume.
                            </Text>
                            <HStack spacing={4} mt={4} flexWrap="wrap" justify="center">
                                <Button onClick={onApplicationModalOpen} leftIcon={<AddIcon />} colorScheme="brand" size={{ base: 'sm', md: 'md' }}>
                                    Add First Application
                                </Button>
                                <Button onClick={onResumeModalOpen} leftIcon={<MdFileUpload size="1.25em" />} variant="outline" colorScheme="brand" size={{ base: 'sm', md: 'md' }}>
                                    Upload Resume
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                ) : (
                    <>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
                            <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md">
                                <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                    Quick Stats
                                </Heading>
                                <Divider mb={4} />
                                {isLoading ? (
                                    <VStack align="stretch" spacing={3}>
                                        <SkeletonText noOfLines={1} />
                                        <SkeletonText noOfLines={1} />
                                        <SkeletonText noOfLines={1} />
                                    </VStack>
                                ) : (
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Interview Rate</Text>
                                            <Text fontSize="sm" fontWeight="bold">
                                                {stats.totalApplications > 0
                                                    ? `${Math.round((stats.interviews / stats.totalApplications) * 100)}%`
                                                    : '—'}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Offer Rate</Text>
                                            <Text fontSize="sm" fontWeight="bold">
                                                {stats.totalApplications > 0
                                                    ? `${Math.round((stats.offers / stats.totalApplications) * 100)}%`
                                                    : '—'}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Active Applications</Text>
                                            <Text fontSize="sm" fontWeight="bold">{stats.active}</Text>
                                        </HStack>
                                    </VStack>
                                )}
                            </Box>

                            <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md">
                                <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                    Status Breakdown
                                </Heading>
                                <Divider mb={4} />
                                {isLoading ? (
                                    <VStack align="stretch" spacing={3}>
                                        <SkeletonText noOfLines={3} spacing={2} />
                                    </VStack>
                                ) : (
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Total Applications</Text>
                                            <Text fontSize="sm" fontWeight="bold">{stats.totalApplications}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">In Interview</Text>
                                            <Text fontSize="sm" fontWeight="bold">{stats.interviews}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Offers Received</Text>
                                            <Text fontSize="sm" fontWeight="bold">{stats.offers}</Text>
                                        </HStack>
                                    </VStack>
                                )}
                            </Box>
                        </SimpleGrid>

                        <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md">
                            <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                Application Progress
                            </Heading>
                            <Divider mb={4} />
                            {isLoading ? (
                                <Skeleton height="200px" borderRadius="md" />
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={[
                                        { stage: 'Applied', count: stats.totalApplications },
                                        { stage: 'Active', count: stats.active },
                                        { stage: 'Interviews', count: stats.interviews },
                                        { stage: 'Offers', count: stats.offers },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="stage" fontSize={12} />
                                        <YAxis fontSize={12} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3182CE" name="Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </>
                )}
            </VStack>

            <NewApplicationModal
                isOpen={isApplicationModalOpen}
                onClose={onApplicationModalClose}
                onResumeModalOpen={onResumeModalOpen}
                onApplicationAdded={handleApplicationAdded}
            />
            <NewResumeModal
                isOpen={isResumeModalOpen}
                onClose={onResumeModalClose}
            />
        </Container>
    );
}

export default DashboardPage;
