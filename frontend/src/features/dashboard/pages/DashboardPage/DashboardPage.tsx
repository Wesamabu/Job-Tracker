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
    Skeleton,
    SkeletonText,
    Flex,
} from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
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
    useEffect(() => {
        setIsLoading(true);
        dashboardService.getStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

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
                            <Heading size={{ base: 'sm', md: 'md' }} color="gray.700">
                                Welcome to Job Tracker!
                            </Heading>
                            <Text color="gray.600" maxW="md" fontSize={{ base: 'sm', md: 'md' }}>
                                Head to the Applications page to start tracking your job applications.
                            </Text>
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

        </Container>
    );
}

export default DashboardPage;
