import {
    Container,
    Heading,
    SimpleGrid,
    Box,
    Text,
    VStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Select,
    HStack,
} from '@chakra-ui/react';

function AnalyticsPage() {
    return (
        <Container maxW="container.xl" py={8}>
            <VStack align="stretch" spacing={6}>
                <Box>
                    <Heading as="h2" size="xl" mb={2}>
                        Insights
                    </Heading>
                    <Text color="gray.600">
                        Detailed insights and visualizations of your job search data
                    </Text>
                </Box>

                <HStack spacing={4} justify="flex-end">
                    <Select maxW="200px" placeholder="Last 30 days">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                        <option value="all">All time</option>
                    </Select>
                </HStack>

                <Tabs colorScheme="brand" variant="enclosed">
                    <TabList>
                        <Tab>Overview</Tab>
                        <Tab>Timeline</Tab>
                        <Tab>Companies</Tab>
                        <Tab>Roles</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <VStack align="stretch" spacing={6} mt={4}>
                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                                    <Box p={6} bg="white" borderRadius="lg" boxShadow="md" minH="300px">
                                        <Heading as="h3" size="md" mb={4}>
                                            Application Status Distribution
                                        </Heading>
                                        <Box
                                            height="250px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg="gray.50"
                                            borderRadius="md"
                                        >
                                            <Text color="gray.500">
                                                Pie chart will be displayed here using Recharts
                                            </Text>
                                        </Box>
                                    </Box>

                                    <Box p={6} bg="white" borderRadius="lg" boxShadow="md" minH="300px">
                                        <Heading as="h3" size="md" mb={4}>
                                            Applications Over Time
                                        </Heading>
                                        <Box
                                            height="250px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg="gray.50"
                                            borderRadius="md"
                                        >
                                            <Text color="gray.500">
                                                Line chart will be displayed here using Recharts
                                            </Text>
                                        </Box>
                                    </Box>
                                </SimpleGrid>

                                <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                                    <Heading as="h3" size="md" mb={4}>
                                        Response Rate by Stage
                                    </Heading>
                                    <Box
                                        height="300px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        bg="gray.50"
                                        borderRadius="md"
                                    >
                                        <Text color="gray.500">
                                            Bar chart will be displayed here using Recharts
                                        </Text>
                                    </Box>
                                </Box>
                            </VStack>
                        </TabPanel>

                        <TabPanel>
                            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" mt={4}>
                                <Heading as="h3" size="md" mb={4}>
                                    Application Timeline
                                </Heading>
                                <Box
                                    height="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="gray.50"
                                    borderRadius="md"
                                >
                                    <Text color="gray.500">
                                        Timeline visualization will be displayed here
                                    </Text>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel>
                            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" mt={4}>
                                <Heading as="h3" size="md" mb={4}>
                                    Top Companies Applied
                                </Heading>
                                <Box
                                    height="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="gray.50"
                                    borderRadius="md"
                                >
                                    <Text color="gray.500">
                                        Company analytics will be displayed here
                                    </Text>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel>
                            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" mt={4}>
                                <Heading as="h3" size="md" mb={4}>
                                    Role Distribution
                                </Heading>
                                <Box
                                    height="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="gray.50"
                                    borderRadius="md"
                                >
                                    <Text color="gray.500">
                                        Role analytics will be displayed here
                                    </Text>
                                </Box>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Container>
    );
}

export default AnalyticsPage;
