import {
    Container,
    Heading,
    Box,
    Text,
    VStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    Spinner,
    Alert,
    AlertIcon,
    Button,
    Badge,
    Divider,
    Flex,
    Icon,
    SimpleGrid,
    Progress,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { MdAutoAwesome, MdRefresh, MdTrendingUp, MdLightbulb } from 'react-icons/md';
import { insightsService } from '../../services/insights.service';
import type { SkillThemesData, RoleFitData } from '../../types';

function renderInline(text: string) {
    // Split on **bold** and "quoted" spans
    return text.split(/(\*\*[^*]+\*\*|"[^"]+")/g).map((part, j) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) return <strong key={j}>{bold[1]}</strong>;
        const quoted = part.match(/^"(.+)"$/);
        if (quoted) return (
            <Box
                as="span"
                key={j}
                display="inline"
                bg="brand.50"
                color="brand.700"
                fontFamily="mono"
                fontSize="0.85em"
                px={1}
                py="1px"
                borderRadius="md"
                borderWidth="1px"
                borderColor="brand.200"
            >
                "{quoted[1]}"
            </Box>
        );
        return part;
    });
}

function renderMarkdown(text: string) {
    return text.split('\n').map((line, i) => {
        const boldHeading = line.match(/^\*\*(.*)\*\*$/);
        if (boldHeading) {
            return (
                <Box key={i} mt={i === 0 ? 0 : 6}>
                    <HStack spacing={2} mb={2}>
                        <Box w="3px" h="18px" bg="brand.500" borderRadius="full" />
                        <Text fontWeight="700" fontSize={{ base: 'sm', md: 'md' }} color="brand.600" letterSpacing="tight">
                            {boldHeading[1]}
                        </Text>
                    </HStack>
                    <Divider borderColor="brand.100" />
                </Box>
            );
        }
        if (line.trim() === '') {
            return <Box key={i} h={1} />;
        }
        const numberedItem = line.match(/^(\d+)\.\s+(.*)/);
        if (numberedItem) {
            return (
                <HStack key={i} align="start" spacing={3} pl={2} mt={2}>
                    <Flex
                        minW="22px"
                        h="22px"
                        bg="brand.500"
                        borderRadius="full"
                        align="center"
                        justify="center"
                        flexShrink={0}
                        mt="1px"
                    >
                        <Text fontSize="10px" color="white" fontWeight="bold">
                            {numberedItem[1]}
                        </Text>
                    </Flex>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.700" lineHeight="tall">
                        {renderInline(numberedItem[2])}
                    </Text>
                </HStack>
            );
        }
        return (
            <Text key={i} fontSize={{ base: 'xs', md: 'sm' }} color="gray.700" lineHeight="tall" pl={1}>
                {renderInline(line)}
            </Text>
        );
    });
}

function InsightsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchCareerInsights = () => {
        setIsLoading(true);
        setError(null);
        insightsService
            .getCareerInsights()
            .then((data) => setSummary(data.summary))
            .catch(() => setError('Failed to load career insights. Please try again.'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchCareerInsights();
    }, []);

    const [isLoadingSkills, setIsLoadingSkills] = useState(false);
    const [skillThemes, setSkillThemes] = useState<SkillThemesData | null>(null);
    const [skillError, setSkillError] = useState<string | null>(null);

    const fetchSkillThemes = () => {
        setIsLoadingSkills(true);
        setSkillError(null);
        insightsService
            .getSkillThemes()
            .then((data) => setSkillThemes(data))
            .catch(() => setSkillError('Failed to load skill themes. Please try again.'))
            .finally(() => setIsLoadingSkills(false));
    };

    const [isLoadingRoleFit, setIsLoadingRoleFit] = useState(false);
    const [roleFit, setRoleFit] = useState<RoleFitData | null>(null);
    const [roleFitError, setRoleFitError] = useState<string | null>(null);

    const fetchRoleFit = () => {
        setIsLoadingRoleFit(true);
        setRoleFitError(null);
        insightsService
            .getRoleFit()
            .then((data) => setRoleFit(data))
            .catch(() => setRoleFitError('Failed to load role fit data. Please try again.'))
            .finally(() => setIsLoadingRoleFit(false));
    };

    useEffect(() => {
        fetchSkillThemes();
        fetchRoleFit();
    }, []);

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
                        <Tab fontSize={{ base: 'sm', md: 'md' }} whiteSpace="nowrap" flex="1" px={{ base: 2, md: 4 }}>Role Fit</Tab>
                    </TabList>

                    <TabPanels>
                        {/* Career Insights Tab */}
                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <VStack align="stretch" spacing={5} mt={4}>

                                <Flex justify="flex-end">
                                    <Button
                                        size="sm"
                                        colorScheme="brand"
                                        variant="outline"
                                        leftIcon={<Icon as={MdRefresh} />}
                                        isLoading={isLoading}
                                        onClick={fetchCareerInsights}
                                        fontWeight="600"
                                    >
                                        Refresh
                                    </Button>
                                </Flex>

                                {error && (
                                    <Alert status="error" borderRadius="lg">
                                        <AlertIcon />
                                        {error}
                                    </Alert>
                                )}

                                {isLoading && (
                                    <Box
                                        p={{ base: 6, md: 10 }}
                                        bg="white"
                                        borderRadius="xl"
                                        boxShadow="md"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.400"
                                        minH="300px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="column"
                                        gap={4}
                                    >
                                        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.8s" />
                                        <Text color="gray.500" fontSize="sm" fontStyle="italic">
                                            Analyzing your job search data…
                                        </Text>
                                    </Box>
                                )}

                                {!isLoading && !error && summary && (
                                    <Box
                                        p={{ base: 5, md: 7 }}
                                        bg="white"
                                        borderRadius="xl"
                                        boxShadow="0 -4px 12px -2px rgba(33, 150, 243, 0.15), 0 4px 12px -2px rgba(0,0,0,0.08)"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.500"
                                        position="sticky"
                                        top="80px"
                                        maxH="calc(100vh - 100px)"
                                        overflowY="auto"
                                        sx={{
                                            scrollbarWidth: 'thin',
                                            '&::-webkit-scrollbar': { width: '4px' },
                                            '&::-webkit-scrollbar-thumb': { background: 'var(--chakra-colors-brand-200)', borderRadius: '4px' },
                                        }}
                                    >
                                        <Box position="relative" overflow="hidden">
                                        <Box
                                            position="absolute"
                                            top={0}
                                            right={0}
                                            w="120px"
                                            h="120px"
                                            bg="brand.50"
                                            borderRadius="full"
                                            transform="translate(40px, -40px)"
                                            zIndex={0}
                                        />
                                        <Box position="relative" zIndex={1}>
                                            <HStack mb={4} spacing={2}>
                                                <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">
                                                    Career Report
                                                </Badge>
                                            </HStack>
                                            <VStack align="stretch" spacing={2}>
                                                {renderMarkdown(summary)}
                                            </VStack>
                                        </Box>
                                        </Box>
                                    </Box>
                                )}

                                {!isLoading && !error && !summary && (
                                    <Box
                                        p={{ base: 6, md: 10 }}
                                        bg="brand.50"
                                        borderRadius="xl"
                                        boxShadow="md"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.300"
                                        minH="200px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="column"
                                        gap={3}
                                    >
                                        <Icon as={MdAutoAwesome} color="brand.400" boxSize={8} />
                                        <Text color="gray.600" fontSize="sm" textAlign="center" maxW="320px">
                                            Add your first job application to get personalized career insights.
                                        </Text>
                                    </Box>
                                )}

                            </VStack>
                        </TabPanel>

                        {/* Skill Themes Tab */}
                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <VStack align="stretch" spacing={5} mt={4}>
                                {skillError && (
                                    <Alert status="error" borderRadius="lg">
                                        <AlertIcon />
                                        {skillError}
                                    </Alert>
                                )}

                                {isLoadingSkills && (
                                    <Box
                                        p={{ base: 6, md: 10 }}
                                        bg="white"
                                        borderRadius="xl"
                                        boxShadow="md"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.400"
                                        minH="300px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="column"
                                        gap={4}
                                    >
                                        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.8s" />
                                        <Text color="gray.500" fontSize="sm" fontStyle="italic">
                                            Analyzing skill demand across your applications…
                                        </Text>
                                    </Box>
                                )}

                                {!isLoadingSkills && !skillError && skillThemes && (
                                    <>
                                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                                            {skillThemes.skills.map((item, i) => (
                                                <Box
                                                    key={i}
                                                    p={4}
                                                    bg="white"
                                                    borderRadius="xl"
                                                    boxShadow="sm"
                                                    borderTop="3px solid"
                                                    borderTopColor={
                                                        item.demandLevel === 'High' ? 'red.400'
                                                        : item.demandLevel === 'Medium' ? 'orange.400'
                                                        : 'gray.300'
                                                    }
                                                    transition="all 0.2s"
                                                    _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                                                >
                                                    <Text fontWeight="600" fontSize="sm" color="gray.800" mb={3} lineHeight="short">
                                                        {item.skill}
                                                    </Text>
                                                    <VStack align="stretch" spacing={2}>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="xs" color="gray.500">Demand</Text>
                                                            <Badge
                                                                colorScheme={item.demandLevel === 'High' ? 'red' : item.demandLevel === 'Medium' ? 'orange' : 'gray'}
                                                                borderRadius="full"
                                                                px={2}
                                                                fontSize="xs"
                                                            >
                                                                {item.demandLevel}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="xs" color="gray.500">Your Fit</Text>
                                                            <Badge
                                                                colorScheme={item.yourAlignment === 'Strong' ? 'green' : item.yourAlignment === 'Moderate' ? 'yellow' : 'red'}
                                                                borderRadius="full"
                                                                px={2}
                                                                fontSize="xs"
                                                            >
                                                                {item.yourAlignment}
                                                            </Badge>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            ))}
                                        </SimpleGrid>

                                        {skillThemes.improvementTips.length > 0 && (
                                            <Box
                                                p={{ base: 4, md: 6 }}
                                                bg="white"
                                                borderRadius="xl"
                                                boxShadow="sm"
                                                borderLeft="4px solid"
                                                borderLeftColor="orange.400"
                                            >
                                                <HStack mb={3} spacing={2}>
                                                    <Icon as={MdTrendingUp} color="orange.500" boxSize={5} />
                                                    <Text fontWeight="700" fontSize="sm" color="orange.700">
                                                        Improvement Tips
                                                    </Text>
                                                </HStack>
                                                <VStack align="stretch" spacing={2}>
                                                    {skillThemes.improvementTips.map((tip, i) => (
                                                        <HStack key={i} align="start" spacing={3}>
                                                            <Flex
                                                                minW="20px"
                                                                h="20px"
                                                                bg="orange.100"
                                                                borderRadius="full"
                                                                align="center"
                                                                justify="center"
                                                                flexShrink={0}
                                                                mt="1px"
                                                            >
                                                                <Text fontSize="10px" color="orange.600" fontWeight="bold">
                                                                    {i + 1}
                                                                </Text>
                                                            </Flex>
                                                            <Text fontSize="sm" color="gray.700" lineHeight="tall">
                                                                {tip}
                                                            </Text>
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        )}
                                    </>
                                )}

                                {!isLoadingSkills && !skillError && !skillThemes && (
                                    <Box
                                        p={{ base: 6, md: 10 }}
                                        bg="brand.50"
                                        borderRadius="xl"
                                        boxShadow="md"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.300"
                                        minH="200px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="column"
                                        gap={3}
                                    >
                                        <Icon as={MdAutoAwesome} color="brand.400" boxSize={8} />
                                        <Text color="gray.600" fontSize="sm" textAlign="center" maxW="320px">
                                            Add job applications with descriptions to get skill gap analysis.
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                        </TabPanel>

                        {/* Role Fit Tab */}
                        <TabPanel px={{ base: 0, sm: 4 }}>
                            <VStack align="stretch" spacing={5} mt={4}>
                                {roleFitError && (
                                    <Alert status="error" borderRadius="lg">
                                        <AlertIcon />
                                        {roleFitError}
                                    </Alert>
                                )}

                                {isLoadingRoleFit && (
                                    <Box
                                        p={{ base: 6, md: 10 }}
                                        bg="white"
                                        borderRadius="xl"
                                        boxShadow="md"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.400"
                                        minH="300px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="column"
                                        gap={4}
                                    >
                                        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.8s" />
                                        <Text color="gray.500" fontSize="sm" fontStyle="italic">
                                            Scoring resume fit for your applied roles…
                                        </Text>
                                    </Box>
                                )}

                                {!isLoadingRoleFit && !roleFitError && roleFit && (
                                    <>
                                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                            {roleFit.roles.map((role, i) => {
                                                const fitColorMap: Record<string, string> = {
                                                    Excellent: 'green',
                                                    Good: 'teal',
                                                    Moderate: 'yellow',
                                                    Weak: 'red',
                                                };
                                                const color = fitColorMap[role.fitLevel] ?? 'gray';
                                                const scorePercent = Math.round(role.score * 100);
                                                return (
                                                    <Box key={i} p={4} bg="white" borderRadius="xl" boxShadow="sm">
                                                        <HStack justify="space-between" mb={3}>
                                                            <Text fontWeight="600" fontSize="sm" color="gray.800">
                                                                {role.category}
                                                            </Text>
                                                            <HStack spacing={2}>
                                                                <Text fontSize="xs" color="gray.500" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                                                    {scorePercent}%
                                                                </Text>
                                                                <Badge
                                                                    colorScheme={color}
                                                                    borderRadius="full"
                                                                    px={2}
                                                                    fontSize="xs"
                                                                >
                                                                    {role.fitLevel}
                                                                </Badge>
                                                            </HStack>
                                                        </HStack>
                                                        <Progress
                                                            value={scorePercent}
                                                            size="sm"
                                                            colorScheme={color}
                                                            borderRadius="full"
                                                            bg="gray.100"
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </SimpleGrid>

                                        {roleFit.quickInsight && (
                                            <Box
                                                p={{ base: 4, md: 6 }}
                                                bg="white"
                                                borderRadius="xl"
                                                boxShadow="sm"
                                                borderLeft="4px solid"
                                                borderLeftColor="brand.400"
                                            >
                                                <HStack mb={3} spacing={2}>
                                                    <Icon as={MdLightbulb} color="brand.500" boxSize={5} />
                                                    <Text fontWeight="700" fontSize="sm" color="brand.700">
                                                        Quick Insight
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.700">{roleFit.quickInsight}</Text>
                                            </Box>
                                        )}
                                    </>
                                )}

                                {!isLoadingRoleFit && !roleFitError && !roleFit && (
                                    <Box
                                        p={{ base: 6, md: 10 }}
                                        bg="brand.50"
                                        borderRadius="xl"
                                        boxShadow="md"
                                        borderLeft="4px solid"
                                        borderLeftColor="brand.300"
                                        minH="200px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexDirection="column"
                                        gap={3}
                                    >
                                        <Icon as={MdAutoAwesome} color="brand.400" boxSize={8} />
                                        <Text color="gray.600" fontSize="sm" textAlign="center" maxW="320px">
                                            Add job applications to discover how well your resume fits each role category.
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Container>
    );
}

export default InsightsPage;

