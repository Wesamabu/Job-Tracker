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
} from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardPage() {
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
        <Container maxW="container.xl" py={8}>
            <VStack align="stretch" spacing={8}>
                <Box>
                    <Heading as="h2" size="xl" mb={2}>
                        Dashboard
                    </Heading>
                    <Text color="gray.600">
                        Overview of your job application activity
                    </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    {statCards.map((card) => (
                        <Box
                            key={card.label}
                            p={6}
                            bg="white"
                            borderRadius="lg"
                            boxShadow="md"
                            borderTop="4px solid"
                            borderTopColor={card.color}
                            transition="all 0.2s"
                            _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                        >
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
                        </Box>
                    ))}
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                        <Heading as="h3" size="md" mb={4}>
                            Recent Activity
                        </Heading>
                        <Divider mb={4} />
                        <VStack align="stretch" spacing={3}>
                            <Box p={3} bg="gray.50" borderRadius="md">
                                <Text fontSize="sm" color="gray.600">
                                    No recent activity yet
                                </Text>
                            </Box>
                        </VStack>
                    </Box>

                    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                        <Heading as="h3" size="md" mb={4}>
                            Quick Stats
                        </Heading>
                        <Divider mb={4} />
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
                    </Box>
                </SimpleGrid>

                <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                    <Heading as="h3" size="md" mb={4}>
                        Application Trends (Monthly)
                    </Heading>
                    <Divider mb={4} />
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={applicationsByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="applied" fill="#3182CE" name="Applied" />
                            <Bar dataKey="interviews" fill="#805AD5" name="Interviews" />
                            <Bar dataKey="offers" fill="#DD6B20" name="Offers" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </VStack>
        </Container>
    );
}

export default DashboardPage;
