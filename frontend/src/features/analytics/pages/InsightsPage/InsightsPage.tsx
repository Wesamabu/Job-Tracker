import { Container, Heading, Box, Text } from '@chakra-ui/react';

function InsightsPage() {
    return (
        <Container maxW="container.xl" py={8}>
            <Heading as="h2" size="xl" mb={6}>
                Insights
            </Heading>
            <Box p={6} bg="gray.50" borderRadius="md">
                <Text>Insights and analytics interface will be built here.</Text>
                <Text mt={2} fontSize="sm" color="gray.600">
                    Features: Career insights, skill analysis, role recommendations, job market trends
                </Text>
            </Box>
        </Container>
    );
}

export default InsightsPage;
