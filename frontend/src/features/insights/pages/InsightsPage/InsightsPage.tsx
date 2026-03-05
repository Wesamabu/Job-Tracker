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

function InsightsPage() {
    return (
        <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 2, sm: 4 }}>
            <VStack align="stretch" spacing={6}>
                <Box>
                    <Heading as="h2" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Insights
                    </Heading>
                    <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                        Detailed insights and visualizations of your job search data
                    </Text>
                </Box>

                <HStack spacing={4} justify={{ base: 'stretch', sm: 'flex-end' }} w="full">
                    <Select
                        maxW={{ base: 'full', sm: '200px' }}
                        placeholder="Last 30 days"
                        size={{ base: 'sm', md: 'md' }}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                        <option value="all">All time</option>
                    </Select>
                </HStack>

                <Tabs colorScheme="brand" variant="enclosed">
                    <TabList
                        overflowX="auto"
                        overflowY="hidden"
                        sx={{
                            scrollbarWidth: 'thin',
                            '&::-webkit-scrollbar': {
                                height: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'gray.300',
                                borderRadius: '4px',
                            },
                        }}
                        flexWrap="nowrap"
                    >
                        <Tab fontSize={{ base: 'sm', md: 'md' }} whiteSpace="nowrap" flex="1" px={{ base: 2, md: 4 }}>Career Insights</Tab>
                        <Tab fontSize={{ base: 'sm', md: 'md' }} whiteSpace="nowrap" flex="1" px={{ base: 2, md: 4 }}>Skill Themes</Tab>
                        <Tab fontSize={{ base: 'sm', md: 'md' }} whiteSpace="nowrap" flex="1" px={{ base: 2, md: 4 }}>Resume Comparison</Tab>
                        <Tab fontSize={{ base: 'sm', md: 'md' }} whiteSpace="nowrap" flex="1" px={{ base: 2, md: 4 }}>Role Fit</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <VStack align="stretch" spacing={6} mt={4}>
                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                                    <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md" minH="300px">
                                        <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
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
                                            <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" px={2}>
                                                Pie chart will be displayed here using Recharts
                                            </Text>
                                        </Box>
                                    </Box>

                                    <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md" minH="300px">
                                        <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
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
                                            <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" px={2}>
                                                Line chart will be displayed here using Recharts
                                            </Text>
                                        </Box>
                                    </Box>
                                </SimpleGrid>

                                <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md">
                                    <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
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
                                        <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" px={2}>
                                            Bar chart will be displayed here using Recharts
                                        </Text>
                                    </Box>
                                </Box>
                            </VStack>
                        </TabPanel>

                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md" mt={4}>
                                <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                    Skill Themes
                                </Heading>
                                <Box
                                    height="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="gray.50"
                                    borderRadius="md"
                                >
                                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" px={2}>
                                        Timeline visualization will be displayed here
                                    </Text>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md" mt={4}>
                                <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                    Resume Comparison
                                </Heading>
                                <Box
                                    height="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="gray.50"
                                    borderRadius="md"
                                >
                                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" px={2}>
                                        Company insights will be displayed here
                                    </Text>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="md" mt={4}>
                                <Heading as="h3" size={{ base: 'sm', md: 'md' }} mb={4}>
                                    Role Fit
                                </Heading>
                                <Box
                                    height="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="gray.50"
                                    borderRadius="md"
                                >
                                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" px={2}>
                                        Role insights will be displayed here
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

export default InsightsPage;
