import { Box, Container, Flex, Text } from '@chakra-ui/react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <Box bg="gray.100" color="gray.700" py={4} mt={12}>
            <Container maxW="container.xl">
                <Flex
                    justify="center"
                    align="center"
                    gap={1}
                    flexWrap="wrap"
                    textAlign="center"
                >
                    <Text fontSize="sm">
                        © {currentYear} Job Tracker. All rights reserved.
                    </Text>
                    <Text fontSize="sm">
                        (Built by GWU Students)
                    </Text>
                </Flex>
            </Container>
        </Box>
    );
}

export default Footer;
