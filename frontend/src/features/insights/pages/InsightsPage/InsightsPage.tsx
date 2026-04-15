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
    Select,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAutoAwesome, MdLightbulb, MdFilterAltOff, MdWorkOutline } from 'react-icons/md';
import { Pagination } from '@/shared/components/Pagination';
import { insightsService, getFitLevelFromPercent } from '../../services/insights.service';
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
    const navigate = useNavigate();
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
    const [skillFilter, setSkillFilter] = useState<'match' | 'matchAsc' | 'alphabetic' | 'weak' | 'moderate' | 'good' | 'excellent'>('match');
    const [skillCurrentPage, setSkillCurrentPage] = useState(1);
    const [skillItemsPerPage, setSkillItemsPerPage] = useState(20);

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
    const [roleFitFilter, setRoleFitFilter] = useState<'match' | 'matchAsc' | 'alphabetic' | 'weak' | 'moderate' | 'good' | 'excellent'>('match');
    const [roleFitCurrentPage, setRoleFitCurrentPage] = useState(1);
    const [roleFitItemsPerPage, setRoleFitItemsPerPage] = useState(20);

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

    const filteredSkills = useMemo(() => {
        const skills = [...(skillThemes?.skills ?? [])];

        if (skillFilter === 'alphabetic') {
            return skills.sort((a, b) => a.skill.localeCompare(b.skill));
        }

        if (skillFilter === 'matchAsc') {
            return skills.sort((a, b) => a.matchPercentage - b.matchPercentage);
        }

        if (skillFilter !== 'match') {
            const targetLevel = skillFilter.charAt(0).toUpperCase() + skillFilter.slice(1);
            return skills
                .filter((item) => getFitLevelFromPercent(item.matchPercentage).level === targetLevel)
                .sort((a, b) => b.matchPercentage - a.matchPercentage);
        }

        return skills.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }, [skillThemes?.skills, skillFilter]);

    const totalSkillItems = filteredSkills.length;
    const skillTotalPages = Math.max(1, Math.ceil(totalSkillItems / skillItemsPerPage));
    const safeSkillPage = Math.min(skillCurrentPage, skillTotalPages);
    const skillStartIndex = (safeSkillPage - 1) * skillItemsPerPage;
    const skillEndIndex = skillStartIndex + skillItemsPerPage;

    const paginatedSkills = useMemo(
        () => filteredSkills.slice(skillStartIndex, skillEndIndex),
        [filteredSkills, skillStartIndex, skillEndIndex]
    );

    useEffect(() => {
        if (safeSkillPage !== skillCurrentPage) {
            setSkillCurrentPage(safeSkillPage);
        }
    }, [safeSkillPage, skillCurrentPage]);

    const filteredRoles = useMemo(() => {
        const roles = [...(roleFit?.roles ?? [])];

        if (roleFitFilter === 'alphabetic') {
            return roles.sort((a, b) => a.category.localeCompare(b.category));
        }

        if (roleFitFilter === 'matchAsc') {
            return roles.sort((a, b) => a.score - b.score);
        }

        if (roleFitFilter !== 'match') {
            const targetLevel = roleFitFilter.charAt(0).toUpperCase() + roleFitFilter.slice(1);
            return roles
                .filter((item) => item.fitLevel === targetLevel)
                .sort((a, b) => b.score - a.score);
        }

        return roles.sort((a, b) => b.score - a.score);
    }, [roleFit?.roles, roleFitFilter]);

    const totalRoleItems = filteredRoles.length;
    const roleTotalPages = Math.max(1, Math.ceil(totalRoleItems / roleFitItemsPerPage));
    const safeRolePage = Math.min(roleFitCurrentPage, roleTotalPages);
    const roleStartIndex = (safeRolePage - 1) * roleFitItemsPerPage;
    const roleEndIndex = roleStartIndex + roleFitItemsPerPage;

    const paginatedRoles = useMemo(
        () => filteredRoles.slice(roleStartIndex, roleEndIndex),
        [filteredRoles, roleStartIndex, roleEndIndex]
    );

    useEffect(() => {
        if (safeRolePage !== roleFitCurrentPage) {
            setRoleFitCurrentPage(safeRolePage);
        }
    }, [safeRolePage, roleFitCurrentPage]);

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
                                    <>
                                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs" alignSelf="flex-start">
                                            Career Report
                                        </Badge>
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
                                                <VStack align="stretch" spacing={2}>
                                                    {renderMarkdown(summary)}
                                                </VStack>
                                            </Box>
                                            </Box>
                                        </Box>
                                    </>
                                )}

                                {!isLoading && !error && !summary && (
                                    <Box
                                        p={{ base: 6, md: 8 }}
                                        bg="gray.50"
                                        borderRadius="xl"
                                        borderWidth="1px"
                                        borderColor="gray.200"
                                        textAlign="center"
                                    >
                                        <Icon as={MdLightbulb} color="gray.400" boxSize={7} mb={2} />
                                        <Text color="gray.600" fontSize="sm" textAlign="center" maxW="320px" mx="auto">
                                            Add your first job application to get personalized career insights.
                                        </Text>
                                        <Button
                                            mt={3}
                                            size="sm"
                                            colorScheme="brand"
                                            onClick={() => navigate('/applications')}
                                        >
                                            Go to Applications
                                        </Button>
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

                                {!isLoadingSkills && !skillError && skillThemes && skillThemes.skills.length > 0 && (
                                    <>
                                        <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexDirection={{ base: 'column', md: 'row' }} spacing={1}>
                                            <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">
                                                Skill Match Breakdown
                                            </Badge>
                                            <HStack spacing={2}>
                                                <Select
                                                    size="sm"
                                                    w={{ base: '170px', md: '210px' }}
                                                    value={skillFilter}
                                                    onChange={(e) => {
                                                        setSkillFilter(e.target.value as 'match' | 'matchAsc' | 'alphabetic' | 'weak' | 'moderate' | 'good' | 'excellent');
                                                        setSkillCurrentPage(1);
                                                    }}
                                                    bg="white"
                                                >
                                                    <option value="match">Match (High to Low)</option>
                                                    <option value="matchAsc">Match (Low to High)</option>
                                                    <option value="alphabetic">Alphabetic (A-Z)</option>
                                                    <option value="weak">Weak</option>
                                                    <option value="moderate">Moderate</option>
                                                    <option value="good">Good</option>
                                                    <option value="excellent">Excellent</option>
                                                </Select>
                                            </HStack>
                                        </HStack>

                                        {totalSkillItems === 0 ? (
                                            <Box
                                                p={{ base: 6, md: 8 }}
                                                bg="gray.50"
                                                borderRadius="xl"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                textAlign="center"
                                            >
                                                <Icon as={MdFilterAltOff} color="gray.400" boxSize={7} mb={2} />
                                                <Text fontSize="sm" color="gray.600">
                                                    No skills match this filter.
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" mt={1}>
                                                    Try a different filter to view available skill matches.
                                                </Text>
                                            </Box>
                                        ) : (
                                            <>
                                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                                                    {paginatedSkills.map((item, i) => (
                                                        (() => {
                                                            const scorePercent = Math.round(item.matchPercentage);
                                                            const { level: fitLevel, color } = getFitLevelFromPercent(scorePercent);

                                                            return (
                                                                <Box
                                                                    key={`${item.skill}-${i}`}
                                                                    p={4}
                                                                    bg="linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                                                                    borderRadius="xl"
                                                                    boxShadow="sm"
                                                                    borderWidth="1px"
                                                                    borderColor="gray.100"
                                                                    transition="all 0.2s"
                                                                    _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                                                                >
                                                                    <HStack justify="space-between" mb={3}>
                                                                        <Text fontWeight="600" fontSize="sm" color="gray.800" textTransform="capitalize">
                                                                            {item.skill}
                                                                        </Text>
                                                                        <Badge
                                                                            colorScheme={color}
                                                                            borderRadius="full"
                                                                            px={2}
                                                                            fontSize="xs"
                                                                        >
                                                                            {fitLevel}
                                                                        </Badge>
                                                                    </HStack>
                                                                    <Box position="relative" pt={4}>
                                                                        <Text
                                                                            position="absolute"
                                                                            top="0"
                                                                            left={`clamp(0%, calc(${scorePercent}% - 16px), calc(100% - 32px))`}
                                                                            fontSize="10px"
                                                                            fontWeight="700"
                                                                            color="gray.700"
                                                                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                                                                        >
                                                                            {scorePercent}%
                                                                        </Text>
                                                                        <Progress
                                                                            value={scorePercent}
                                                                            size="sm"
                                                                            colorScheme={color}
                                                                            borderRadius="full"
                                                                            bg="gray.100"
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })()
                                                    ))}
                                                </SimpleGrid>

                                                <Pagination
                                                    currentPage={safeSkillPage}
                                                    setCurrentPage={setSkillCurrentPage}
                                                    itemsPerPage={skillItemsPerPage}
                                                    setItemsPerPage={setSkillItemsPerPage}
                                                    totalItems={totalSkillItems}
                                                    totalPages={skillTotalPages}
                                                    startIndex={skillStartIndex}
                                                    endIndex={skillEndIndex}
                                                />
                                            </>
                                        )}

                                    </>
                                )}

                                {!isLoadingSkills && !skillError && (!skillThemes || skillThemes.skills.length === 0) && (
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

                                {!isLoadingRoleFit && !roleFitError && roleFit && roleFit.roles.length > 0 && (
                                    <>
                                        <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexDirection={{ base: 'column', md: 'row' }} spacing={1}>
                                            <Badge colorScheme="purple" borderRadius="full" px={3} py={1} fontSize="xs">
                                                Resume Fit by Role
                                            </Badge>
                                            <HStack spacing={2}>
                                                <Select
                                                    size="sm"
                                                    w={{ base: '170px', md: '210px' }}
                                                    value={roleFitFilter}
                                                    onChange={(e) => {
                                                        setRoleFitFilter(e.target.value as 'match' | 'matchAsc' | 'alphabetic' | 'weak' | 'moderate' | 'good' | 'excellent');
                                                        setRoleFitCurrentPage(1);
                                                    }}
                                                    bg="white"
                                                >
                                                    <option value="match">Match (High to Low)</option>
                                                    <option value="matchAsc">Match (Low to High)</option>
                                                    <option value="alphabetic">Alphabetic (A-Z)</option>
                                                    <option value="weak">Weak</option>
                                                    <option value="moderate">Moderate</option>
                                                    <option value="good">Good</option>
                                                    <option value="excellent">Excellent</option>
                                                </Select>
                                            </HStack>
                                        </HStack>

                                        {totalRoleItems === 0 ? (
                                            <Box
                                                p={{ base: 6, md: 8 }}
                                                bg="gray.50"
                                                borderRadius="xl"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                textAlign="center"
                                            >
                                                <Icon as={MdFilterAltOff} color="gray.400" boxSize={7} mb={2} />
                                                <Text fontSize="sm" color="gray.600">
                                                    No roles match this filter.
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" mt={1}>
                                                    Try a different filter to view available role matches.
                                                </Text>
                                            </Box>
                                        ) : (<>

                                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                                            {paginatedRoles.map((role, i) => {
                                                const scorePercent = Math.round(role.score * 100);
                                                const { color } = getFitLevelFromPercent(scorePercent);
                                                return (
                                                    <Box
                                                        key={`${role.category}-${i}`}
                                                        p={4}
                                                        bg="linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                                                        borderRadius="xl"
                                                        boxShadow="sm"
                                                        borderWidth="1px"
                                                        borderColor="gray.100"
                                                        transition="all 0.2s"
                                                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                                                    >
                                                        <HStack justify="space-between" mb={3}>
                                                            <Text fontWeight="600" fontSize="sm" color="gray.800" textTransform="capitalize">
                                                                {role.category}
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
                                                        <Box position="relative" pt={4}>
                                                            <Text
                                                                position="absolute"
                                                                top="0"
                                                                left={`clamp(0%, calc(${scorePercent}% - 16px), calc(100% - 32px))`}
                                                                fontSize="10px"
                                                                fontWeight="700"
                                                                color="gray.700"
                                                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                                                            >
                                                                {scorePercent}%
                                                            </Text>
                                                            <Progress
                                                                value={scorePercent}
                                                                size="sm"
                                                                colorScheme={color}
                                                                borderRadius="full"
                                                                bg="gray.100"
                                                            />
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </SimpleGrid>

                                        <Pagination
                                            currentPage={safeRolePage}
                                            setCurrentPage={setRoleFitCurrentPage}
                                            itemsPerPage={roleFitItemsPerPage}
                                            setItemsPerPage={setRoleFitItemsPerPage}
                                            totalItems={totalRoleItems}
                                            totalPages={roleTotalPages}
                                            startIndex={roleStartIndex}
                                            endIndex={roleEndIndex}
                                        />

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
                                        </>)}
                                    </>
                                )}

                                {!isLoadingRoleFit && !roleFitError && (!roleFit || roleFit.roles.length === 0) && (
                                    <Box
                                        p={{ base: 6, md: 8 }}
                                        bg="gray.50"
                                        borderRadius="xl"
                                        borderWidth="1px"
                                        borderColor="gray.200"
                                        textAlign="center"
                                    >
                                        <Icon as={MdWorkOutline} color="gray.400" boxSize={7} mb={2} />
                                        <Text color="gray.600" fontSize="sm" textAlign="center" maxW="320px" mx="auto">
                                            Add job applications to discover how well your resume fits each role category.
                                        </Text>
                                        <Button
                                            mt={3}
                                            size="sm"
                                            colorScheme="brand"
                                            onClick={() => navigate('/applications')}
                                        >
                                            Go to Applications
                                        </Button>
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

