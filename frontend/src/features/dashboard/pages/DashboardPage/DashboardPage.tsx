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

function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen: isApplicationModalOpen, onOpen: onApplicationModalOpen, onClose: onApplicationModalClose } = useDisclosure();
    const { isOpen: isResumeModalOpen, onOpen: onResumeModalOpen, onClose: onResumeModalClose } = useDisclosure();

    // Sample resumes data - TODO: Replace with actual data from API
    const resumes = [
        { id: 1, name: 'Software Engineer Resume', format: 'PDF' },
        { id: 2, name: 'Full Stack Developer Resume', format: 'DOCX' },
        { id: 3, name: 'General Resume', format: 'PDF' },
    ];

    // TODO: Replace with actual data from API
    const stats = {
        totalApplications: 12,
        active: 7,
        interviews: 5,
        offers: 2,
    };

    // Sample data for bar chart - TODO: Replace with actual data from API
    const applicationsByMonth = [
        { month: 'Oct', applied: 12, interviews: 5, offers: 2 },
        { month: 'Nov', applied: 18, interviews: 8, offers: 3 },
        { month: 'Dec', applied: 15, interviews: 6, offers: 2 },
        { month: 'Jan', applied: 22, interviews: 10, offers: 4 },
        { month: 'Feb', applied: 20, interviews: 9, offers: 3 },
    ];

    const hasData = stats.totalApplications > 0;

    // Simulate loading - TODO: Remove this and use actual API loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const statCards = [
        {
            label: 'Total Applications',
            value: stats.totalApplications,
            helpText: 'All time',
            color: 'blue.500',
        },
        {
            label: 'Active',
            value: stats.active,
            helpText: 'In progress',
            color: 'green.500',
        },
        {
            label: 'Interviews',
            value: stats.interviews,
            helpText: 'Scheduled',
            color: 'purple.500',
        },
        {
            label: 'Offers',
            value: stats.offers,
            helpText: 'Received',
            color: 'orange.500',
        },
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

                {/* Stats Cards with Loading State */}
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
                                    <StatLabel color="gray.600" fontSize="sm">
                                        {card.label}
                                    </StatLabel>
                                    <StatNumber fontSize="3xl" fontWeight="bold">
                                        {card.value}
                                    </StatNumber>
                                    <StatHelpText color="gray.500" fontSize="xs">
                                        {card.helpText}
                                    </StatHelpText>
                                </Stat>
                            )}
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Empty State or Content */}
                {!isLoading && !hasData ? (
                    <Box
                        p={{ base: 8, md: 12 }}
                        bg="white"
                        borderRadius="lg"
                        boxShadow="md"
                        textAlign="center"
                    >
                        <VStack spacing={4}>
                            <Icon as={AddIcon} boxSize={12} color="gray.400" />
                            <Heading size={{ base: 'sm', md: 'md' }} color="gray.700">
                                Welcome to Job Tracker!
                            </Heading>
                            <Text color="gray.600" maxW="md" fontSize={{ base: 'sm', md: 'md' }}>
                                Start by adding your first job application or uploading your resume.
                                Track your progress and get insights as you go!
                            </Text>
                            <HStack spacing={4} mt={4} flexWrap="wrap" justify="center">
                                <Button
                                    onClick={onApplicationModalOpen}
                                    leftIcon={<AddIcon />}
                                    colorScheme="brand"
                                    size={{ base: 'sm', md: 'md' }}
                                >
                                    Add First Application
                                </Button>
                                <Button
                                    onClick={onResumeModalOpen}
                                    leftIcon={<MdFileUpload size="1.25em" />}
                                    variant="outline"
                                    colorScheme="brand"
                                    size={{ base: 'sm', md: 'md' }}
                                >
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
                                    Recent Activity
                                </Heading>
                                <Divider mb={4} />
                                {isLoading ? (
                                    <VStack align="stretch" spacing={3}>
                                        <SkeletonText noOfLines={2} spacing={2} />
                                        <SkeletonText noOfLines={2} spacing={2} />
                                    </VStack>
                                ) : (
                                    <VStack align="stretch" spacing={3}>
                                        <Box p={3} bg="gray.50" borderRadius="md">
                                            <Text fontSize="sm" color="gray.600">
                                                No recent activity yet
                                            </Text>
                                        </Box>
                                    </VStack>
                                )}
                            </Box>

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
                                            <Text fontSize="sm" color="gray.600">
                                                Response Rate
                                            </Text>
                                            <Text fontSize="sm" fontWeight="bold">
                                                35%
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">
                                                Interview Rate
                                            </Text>
                                            <Text fontSize="sm" fontWeight="bold">
                                                42%
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">
                                                Offer Rate
                                            </Text>
                                            <Text fontSize="sm" fontWeight="bold">
                                                17%
                                            </Text>
                                        </HStack>
                                    </VStack>
                                )}
                            </Box>
                        </SimpleGrid>

                        <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md">
                            <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                Application Trends (Monthly)
                            </Heading>
                            <Divider mb={4} />
                            {isLoading ? (
                                <Skeleton height="300px" borderRadius="md" />
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={applicationsByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip />
                                        <Legend
                                            wrapperStyle={{
                                                paddingTop: '10px',
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                justifyContent: 'center',
                                                gap: '8px',
                                            }}
                                            iconSize={14}
                                        />
                                        <Bar dataKey="applied" fill="#3182CE" name="Applied" />
                                        <Bar dataKey="interviews" fill="#805AD5" name="Interviews" />
                                        <Bar dataKey="offers" fill="#DD6B20" name="Offers" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </>
                )}
            </VStack>

            {/* Shared Modal Components */}
            <NewApplicationModal
                isOpen={isApplicationModalOpen}
                onClose={onApplicationModalClose}
                resumes={resumes}
                onResumeModalOpen={onResumeModalOpen}
            />
            <NewResumeModal
                isOpen={isResumeModalOpen}
                onClose={onResumeModalClose}
            />
        </Container>
    );
}

export default DashboardPage;
